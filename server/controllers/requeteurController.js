const requeteur = require('../lib/requeteur');

/**
 * Requêteur : listes et exports à la demande.
 *
 * Les tableaux de bord sont figés, et une RH a besoin plusieurs fois par mois
 * d'une liste qu'aucun écran ne propose. Sans cet outil, chaque demande passe
 * par un développeur — et la plupart n'aboutissent jamais.
 */

exports.getCatalogue = (req, res) => {
    res.json({
        sujets: requeteur.catalogue(),
        operateurs: [
            { code: 'egal', libelle: 'est égal à' },
            { code: 'contient', libelle: 'contient' },
            { code: 'superieur', libelle: 'est supérieur ou égal à' },
            { code: 'inferieur', libelle: 'est inférieur ou égal à' },
            { code: 'nonVide', libelle: 'est renseigné' },
            { code: 'vide', libelle: "n'est pas renseigné" }
        ]
    });
};

exports.executer = async (req, res) => {
    try {
        const resultat = await requeteur.executer(req.body || {});
        res.json(resultat);
    } catch (error) {
        if (['SUJET', 'COLONNES'].includes(error.code)) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erreur du requêteur :', error);
        res.status(500).json({ error: "Erreur lors de l'exécution de la requête." });
    }
};

exports.exporter = async (req, res) => {
    try {
        const resultat = await requeteur.executer(req.body || {});
        const csv = requeteur.versCsv(resultat);

        const nom = `export_${String(resultat.sujet).toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${nom}`);
        // L'en-tête dit si le fichier contient des données sensibles : un
        // export de salaires ne se transfère pas comme une liste de services.
        if (resultat.sensible) res.setHeader('X-Donnees-Sensibles', 'true');
        res.send(csv);
    } catch (error) {
        if (['SUJET', 'COLONNES'].includes(error.code)) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erreur export du requêteur :', error);
        if (!res.headersSent) res.status(500).json({ error: "Erreur lors de l'export." });
    }
};
