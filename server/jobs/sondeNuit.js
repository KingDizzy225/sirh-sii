const { runOnce, dayPeriod } = require('./runOnce');
const sonde = require('../lib/sonde');
const { notifierRH } = require('../lib/notify');

/**
 * Passage nocturne de la sonde.
 *
 * Sur un serveur exploité en interne, personne ne regarde la nuit. Une panne
 * silencieuse — courriels qui ne partent plus, sauvegarde vide, clé de
 * scellement remplacée — se découvre alors le jour où l'on en a besoin. La
 * sonde la découvre la nuit même, et le dit.
 */
async function sonderLaNuit(referenceDate = new Date()) {
    return runOnce('SONDE_NUIT', dayPeriod(referenceDate), async () => {
        const compteRendu = await sonde.executer({ declenchePar: 'passage nocturne' });
        if (!compteRendu.ok) {
            const detail = compteRendu.resultats
                .filter((r) => r.niveau === sonde.NIVEAUX.ALERTE)
                .map((r) => `${r.libelle} : ${r.detail}`)
                .join(' — ');
            await notifierRH(
                `Contrôle de nuit : ${compteRendu.echecs} point(s) en défaut. ${detail}`,
                'Alerte', '/settings', 'Le contrôle de nuit a échoué'
            );
        }
        return { ok: compteRendu.ok, echecs: compteRendu.echecs };
    });
}

module.exports = { sonderLaNuit };
