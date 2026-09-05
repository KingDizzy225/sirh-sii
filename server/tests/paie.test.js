#!/usr/bin/env node
/**
 * Essai d'intégration de la paie.
 *
 *   createdb sirh_test
 *   DATABASE_URL="postgresql://user@localhost:5432/sirh_test" npm run test:paie
 *
 * Vérifie que le bulletin enregistré, le PDF remis au salarié et l'export
 * comptable décrivent le même bulletin. Ces trois vues calculaient auparavant
 * leurs montants séparément et donnaient trois résultats différents.
 *
 * Écrit en base : le script refuse de s'exécuter si le nom de la base ne
 * comporte pas « test » ou « essai », pour ne pas créer d'employé fictif dans
 * une base de production par une variable d'environnement mal placée.
 */

const path = require('path');
const racine = path.join(__dirname, '..');
const prisma = require(path.join(racine, 'prismaClient'));
const ctrl = require(path.join(racine, 'controllers/payrollController'));
const { calculerPaie } = require(path.join(racine, 'lib/paie'));

const url = process.env.DATABASE_URL || '';
const nomBase = (url.split('/').pop() || '').split('?')[0];
if (!/test|essai/i.test(nomBase)) {
    console.error(
        `\n❌ Base « ${nomBase || '(non définie)'} » refusée.\n` +
        "   Cet essai écrit en base. Pointer DATABASE_URL vers une base jetable\n" +
        "   dont le nom comporte « test » ou « essai ».\n"
    );
    process.exit(1);
}

const fcfa = (x) => new Intl.NumberFormat('fr-FR').format(Math.round(x));
const proche = (a, b) => Math.abs(a - b) < 0.01;
let echecs = 0;
const verifier = (libelle, condition, detail) => {
    console.log(`  ${condition ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
    if (!condition) echecs++;
};

// Réponse Express minimale, suffisante pour les contrôleurs exercés ici.
const faireRes = () => {
    const r = { statut: null, corps: null, entetes: {} };
    r.status = (c) => { r.statut = c; return r; };
    r.json = (d) => { r.corps = d; return r; };
    r.send = (d) => { r.corps = d; return r; };
    r.header = (k, v) => { r.entetes[k] = v; return r; };
    r.attachment = () => r;
    return r;
};

async function main() {
    const emp = await prisma.employee.create({
        data: {
            firstName: 'Awa', lastName: 'Koné', email: `awa.${Date.now()}@essai.test`,
            role: 'Employee', department: 'Opérations', status: 'ACTIVE',
            hireDate: new Date('2023-01-15'), positionTitle: 'Chargée de clientèle'
        }
    });

    const periode = '2026-08-01';
    // Un cas qui active toutes les composantes : sans heures supplémentaires ni
    // absences, la confusion entre heures et francs restait invisible.
    const variables = { baseSalary: 500000, bonus: 50000, overtimeHours: 12, leaveDays: 2, deductions: 15000 };

    console.log('\n=== Exécution de la paie ===');
    const res = faireRes();
    await ctrl.runPayroll(
        { body: { payrolls: [{ employeeId: emp.id, period: periode, ...variables }] } },
        res
    );
    verifier('le contrôleur répond 201', res.statut === 201, `statut ${res.statut}`);
    if (res.statut !== 201) throw new Error(JSON.stringify(res.corps));

    const fiche = await prisma.payroll.findFirst({ where: { employeeId: emp.id } });
    const attendu = calculerPaie(variables);

    console.log('\n=== Décomposition enregistrée ===');
    console.log('  base                ', fcfa(fiche.baseSalary));
    console.log('  heures supp (12 h)  ', fcfa(fiche.overtimeAmount));
    console.log('  prime               ', fcfa(fiche.bonus));
    console.log('  absences (2 j)      ', '-' + fcfa(fiche.leaveDeduction));
    console.log('  = BRUT              ', fcfa(fiche.grossSalary));
    console.log('  CNPS salarié        ', '-' + fcfa(fiche.cnpsEmployee));
    console.log('  CMU                 ', '-' + fcfa(fiche.cmu));
    console.log('  ITS                 ', '-' + fcfa(fiche.its));
    console.log('  retenues diverses   ', '-' + fcfa(fiche.deductions));
    console.log('  = NET               ', fcfa(fiche.netSalary));
    console.log('  charge patronale    ', fcfa(fiche.employerContributions), '(non retenue au salarié)');

    console.log('\n=== Cohérence du bulletin ===');
    verifier('le brut est la somme de ses composantes',
        proche(fiche.grossSalary, fiche.baseSalary + fiche.overtimeAmount - fiche.leaveDeduction + fiche.bonus));
    verifier('les retenues valent CNPS + CMU + ITS',
        proche(fiche.employeeContributions, fiche.cnpsEmployee + fiche.cmu + fiche.its));
    verifier('net = brut - retenues - retenues diverses',
        proche(fiche.netSalary, fiche.grossSalary - fiche.employeeContributions - fiche.deductions),
        `${fcfa(fiche.grossSalary)} - ${fcfa(fiche.employeeContributions)} - ${fcfa(fiche.deductions)} = ${fcfa(fiche.netSalary)}`);
    verifier("la part patronale n'est pas retenue au salarié",
        !proche(fiche.netSalary, fiche.grossSalary - fiche.employerContributions - fiche.deductions));
    verifier('l\'enregistrement correspond au calcul de référence',
        proche(fiche.netSalary, attendu.netSalary) && proche(fiche.grossSalary, attendu.grossSalary));
    verifier('le PDF du bulletin a été produit', Boolean(fiche.pdfPath), fiche.pdfPath || 'absent');

    console.log('\n=== Export comptable ===');
    const res2 = faireRes();
    await ctrl.exportSage({ query: { period: '2026-08' }, user: { role: 'ADMIN' } }, res2);
    verifier('l\'export répond sans erreur', res2.statut === null,
        res2.statut ? `statut ${res2.statut} : ${JSON.stringify(res2.corps)}` : 'CSV produit');

    const lignes = String(res2.corps || '').trim().split('\n');
    const rubrique = (code) => {
        const l = lignes.find(x => x.split(';')[3] === String(code));
        return l ? parseFloat(l.split(';')[4]) : null;
    };
    verifier('le libellé « AAAA-MM » sélectionne bien le mois', lignes.length > 1,
        `${lignes.length - 1} ligne(s)`);
    verifier('rubrique 3000 porte un montant, pas un nombre d\'heures',
        rubrique(3000) !== null && rubrique(3000) > 1000,
        `${fcfa(rubrique(3000) || 0)} FCFA pour 12 h`);
    verifier('rubrique 4000 (CNPS) assise sur le brut enregistré',
        rubrique(4000) !== null && Math.abs(rubrique(4000) - fiche.cnpsEmployee) <= 1);
    verifier('rubrique 5000 égale le net enregistré',
        rubrique(5000) !== null && Math.abs(rubrique(5000) - fiche.netSalary) <= 1);

    await prisma.payroll.deleteMany({ where: { employeeId: emp.id } });
    await prisma.employee.delete({ where: { id: emp.id } });
}

main()
    .then(() => {
        console.log(echecs === 0 ? '\n✅ Tous les contrôles passent.\n' : `\n❌ ${echecs} contrôle(s) en échec.\n`);
        process.exit(echecs === 0 ? 0 : 1);
    })
    .catch((e) => { console.error('\n❌', e.message, '\n'); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
