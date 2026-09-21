const bilanSocial = require('../lib/bilanSocial');

/** Bilan social annuel : agrégat des données déjà détenues. */
exports.produire = async (req, res) => {
    try {
        const annee = parseInt(req.query.annee, 10) || new Date().getFullYear() - 1;
        res.json(await bilanSocial.produire(annee));
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
