const { runOnce, dayPeriod } = require('./runOnce');
const { appliquerDecisionsEchues } = require('../lib/remuneration');

/**
 * Applique les décisions de rémunération dont la date d'effet est arrivée.
 *
 * Une augmentation signée en septembre pour le 1er octobre doit prendre effet
 * toute seule. Sans ce rattrapage, elle attendrait qu'une main la reporte — et
 * la paie d'octobre sortirait avec l'ancien montant, sans que rien ne le
 * signale.
 */
async function appliquerRemunerations(referenceDate = new Date()) {
    return runOnce('SALARY_EFFECTIVE', dayPeriod(referenceDate), async () => {
        const nombre = await appliquerDecisionsEchues(referenceDate);
        return nombre > 0
            ? `${nombre} décision(s) de rémunération appliquée(s)`
            : 'aucune décision à appliquer';
    });
}

module.exports = { appliquerRemunerations };
