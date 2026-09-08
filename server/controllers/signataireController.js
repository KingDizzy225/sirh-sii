const prisma = require('../prismaClient');
const sceau = require('../lib/sceau');
const { imageDepuisDataUrl } = require('../lib/apposition');

/**
 * Signataires habilités.
 *
 * Enregistrer une signature manuscrite une fois, pour l'apposer ensuite sur
 * tout ce que l'application émet — au lieu d'imprimer, signer et rescanner.
 *
 * Une réserve tenue ici : la signature est une image, et une image se copie.
 * L'accès à ces enregistrements est donc réservé à l'administration, et la
 * valeur probante des documents ne repose pas sur le trait mais sur le sceau
 * cryptographique apposé au même moment.
 */

// 400 Ko : largement de quoi contenir un trait ou un cachet numérisé, et pas
// de quoi charger une photographie dans une colonne de texte.
const TAILLE_MAX = parseInt(process.env.SIGNATURE_IMAGE_MAX_OCTETS, 10) || 400 * 1024;

const presenter = (s) => ({
    id: s.id,
    nom: s.nom,
    fonction: s.fonction,
    actif: s.actif,
    parDefaut: s.parDefaut,
    aCachet: Boolean(s.cachetImage),
    creePar: s.creePar,
    creeLe: s.createdAt
    // L'image n'est pas rendue dans la liste : elle n'a pas à circuler à chaque
    // affichage d'écran.
});

exports.lister = async (req, res) => {
    try {
        const signataires = await prisma.signataire.findMany({
            orderBy: [{ actif: 'desc' }, { parDefaut: 'desc' }, { nom: 'asc' }]
        });
        const cle = await sceau.clePublique();
        res.json({
            signataires: signataires.map(presenter),
            // L'exploitant doit savoir d'où vient la clé qui scelle ses
            // documents : une clé conservée en base est moins protégée qu'une
            // clé d'environnement, et cela ne doit pas rester implicite.
            scellement: { keyId: cle.keyId, algorithme: cle.algorithme, origineCle: cle.origine }
        });
    } catch (error) {
        console.error('Erreur lecture des signataires :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des signataires.' });
    }
};

/** Image d'un signataire, pour la prévisualiser avant emploi. */
exports.getImage = async (req, res) => {
    try {
        const s = await prisma.signataire.findUnique({ where: { id: req.params.id } });
        if (!s) return res.status(404).json({ error: 'Signataire introuvable.' });
        res.json({ signatureImage: s.signatureImage, cachetImage: s.cachetImage || null });
    } catch (error) {
        console.error('Erreur lecture de la signature :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

const valider = (corps) => {
    const { nom, fonction, signatureImage, cachetImage } = corps;
    if (!nom || !String(nom).trim()) return 'Le nom du signataire est requis.';
    if (!fonction || !String(fonction).trim()) {
        // La qualité du signataire figure sur le document : sans elle, le
        // destinataire ne sait pas qui engage l'entreprise.
        return 'La fonction du signataire est requise : elle figure sur les documents émis.';
    }
    if (!signatureImage) return 'La signature est requise.';
    if (!imageDepuisDataUrl(signatureImage)) return "L'image de signature est illisible.";
    if (signatureImage.length > TAILLE_MAX) {
        return `Signature trop volumineuse (${Math.round(signatureImage.length / 1024)} Ko, maximum ${Math.round(TAILLE_MAX / 1024)} Ko).`;
    }
    if (cachetImage) {
        if (!imageDepuisDataUrl(cachetImage)) return "L'image du cachet est illisible.";
        if (cachetImage.length > TAILLE_MAX) return 'Cachet trop volumineux.';
    }
    return null;
};

exports.creer = async (req, res) => {
    try {
        const motif = valider(req.body);
        if (motif) return res.status(400).json({ error: motif });

        const { nom, fonction, signatureImage, cachetImage, parDefaut } = req.body;

        const signataire = await prisma.signataire.create({
            data: {
                nom: String(nom).trim(),
                fonction: String(fonction).trim(),
                signatureImage,
                cachetImage: cachetImage || null,
                parDefaut: Boolean(parDefaut),
                creePar: (req.user && (req.user.email || req.user.name)) || null
            }
        });

        // Un seul signataire par défaut : deux rendraient le choix arbitraire à
        // l'émission, et personne ne saurait qui a signé avant d'ouvrir le PDF.
        if (signataire.parDefaut) {
            await prisma.signataire.updateMany({
                where: { id: { not: signataire.id } }, data: { parDefaut: false }
            });
        }

        res.status(201).json(presenter(signataire));
    } catch (error) {
        console.error('Erreur création de signataire :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du signataire." });
    }
};

exports.modifier = async (req, res) => {
    try {
        const { id } = req.params;
        const existant = await prisma.signataire.findUnique({ where: { id } });
        if (!existant) return res.status(404).json({ error: 'Signataire introuvable.' });

        const donnees = {};
        if (req.body.nom !== undefined) donnees.nom = String(req.body.nom).trim();
        if (req.body.fonction !== undefined) donnees.fonction = String(req.body.fonction).trim();
        if (req.body.actif !== undefined) donnees.actif = Boolean(req.body.actif);
        if (req.body.parDefaut !== undefined) donnees.parDefaut = Boolean(req.body.parDefaut);

        if (req.body.signatureImage) {
            if (!imageDepuisDataUrl(req.body.signatureImage)) {
                return res.status(400).json({ error: "L'image de signature est illisible." });
            }
            if (req.body.signatureImage.length > TAILLE_MAX) {
                return res.status(400).json({ error: 'Signature trop volumineuse.' });
            }
            donnees.signatureImage = req.body.signatureImage;
        }
        if (req.body.cachetImage !== undefined) {
            if (req.body.cachetImage && !imageDepuisDataUrl(req.body.cachetImage)) {
                return res.status(400).json({ error: "L'image du cachet est illisible." });
            }
            donnees.cachetImage = req.body.cachetImage || null;
        }

        const maj = await prisma.signataire.update({ where: { id }, data: donnees });
        if (maj.parDefaut) {
            await prisma.signataire.updateMany({
                where: { id: { not: id } }, data: { parDefaut: false }
            });
        }
        res.json(presenter(maj));
    } catch (error) {
        console.error('Erreur modification de signataire :', error);
        res.status(500).json({ error: 'Erreur lors de la modification.' });
    }
};

/**
 * Retire un signataire.
 *
 * La suppression n'efface rien des documents déjà émis : leur manifeste porte
 * le nom et la qualité du signataire au moment de l'émission, et le sceau
 * continue de les attester. Un signataire qui quitte l'entreprise se désactive
 * plutôt qu'il ne s'efface, pour que la liste garde sa mémoire.
 */
exports.supprimer = async (req, res) => {
    try {
        const s = await prisma.signataire.findUnique({ where: { id: req.params.id } });
        if (!s) return res.status(404).json({ error: 'Signataire introuvable.' });

        const emis = await prisma.issuedDocument.count({ where: { signataireNom: s.nom } });
        if (emis > 0) {
            return res.status(409).json({
                error: `${emis} document(s) ont été émis sous cette signature.`,
                remede: 'Le désactiver plutôt que le supprimer : les documents émis en gardent la trace.'
            });
        }

        await prisma.signataire.delete({ where: { id: s.id } });
        res.json({ message: `${s.nom} retiré des signataires.` });
    } catch (error) {
        console.error('Erreur suppression de signataire :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
};

/**
 * Vérification d'un sceau par un tiers.
 *
 * Le vérificateur apporte ce qu'il détient — le manifeste et le sceau lus sur
 * le document — et l'application se borne à confirmer ou infirmer. Rien n'est
 * divulgué : cette route ne permet pas d'interroger la base à partir d'un
 * identifiant.
 */
exports.verifierSceau = async (req, res) => {
    try {
        const { manifeste, sceau: valeur, keyId } = req.body;
        if (!manifeste || !valeur) {
            return res.status(400).json({ error: 'Manifeste et sceau requis.' });
        }
        const resultat = await sceau.verifier(manifeste, valeur, keyId);

        let contenu = null;
        try { contenu = JSON.parse(manifeste); } catch { contenu = null; }

        res.json({
            valide: resultat.valide,
            motif: resultat.motif,
            // Le contenu n'est rendu que si le sceau est valide : afficher les
            // mentions d'un manifeste falsifié reviendrait à les accréditer.
            document: resultat.valide ? contenu : null
        });
    } catch (error) {
        console.error('Erreur vérification de sceau :', error);
        res.status(500).json({ error: 'Erreur lors de la vérification.' });
    }
};

/** Clé publique, pour une vérification menée sans l'application. */
exports.getClePublique = async (req, res) => {
    try {
        const cle = await sceau.clePublique();
        res.json({
            keyId: cle.keyId,
            algorithme: cle.algorithme,
            clePublique: cle.publiquePem,
            usage: "Vérifier le sceau d'un document émis : le manifeste est signé tel quel, en UTF-8."
        });
    } catch (error) {
        console.error('Erreur lecture de la clé publique :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
