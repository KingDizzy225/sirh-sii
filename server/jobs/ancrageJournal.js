const { runOnce, dayPeriod } = require('./runOnce');
const journal = require('../lib/journal');
const { notifierRH } = require('../lib/notify');

/**
 * Ancrage hebdomadaire du journal, et contrôle de la chaîne.
 *
 * L'ancrage fige la dernière empreinte connue. Le contrôle, lui, signale une
 * rupture le lundi plutôt qu'au moment d'un contentieux, quand plus personne
 * ne se souvient de ce qui s'est passé.
 */
function lundiDe(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d;
}

async function ancrerJournal(referenceDate = new Date()) {
    return runOnce('ANCRAGE_JOURNAL', dayPeriod(lundiDe(referenceDate)), async () => {
        const etat = await journal.verifier();
        if (!etat.intacte) {
            const detail = etat.rupture
                ? `rupture ${etat.rupture.motif} à la ligne ${etat.rupture.numero}`
                : `${etat.ancrages.rompus.length} ancrage(s) ne correspondent plus`;
            await notifierRH(
                `Le journal d'audit n'est plus intègre : ${detail}. Une ligne a été effacée ou modifiée en base.`,
                'Alerte', '/audit-logs', "Journal d'audit rompu"
            );
        }
        const ancrage = await journal.ancrer('traitement hebdomadaire');
        return { intacte: etat.intacte, numero: ancrage?.numero ?? null };
    });
}

module.exports = { ancrerJournal, lundiDe };
