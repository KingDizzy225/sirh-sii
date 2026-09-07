#!/usr/bin/env node
/**
 * Reprise des compteurs de congés enregistrés avant la correction du solde.
 *
 *   npm run repair-leave-balances                 # simulation, n'écrit rien
 *   npm run repair-leave-balances -- --confirm
 *
 * Le schéma posait `annualLeaveBalance` à 30 par défaut, et ni la création
 * manuelle ni l'import en masse ne renseignaient ce champ. Tout salarié
 * démarrait donc avec une année entière de congés acquis, quelle que soit sa
 * date d'embauche : un salarié arrivé il y a trois mois affichait 30 jours là
 * où il en avait acquis 6,6, et un ancien de dix ans affichait 30 lui aussi, en
 * perdant tout report.
 *
 * Ce n'est pas un compteur d'affichage : il est valorisé en francs au départ du
 * salarié (indemnité compensatrice de congés payés), et il est énoncé au
 * salarié par l'assistant RH et par le guichet WhatsApp.
 *
 * Le recalcul reconstitue le solde sur l'année de référence en cours, congés
 * déjà validés déduits. Il ne touche pas :
 *   - les soldes déjà repris ou déjà calculés (leaveBalanceSource renseigné) :
 *     quelqu'un les a établis, l'outil n'a pas à les contredire ;
 *   - les salariés sortis, dont le décompte de départ est peut-être déjà fait.
 *
 * Le résultat porte la marque « CALCUL » : un solde calculé n'a pas la même
 * valeur qu'un solde repris du système précédent, et la RH doit pouvoir
 * distinguer les deux pour arbitrer.
 */

const prisma = require('../prismaClient');
const { soldeOuverture } = require('../lib/conges');

const confirme = process.argv.includes('--confirm');
const jour = (x) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(x);

async function main() {
    const salaries = await prisma.employee.findMany({
        where: {
            status: { not: 'TERMINATED' },
            leaveBalanceSource: null
        },
        select: {
            id: true, firstName: true, lastName: true, hireDate: true,
            gender: true, childrenCount: true, annualLeaveBalance: true
        },
        orderBy: { hireDate: 'asc' }
    });

    if (salaries.length === 0) {
        console.log('\nAucun compteur à reprendre : tous les soldes ont une origine établie.\n');
        return;
    }

    // Congés annuels déjà validés sur l'année de référence. Un congé refusé ou
    // en attente n'a rien consommé et ne doit pas être déduit.
    const conges = await prisma.leave.findMany({
        where: {
            employeeId: { in: salaries.map((s) => s.id) },
            status: { in: ['APPROVED', 'VALIDATED', 'TAKEN'] }
        },
        select: { employeeId: true, durationDays: true, startDate: true }
    });

    const lignes = [];
    for (const s of salaries) {
        const simule = soldeOuverture({
            hireDate: s.hireDate,
            gender: s.gender,
            childrenCount: s.childrenCount
        });
        const debut = simule.detail.debutAnneeReference;

        const pris = conges
            .filter((c) => c.employeeId === s.id && (!debut || new Date(c.startDate) >= new Date(debut)))
            .reduce((total, c) => total + (c.durationDays || 0), 0);

        const calcul = soldeOuverture({
            hireDate: s.hireDate,
            gender: s.gender,
            childrenCount: s.childrenCount,
            joursPris: pris
        });

        if (Math.abs(calcul.solde - (s.annualLeaveBalance || 0)) < 0.05) continue;
        lignes.push({ salarie: s, avant: s.annualLeaveBalance || 0, apres: calcul.solde, pris, calcul });
    }

    if (lignes.length === 0) {
        console.log(`\n${salaries.length} salarié(s) examiné(s), aucun écart.\n`);
        return;
    }

    console.log(`\n${lignes.length} compteur(s) à reprendre sur ${salaries.length} examiné(s) :\n`);
    for (const l of lignes) {
        const s = l.salarie;
        const d = l.calcul.detail;
        const sens = l.apres > l.avant ? '+' : '';
        console.log(
            `  ${(s.lastName + ' ' + s.firstName).padEnd(28)} ` +
            `${jour(l.avant).padStart(5)} → ${jour(l.apres).padStart(5)} j  ` +
            `(${sens}${jour(l.apres - l.avant)})  ` +
            `[${d.moisAcquis} mois × ${d.joursParMois}` +
            (d.majorationAnciennete ? ` + ${jour(d.majorationAnciennete)} ancienneté` : '') +
            (d.majorationEnfants ? ` + ${jour(d.majorationEnfants)} enfants` : '') +
            (l.pris ? ` − ${jour(l.pris)} pris` : '') + ']'
        );
    }

    const totalAvant = lignes.reduce((t, l) => t + l.avant, 0);
    const totalApres = lignes.reduce((t, l) => t + l.apres, 0);
    console.log(`\n  Total : ${jour(totalAvant)} j → ${jour(totalApres)} j ` +
                `(${totalApres > totalAvant ? '+' : ''}${jour(totalApres - totalAvant)} j)`);

    if (!confirme) {
        console.log(
            '\nSimulation : rien n\'a été écrit.\n' +
            'Relancer avec --confirm pour appliquer.\n' +
            'Si un solde doit être celui du système précédent plutôt qu\'un calcul,\n' +
            'le saisir sur la fiche du salarié avant de lancer la reprise : ce script\n' +
            'ne touche que les compteurs dont l\'origine n\'est pas encore établie.\n'
        );
        return;
    }

    let repris = 0;
    for (const l of lignes) {
        await prisma.employee.update({
            where: { id: l.salarie.id },
            data: {
                annualLeaveBalance: l.apres,
                leaveBalanceSource: 'CALCUL',
                leaveBalanceSetAt: new Date()
            }
        });
        repris++;
    }
    console.log(`\n${repris} compteur(s) repris.\n`);
}

main()
    .catch((e) => { console.error('\nÉchec de la reprise :', e.message, '\n'); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
