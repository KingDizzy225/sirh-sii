const retraite = require('../lib/retraite');

/**
 * Départs à la retraite.
 *
 * Écran de prévision seulement : le départ lui-même passe par la procédure de
 * fin de contrat et le décompte de départ, qui portent désormais l'allocation
 * de fin de carrière.
 */
exports.prevision = async (req, res) => {
    try {
        const horizon = parseInt(req.query.horizonMois, 10) || retraite.PREAVIS_MOIS;
        const etat = await retraite.prevision(horizon);
        res.json({
            ...etat,
            avertissement: etat.baremeDeclare ? null : etat.motifSansBareme
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
