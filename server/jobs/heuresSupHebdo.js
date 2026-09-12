const prisma = require('../prismaClient');
const { runOnce } = require('./runOnce');
const { notifierRH } = require('../lib/notify');
const tempsTravail = require('../lib/tempsTravail');
const joursFeries = require('../lib/joursFeries');
const remuneration = require('../lib/remuneration');
const { TAUX } = require('../lib/paie');

/**
 * Heures supplémentaires de la semaine en cours, pendant qu'on peut encore
 * décider.
 *
 * Les heures supplémentaires sont désormais payées à leur juste taux — jusqu'à
 * 100 % de majoration —, mais elles ne se découvrent qu'à la préparation de la
 * paie, le mois terminé : trop tard pour arbitrer quoi que ce soit. Ce contrôle
 * regarde la semaine en cours, arrêtée au jour d'exécution, et dit ce qu'elle
 * coûtera si elle se termine ainsi.
 *
 * Deux passages par semaine : le mercredi, quand la semaine peut encore être
 * réorganisée, et le vendredi, avant le week-end où les majorations doublent.
 */

const SEUIL_ALERTE = parseFloat(process.env.HS_ALERTE_SEUIL_HEURES || String(tempsTravail.HEURES_HEBDO));

const fcfa = (n) => `${Math.round(n || 0).toLocaleString('fr-FR')} F`;

/** Lundi de la semaine d'une date, à minuit UTC. */
function lundiDe(date) {
    const d = new Date(date);
    const decalage = (d.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - decalage));
}

/** Coût des heures supplémentaires ventilées, au taux horaire du salarié. */
function coutVentilation(ventilation, salaireMensuel) {
    if (!(salaireMensuel > 0)) return null;
    const tauxHoraire = salaireMensuel / TAUX.heuresMensuelles;
    return Object.entries(TAUX.majorationsHeuresSup)
        .reduce((total, [categorie, majoration]) => total + (ventilation[categorie] || 0) * majoration * tauxHoraire, 0);
}

async function surveillerHeuresSup(referenceDate = new Date()) {
    const lundi = lundiDe(referenceDate);
    const periode = `${lundi.toISOString().slice(0, 10)}-${referenceDate.toISOString().slice(0, 10)}`;

    return runOnce('HEURES_SUP_HEBDO', periode, async () => {
        const pointages = await prisma.timeLog.findMany({
            where: { timestamp: { gte: lundi, lte: referenceDate } },
            include: { employee: { select: { id: true, firstName: true, lastName: true, department: true } } },
            orderBy: { timestamp: 'asc' }
        });

        if (pointages.length === 0) return 'Aucun pointage cette semaine';

        const feries = await prisma.jourFerie.findMany({
            where: { date: { gte: lundi, lte: referenceDate }, chome: true },
            select: { date: true, libelle: true }
        }).catch(() => []);
        const index = joursFeries.indexer(feries);

        const parSalarie = new Map();
        for (const p of pointages) {
            if (!p.employee) continue;
            if (!parSalarie.has(p.employeeId)) parSalarie.set(p.employeeId, { salarie: p.employee, liste: [] });
            parSalarie.get(p.employeeId).liste.push(p);
        }

        let signales = 0;
        let coutTotal = 0;
        for (const [employeeId, { salarie, liste }] of parSalarie) {
            const { journees, anomalies } = tempsTravail.apparier(liste);
            const heures = journees.reduce((t, j) => t + j.heures, 0);
            if (heures <= SEUIL_ALERTE) continue;

            const ventilation = tempsTravail.ventilerHeuresSup(journees, index);
            if (ventilation.total <= 0) continue;

            const salaire = await remuneration.salaireA(employeeId, referenceDate).catch(() => ({ montant: null }));
            const cout = coutVentilation(ventilation, salaire.montant);
            if (cout) coutTotal += cout;
            signales++;

            const detail = [
                ['h15', 'à 15 %'], ['h50', 'à 50 %'], ['h75', 'à 75 %'], ['h100', 'à 100 %']
            ].filter(([c]) => ventilation[c] > 0).map(([c, l]) => `${ventilation[c]} h ${l}`).join(', ');

            await notifierRH(
                `${salarie.firstName} ${salarie.lastName} totalise déjà ${Math.round(heures * 10) / 10} h `
                + `cette semaine, arrêtées au ${referenceDate.toLocaleDateString('fr-FR')} : `
                + `${ventilation.total} h supplémentaires (${detail})`
                + (cout ? `, soit environ ${fcfa(cout)}` : ', coût non chiffrable faute de salaire au dossier')
                + '. Réorganiser la fin de semaine, ou assumer la dépense.'
                + (anomalies.length > 0 ? ` Relevé incomplet : ${anomalies.length} anomalie(s) de pointage.` : ''),
                'Alerte',
                '/releve-heures'
            );
        }

        return `${parSalarie.size} salarié(s) pointant, ${signales} au-delà de ${SEUIL_ALERTE} h`
            + (coutTotal > 0 ? `, environ ${fcfa(coutTotal)} d'heures supplémentaires engagées` : '');
    });
}

module.exports = { surveillerHeuresSup, lundiDe, coutVentilation, SEUIL_ALERTE };
