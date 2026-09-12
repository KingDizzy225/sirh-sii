const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');
const { notifierRH } = require('../lib/notify');
const anomaliesPointage = require('../lib/anomaliesPointage');

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

        // --- Recoupement des positions ---
        //
        // La distance au site était la seule chose regardée ; les pointages
        // n'étaient jamais comparés entre eux.
        const nomDe = new Map();
        for (const p of pointages) {
            if (p.employee) nomDe.set(p.employeeId, `${p.employee.firstName} ${p.employee.lastName}`);
        }

        let trajets = 0;
        for (const [employeeId, journee] of parSalarie) {
            for (const t of anomaliesPointage.trajetsImpossibles(journee)) {
                trajets++;
                await notifierRH(
                    `Trajet impossible le ${dateLisible} : ${nomDe.get(employeeId)} — ${t.metres} m `
                    + `en ${t.minutes} min, soit ${t.vitesseKmh} km/h entre deux pointages. `
                    + 'Position erronée, ou pointage effectué par un tiers.',
                    'Alerte',
                    '/releve-heures'
                );
            }
        }

        let jumeles = 0;
        for (const paire of anomaliesPointage.pointagesJumeles(pointages)) {
            jumeles++;
            const [a, b] = paire.employes.map((id) => nomDe.get(id) || 'salarié inconnu');
            await notifierRH(
                `Pointages jumelés le ${dateLisible} : ${a} et ${b} ont pointé à ${paire.secondes} s `
                + `d'intervalle et à ${paire.metres} m l'un de l'autre. Deux téléphones ne donnent pas `
                + 'la même position à ce point : vérifier qu\'un seul appareil n\'a pas servi deux fois.',
                'Alerte',
                '/releve-heures'
            );
        }

        // Position rigoureusement identique, répétée : une fois par semaine
        // suffit, sur quinze jours, sinon la même alerte reviendrait chaque jour.
        let figees = 0;
        if (referenceDate.getUTCDay() === 1) {
            const quinzaine = new Date(referenceDate);
            quinzaine.setDate(quinzaine.getDate() - 14);
            const recents = await prisma.timeLog.findMany({
                where: { timestamp: { gte: quinzaine, lte: fin } },
                include: { employee: { select: { firstName: true, lastName: true } } }
            });
            const parPersonne = new Map();
            for (const p of recents) {
                if (!parPersonne.has(p.employeeId)) parPersonne.set(p.employeeId, []);
                parPersonne.get(p.employeeId).push(p);
                if (p.employee) nomDe.set(p.employeeId, `${p.employee.firstName} ${p.employee.lastName}`);
            }
            for (const [employeeId, liste] of parPersonne) {
                for (const f of anomaliesPointage.positionsFigees(liste)) {
                    figees++;
                    await notifierRH(
                        `Position figée : ${nomDe.get(employeeId)} a pointé ${f.occurrences} fois sur `
                        + `${f.jours} jours à des coordonnées rigoureusement identiques. Un GPS réel varie `
                        + 'de quelques mètres : position simulée, ou appareil laissé sur place.',
                        'Info',
                        '/releve-heures'
                    );
                }
            }
        }

        return `${parSalarie.size} salarié(s) pointant, ${sansSortie} sans sortie, ${horsZone} hors zone, `
            + `${trajets} trajet(s) impossible(s), ${jumeles} pointage(s) jumelé(s), ${figees} position(s) figée(s)`;
    });
}

module.exports = { detecterAnomaliesPointage };
