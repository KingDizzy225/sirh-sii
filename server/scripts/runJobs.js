#!/usr/bin/env node
/**
 * Déclenche manuellement les traitements RH récurrents.
 *
 *   npm run run-jobs
 *
 * Utile pour vérifier le comportement sans attendre l'échéance planifiée.
 * Sans effet si la période a déjà été traitée : le journal ScheduledJobRun
 * empêche toute double application.
 */

const prisma = require('../prismaClient');
const { runAllDue } = require('../jobs');

runAllDue()
    .then(async () => {
        const runs = await prisma.scheduledJobRun.findMany({
            orderBy: { runAt: 'desc' },
            take: 5
        });
        console.log('\nDernières exécutions enregistrées :');
        for (const run of runs) {
            console.log(`  ${run.jobName} · ${run.period} · ${run.details || 'sans détail'}`);
        }
        console.log('');
    })
    .catch((error) => {
        console.error('\n❌ Échec des traitements :', error.message, '\n');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
