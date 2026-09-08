#!/usr/bin/env node
/**
 * Reprise de l'historique des situations.
 *
 *   npm run reprise-situations                 # simulation, n'écrit rien
 *   npm run reprise-situations -- --confirm
 *
 * L'historisation ne connaît que ce qu'elle a vu passer. Les salariés déjà
 * présents lors de sa mise en place n'ont donc aucun segment : ils sont absents
 * de tout effectif daté, et l'application conclurait à un effectif nul avant
 * aujourd'hui.
 *
 * Cette reprise pose, pour chacun, une situation courant depuis son embauche,
 * à partir de sa fiche actuelle. C'est une hypothèse — « rien n'a changé depuis
 * l'embauche » — et elle est fausse pour quiconque a été promu ou muté. Elle
 * est donc marquée REPRISE, et l'application le signale partout où elle
 * l'emploie : un organigramme reconstitué ne vaut pas un organigramme observé.
 *
 * Les mouvements réels que vous connaissez se saisissent ensuite, salarié par
 * salarié, et prennent le pas sur la reprise.
 */

const prisma = require('../prismaClient');
const historique = require('../lib/historique');

const confirme = process.argv.includes('--confirm');

async function main() {
    const salaries = await prisma.employee.findMany({
        select: {
            id: true, firstName: true, lastName: true, hireDate: true,
            positionTitle: true, department: true, managerId: true,
            contractType: true, status: true
        },
        orderBy: { hireDate: 'asc' }
    });

    const dejaSuivis = new Set(
        (await prisma.situationEmployee.findMany({ select: { employeeId: true }, distinct: ['employeeId'] }))
            .map((s) => s.employeeId)
    );

    const aReprendre = salaries.filter((s) => !dejaSuivis.has(s.id));

    if (aReprendre.length === 0) {
        console.log(`\n${salaries.length} salarié(s) examiné(s) : tous ont déjà un historique.\n`);
        return;
    }

    console.log(`\n${aReprendre.length} salarié(s) sans historique, sur ${salaries.length} :\n`);
    for (const s of aReprendre) {
        const depuis = s.hireDate ? new Date(s.hireDate).toLocaleDateString('fr-FR') : 'date inconnue';
        console.log(
            `  ${(s.lastName + ' ' + s.firstName).padEnd(28)} depuis le ${depuis}` +
            `  ${s.positionTitle || '—'} · ${s.department || '—'}`
        );
    }

    if (!confirme) {
        console.log(
            '\nSimulation : rien n\'a été écrit.\n' +
            'Relancer avec --confirm pour appliquer.\n\n' +
            'Ce qui sera posé est une hypothèse : la situation actuelle, réputée\n' +
            "inchangée depuis l'embauche. Elle est fausse pour quiconque a été promu\n" +
            'ou muté, et sera marquée comme reconstituée partout où elle apparaît.\n'
        );
        return;
    }

    let reprises = 0;
    let echecs = 0;
    for (const s of aReprendre) {
        try {
            await historique.enregistrer(s.id, s, {
                effectiveFrom: s.hireDate || new Date(),
                motif: "Reprise : situation réputée inchangée depuis l'embauche",
                source: 'REPRISE'
            });
            reprises++;
        } catch (e) {
            echecs++;
            console.error(`  ✗ ${s.lastName} ${s.firstName} : ${e.message}`);
        }
    }

    console.log(`\n${reprises} situation(s) reprise(s)${echecs ? `, ${echecs} en échec` : ''}.\n`);
    console.log('Saisissez ensuite les mouvements que vous connaissez : chacun prend le');
    console.log('pas sur la reprise et rétablit la chronologie réelle.\n');
}

main()
    .catch((e) => { console.error('\nÉchec de la reprise :', e.message, '\n'); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
