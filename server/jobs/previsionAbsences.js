const { runOnce, dayPeriod } = require('./runOnce');
const { prevoir } = require('../lib/previsionAbsences');
const { notifierRH } = require('../lib/notify');

/**
 * Alerte du lundi : les jours critiques des deux semaines à venir.
 *
 * Une alerte par site et par semaine, pas par jour : sept notifications pour
 * une même semaine de fêtes finiraient ignorées.
 */
const HORIZON_JOURS = 14;

function lundiDe(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d;
}

async function alerterPrevisionAbsences(referenceDate = new Date()) {
    return runOnce('PREVISION_ABSENCES', dayPeriod(lundiDe(referenceDate)), async () => {
        const prevision = await prevoir(referenceDate, HORIZON_JOURS);
        let alertes = 0;
        for (const site of prevision.sites) {
            const critiques = site.jours.filter((j) => j.niveau === 'CRITIQUE');
            if (critiques.length === 0) continue;
            const liste = critiques
                .map((j) => `${new Date(`${j.date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} (${j.estimationPct ?? j.disponibilitePct} %)`)
                .join(', ');
            await notifierRH(
                `${site.nom} : effectif disponible sous ${Math.round(prevision.seuils.critique * 100)} % le ${liste}.`,
                'Alerte', '/prevision-absences', `Effectif critique — ${site.nom}`
            );
            alertes += 1;
        }
        return { alertes };
    });
}

module.exports = { alerterPrevisionAbsences, lundiDe };
