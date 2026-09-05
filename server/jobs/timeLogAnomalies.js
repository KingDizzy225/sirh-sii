const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');
const { notifierRH } = require('../lib/notify');

/**
 * Anomalies de pointage de la veille.
 *
 * Un oubli de pointage de sortie ne se voit nulle part : la journée reste
 * ouverte et fausse tout calcul de temps de travail, sans que personne n'en
 * soit averti. Ce contrôle quotidien porte sur la journée écoulée, une fois
 * qu'elle est close et que les pointages tardifs sont arrivés.
 */
async function detecterAnomaliesPointage(referenceDate = new Date()) {
    return runOnce('TIMELOG_ANOMALIES', dayPeriod(referenceDate), async () => {
        const veille = new Date(referenceDate);
        veille.setDate(veille.getDate() - 1);
        const debut = new Date(veille); debut.setHours(0, 0, 0, 0);
        const fin = new Date(veille); fin.setHours(23, 59, 59, 999);

        const pointages = await prisma.timeLog.findMany({
            where: { timestamp: { gte: debut, lte: fin } },
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { timestamp: 'asc' }
        });

        // Regroupement par salarié
        const parSalarie = new Map();
        for (const p of pointages) {
            if (!parSalarie.has(p.employeeId)) parSalarie.set(p.employeeId, []);
            parSalarie.get(p.employeeId).push(p);
        }

        let sansSortie = 0;
        let horsZone = 0;
        const dateLisible = veille.toLocaleDateString('fr-FR');

        for (const [, journee] of parSalarie) {
            const nom = `${journee[0].employee.firstName} ${journee[0].employee.lastName}`;

            const entrees = journee.filter(p => p.type === 'CLOCK_IN').length;
            const sorties = journee.filter(p => p.type === 'CLOCK_OUT').length;

            if (entrees > sorties) {
                sansSortie++;
                await notifierRH(
                    `Pointage de sortie manquant le ${dateLisible} : ${nom}. ` +
                    'La journée reste ouverte et fausse le calcul du temps de travail.',
                    'Alerte',
                    '/timesheet'
                );
            }

            const dehors = journee.filter(p => p.withinPerimeter === false);
            if (dehors.length > 0) {
                horsZone++;
                const plusLoin = Math.max(...dehors.map(p => p.distanceMeters || 0));
                await notifierRH(
                    `Pointage hors zone le ${dateLisible} : ${nom} ` +
                    `(jusqu'à ${plusLoin} m du site le plus proche).`,
                    'Info',
                    '/timesheet'
                );
            }
        }

        return `${parSalarie.size} salarié(s) pointant, ${sansSortie} sans sortie, ${horsZone} hors zone`;
    });
}

module.exports = { detecterAnomaliesPointage };
