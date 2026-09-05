#!/usr/bin/env node
/**
 * Reprise des fiches de paie enregistrées avant la correction du calcul.
 *
 *   npm run repair-payrolls                 # simulation, n'écrit rien
 *   npm run repair-payrolls -- --confirm
 *
 * Deux défauts affectaient les fiches existantes :
 *
 *   1. Le net retranchait la part patronale (charge de l'employeur) au lieu des
 *      retenues du salarié. Sur un brut de 500 000 FCFA, la base enregistrait
 *      425 000 quand le bulletin PDF remis au salarié affichait 393 325.
 *   2. La décomposition (brut, CNPS, CMU, ITS) n'était stockée nulle part et
 *      était reconstituée différemment par chaque consommateur.
 *
 * Le recalcul rapproche donc la base du bulletin déjà remis : c'est le PDF qui
 * avait raison. Les montants ne sont pas inventés, ils sont recalculés à partir
 * des éléments variables du mois — salaire de base, primes, heures
 * supplémentaires, absences, retenues — qui, eux, sont bien enregistrés.
 *
 * Les fiches déjà signées sont traitées comme les autres et signalées à part :
 * leur signature portait sur un PDF dont le net était correct, le recalcul les
 * met en accord avec lui.
 */

const prisma = require('../prismaClient');
const { calculerPaie } = require('../lib/paie');

const confirme = process.argv.includes('--confirm');
const fcfa = (x) => new Intl.NumberFormat('fr-FR').format(Math.round(x));

async function main() {
    const fiches = await prisma.payroll.findMany({
        orderBy: { period: 'desc' },
        include: { employee: { select: { firstName: true, lastName: true } } }
    });

    if (fiches.length === 0) {
        console.log('\nAucune fiche de paie en base.\n');
        return;
    }

    const aCorriger = [];
    for (const f of fiches) {
        const calcul = calculerPaie(f);
        const ecart = calcul.netSalary - (f.netSalary || 0);
        const detailManquant = f.grossSalary == null;
        // Un écart d'un franc relève de l'arrondi, pas du défaut.
        if (Math.abs(ecart) >= 1 || detailManquant) {
            aCorriger.push({ fiche: f, calcul, ecart });
        }
    }

    console.log(`\n${fiches.length} fiche(s) examinée(s), ${aCorriger.length} à reprendre.\n`);
    if (aCorriger.length === 0) return;

    console.log('  Période    Collaborateur              Net actuel      Net corrigé        Écart');
    console.log('  ' + '─'.repeat(84));
    for (const { fiche, calcul, ecart } of aCorriger.slice(0, 25)) {
        const nom = `${fiche.employee?.firstName || ''} ${fiche.employee?.lastName || ''}`.trim() || '(inconnu)';
        const periode = new Date(fiche.period).toISOString().slice(0, 7);
        console.log(
            `  ${periode}   ${nom.slice(0, 24).padEnd(24)} ${fcfa(fiche.netSalary || 0).padStart(12)} ` +
            `${fcfa(calcul.netSalary).padStart(15)} ${((ecart >= 0 ? '+' : '') + fcfa(ecart)).padStart(12)}`
        );
    }
    if (aCorriger.length > 25) console.log(`  … et ${aCorriger.length - 25} autre(s).`);

    const totalEcart = aCorriger.reduce((s, x) => s + x.ecart, 0);
    const signees = aCorriger.filter(x => x.fiche.signature).length;
    console.log('  ' + '─'.repeat(84));
    console.log(`  Écart cumulé sur la masse nette : ${(totalEcart >= 0 ? '+' : '') + fcfa(totalEcart)} FCFA`);
    if (signees > 0) {
        console.log(`  Dont ${signees} fiche(s) déjà signée(s) — leur PDF portait déjà le net corrigé.`);
    }

    if (!confirme) {
        console.log('\nAucune écriture (simulation).');
        console.log('Pour appliquer :  npm run repair-payrolls -- --confirm\n');
        return;
    }

    let reprises = 0;
    for (const { fiche, calcul } of aCorriger) {
        await prisma.payroll.update({
            where: { id: fiche.id },
            data: {
                overtimeAmount: calcul.overtimeAmount,
                leaveDeduction: calcul.leaveDeduction,
                grossSalary: calcul.grossSalary,
                cnpsEmployee: calcul.cnpsEmployee,
                cmu: calcul.cmu,
                taxableIncome: calcul.taxableIncome,
                its: calcul.its,
                employerContributions: calcul.employerContributions,
                employeeContributions: calcul.employeeContributions,
                netSalary: calcul.netSalary
            }
        });
        reprises++;
    }
    console.log(`\n✅ ${reprises} fiche(s) reprise(s).`);
    console.log('   Les PDF déjà produits restent valables : ils portaient le net corrigé.\n');
}

main()
    .catch((e) => { console.error('\n❌', e.message, '\n'); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
