const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const identite = require('../lib/identite');

/**
 * Identité de l'entreprise : lecture publique, modification par la RH.
 */

exports.lirePublic = (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json(identite.pourPublic());
};

exports.logo = (req, res) => {
    const chemin = identite.cheminLogo();
    if (!chemin) return res.sendStatus(404);
    res.set('Cache-Control', 'public, max-age=300');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(chemin);
};

exports.lire = async (req, res) => {
    try {
        const ligne = await identite.rafraichir();
        res.json({ ...(ligne || {}), ...identite.pourPublic(ligne), logo: Boolean(ligne?.logoPath) });
    } catch (erreur) {
        console.error('[IDENTITÉ] Lecture impossible :', erreur.message);
        res.status(500).json({ error: "Lecture de l'identité impossible." });
    }
};

exports.enregistrer = async (req, res) => {
    try {
        const resultat = identite.valider(req.body || {});
        if (resultat.erreur) return res.status(400).json({ error: resultat.erreur });
        const auteur = req.user?.name || req.user?.email || null;
        await prisma.identiteEntreprise.upsert({
            where: { id: 'principale' },
            create: { id: 'principale', ...resultat.donnees, majPar: auteur },
            update: { ...resultat.donnees, majPar: auteur }
        });
        await identite.rafraichir();
        res.json({ message: 'Identité enregistrée : pages publiques et documents la reprennent.', avertissements: resultat.avertissements });
    } catch (erreur) {
        console.error('[IDENTITÉ] Enregistrement impossible :', erreur.message);
        res.status(500).json({ error: 'Enregistrement impossible.' });
    }
};

exports.deposerLogo = async (req, res) => {
    const fichier = req.file;
    try {
        if (!fichier) return res.status(400).json({ error: 'Aucun fichier reçu.' });
        const auteur = req.user?.name || req.user?.email || null;
        const avant = await prisma.identiteEntreprise.findUnique({ where: { id: 'principale' } });
        await prisma.identiteEntreprise.upsert({
            where: { id: 'principale' },
            create: { id: 'principale', logoPath: path.basename(fichier.path), majPar: auteur },
            update: { logoPath: path.basename(fichier.path), majPar: auteur }
        });
        if (avant?.logoPath) fs.promises.unlink(path.join(identite.DOSSIER_LOGOS, path.basename(avant.logoPath))).catch(() => {});
        await identite.rafraichir();
        res.json({ message: 'Logo enregistré.' });
    } catch (erreur) {
        if (fichier?.path) fs.promises.unlink(fichier.path).catch(() => {});
        console.error('[IDENTITÉ] Logo non enregistré :', erreur.message);
        res.status(500).json({ error: 'Enregistrement du logo impossible.' });
    }
};
