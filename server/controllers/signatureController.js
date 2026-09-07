const prisma = require('../prismaClient');
const path = require('path');
const fs = require('fs');
const signature = require('../lib/signature');
const { getPublicAppUrl } = require('../lib/publicUrl');
const { canAccessEmployeeData } = require('../lib/access');

/**
 * Signature électronique des documents du dossier salarié.
 *
 * Remplace un dispositif qui affirmait plus qu'il ne faisait : la route
 * publique ne vérifiait aucun jeton, le fichier signé ne contenait que le
 * certificat — remplaçant le document en base — et rien ne reliait la signature
 * au contenu, cependant que le certificat annonçait « valeur légale ».
 */

const DOSSIER_CERTIFICATS = path.join(__dirname, '..', 'uploads', 'signatures');

/** Vue publique d'un document à signer : le strict nécessaire. */
const vuePublique = (doc) => ({
    id: doc.id,
    titre: doc.title,
    type: doc.type,
    signataire: doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : null,
    demandeLe: doc.updatedAt,
    expireLe: doc.tokenExpiresAt,
    dejaSigne: Boolean(doc.signedAt)
    // Ni le chemin du fichier, ni l'identifiant de l'employé, ni le reste du
    // dossier : cette page est ouverte sans authentification.
});

/**
 * Ouvre une demande de signature et produit le lien à transmettre au salarié.
 * Réservé à la RH : c'est elle qui décide qu'un document doit être signé.
 */
exports.demanderSignature = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await prisma.employeeDocument.findUnique({ where: { id } });
        if (!doc) return res.status(404).json({ error: 'Document introuvable.' });
        if (doc.signedAt) {
            return res.status(409).json({ error: 'Ce document est déjà signé.' });
        }

        const jeton = signature.nouveauJeton();
        const expire = signature.expiration();

        await prisma.employeeDocument.update({
            where: { id },
            data: {
                signatureToken: jeton,
                tokenExpiresAt: expire,
                signatureRequestedBy: (req.user && (req.user.email || req.user.name)) || null
            }
        });

        res.json({
            lien: `${getPublicAppUrl()}/sign/${jeton}`,
            expireLe: expire,
            validiteHeures: signature.VALIDITE_HEURES,
            // Le lien vaut autorisation de signer : le dire évite qu'il soit
            // transféré comme un lien de consultation ordinaire.
            avertissement: "Ce lien permet de signer le document. Il est à usage unique et ne doit être transmis qu'au signataire."
        });
    } catch (error) {
        console.error('Erreur demande de signature :', error);
        res.status(500).json({ error: "Erreur lors de l'ouverture de la demande de signature." });
    }
};

/** Document présenté au signataire, à partir du jeton. */
exports.getDocumentParJeton = async (req, res) => {
    try {
        const doc = await prisma.employeeDocument.findUnique({
            where: { signatureToken: req.params.token },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });

        // Même réponse pour un jeton inconnu et un jeton périmé : distinguer les
        // deux dirait à qui essaie des jetons lesquels ont existé.
        if (!doc || !doc.tokenExpiresAt || doc.tokenExpiresAt < new Date()) {
            return res.status(404).json({ error: 'Lien de signature invalide ou expiré.' });
        }
        res.json(vuePublique(doc));
    } catch (error) {
        console.error('Erreur lecture du document à signer :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

/**
 * Sert le document au porteur du lien.
 *
 * Signer un document qu'on ne peut pas lire n'a aucun sens ; mais le chemin du
 * fichier n'a pas à circuler sur une page ouverte. Le jeton donne accès au
 * contenu, jamais à son emplacement.
 */
exports.getFichierParJeton = async (req, res) => {
    try {
        const doc = await prisma.employeeDocument.findUnique({
            where: { signatureToken: req.params.token }
        });
        if (!doc || !doc.tokenExpiresAt || doc.tokenExpiresAt < new Date()) {
            return res.status(404).json({ error: 'Lien de signature invalide ou expiré.' });
        }

        const complet = signature.cheminAbsolu(doc.filePath);
        if (!complet || !fs.existsSync(complet)) {
            return res.status(404).json({ error: "Le document n'est plus présent sur le serveur." });
        }
        // Affiché dans le navigateur plutôt que téléchargé : le signataire doit
        // pouvoir le lire avant de signer.
        res.sendFile(complet);
    } catch (error) {
        console.error('Erreur lecture du document à signer :', error);
        if (!res.headersSent) res.status(500).json({ error: 'Erreur serveur.' });
    }
};

/** Écrit la signature et son certificat. Facteur commun aux deux voies. */
async function apposer({ doc, signatureDataUrl, signePar, ip }) {
    const empreinte = signature.empreinte(doc.filePath);

    const certificat = await signature.ecrireCertificat({
        document: doc,
        employe: doc.employee,
        signatureDataUrl,
        hash: empreinte,
        signePar,
        ip,
        dossier: DOSSIER_CERTIFICATS
    });

    return prisma.employeeDocument.update({
        where: { id: doc.id },
        data: {
            // Le document d'origine reste intact et reste le document du
            // dossier : le certificat l'accompagne, il ne le remplace pas.
            signedAt: new Date(),
            signedBy: signePar,
            signedIp: ip || null,
            signatureHash: empreinte,
            certificatePath: certificat.chemin,
            // Le jeton est consommé.
            signatureToken: null,
            tokenExpiresAt: null
        }
    });
}

/** Signature par le lien transmis au salarié. */
exports.signerParJeton = async (req, res) => {
    try {
        const { signatureDataUrl } = req.body;
        if (!signatureDataUrl) {
            return res.status(400).json({ error: 'Signature manquante.' });
        }

        const doc = await prisma.employeeDocument.findUnique({
            where: { signatureToken: req.params.token },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });

        if (!doc || !doc.tokenExpiresAt || doc.tokenExpiresAt < new Date()) {
            return res.status(404).json({ error: 'Lien de signature invalide ou expiré.' });
        }
        if (doc.signedAt) {
            return res.status(409).json({ error: 'Ce document a déjà été signé.' });
        }

        const signataire = doc.employee
            ? `${doc.employee.firstName} ${doc.employee.lastName}`
            : 'Signataire';

        await apposer({
            doc,
            signatureDataUrl,
            signePar: signataire,
            ip: req.ip || req.headers['x-forwarded-for'] || null
        });

        res.json({
            message: 'Document signé.',
            // L'empreinte est rendue au signataire : c'est sa preuve que la
            // signature porte sur ce document-là.
            empreinte: signature.empreinte(doc.filePath)
        });
    } catch (error) {
        console.error('Erreur signature par jeton :', error);
        res.status(500).json({ error: 'Erreur lors de la signature.' });
    }
};

/** Signature depuis l'application, par le salarié connecté. */
exports.signerConnecte = async (req, res) => {
    try {
        const { signatureDataUrl } = req.body;
        if (!signatureDataUrl) {
            return res.status(400).json({ error: 'Signature manquante.' });
        }

        const doc = await prisma.employeeDocument.findUnique({
            where: { id: req.params.id },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        if (!doc) return res.status(404).json({ error: 'Document introuvable.' });
        if (doc.signedAt) return res.status(409).json({ error: 'Ce document est déjà signé.' });

        // On ne signe que ses propres documents. La RH peut le faire pour un
        // salarié, mais alors le certificat porte le nom de qui a signé.
        if (!(await canAccessEmployeeData(req.user, doc.employeeId))) {
            return res.status(403).json({ error: "Vous ne pouvez signer que vos propres documents." });
        }

        const maj = await apposer({
            doc,
            signatureDataUrl,
            signePar: (req.user && (req.user.name || req.user.email)) || 'Signataire',
            ip: req.ip || req.headers['x-forwarded-for'] || null
        });

        res.json({ message: 'Document signé.', document: maj });
    } catch (error) {
        console.error('Erreur signature :', error);
        res.status(500).json({ error: 'Erreur lors de la signature.' });
    }
};

/** Certificat de signature d'un document. */
exports.telechargerCertificat = async (req, res) => {
    try {
        const doc = await prisma.employeeDocument.findUnique({ where: { id: req.params.id } });
        if (!doc) return res.status(404).json({ error: 'Document introuvable.' });
        if (!(await canAccessEmployeeData(req.user, doc.employeeId))) {
            return res.status(403).json({ error: 'Accès interdit à ce document.' });
        }
        if (!doc.certificatePath) {
            return res.status(404).json({ error: "Ce document n'est pas signé." });
        }

        const complet = signature.cheminAbsolu(doc.certificatePath);
        if (!complet || !fs.existsSync(complet)) {
            return res.status(404).json({
                error: "Le certificat n'est plus présent sur le serveur.",
                remede: "Vérifier qu'un disque persistant est attaché à l'hébergement."
            });
        }
        res.download(complet, `certificat_${doc.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error('Erreur lecture du certificat :', error);
        if (!res.headersSent) res.status(500).json({ error: 'Erreur serveur.' });
    }
};

/**
 * Vérifie qu'un document signé n'a pas été modifié depuis sa signature.
 * C'est ce que l'empreinte permet, et la seule raison de la conserver.
 */
exports.verifierIntegrite = async (req, res) => {
    try {
        const doc = await prisma.employeeDocument.findUnique({ where: { id: req.params.id } });
        if (!doc) return res.status(404).json({ error: 'Document introuvable.' });
        if (!(await canAccessEmployeeData(req.user, doc.employeeId))) {
            return res.status(403).json({ error: 'Accès interdit à ce document.' });
        }
        if (!doc.signedAt || !doc.signatureHash) {
            return res.json({ signe: false, intact: null, motif: "Document non signé." });
        }

        const actuelle = signature.empreinte(doc.filePath);
        if (!actuelle) {
            return res.json({
                signe: true, intact: null,
                motif: "Le fichier signé est introuvable : l'intégrité ne peut pas être vérifiée."
            });
        }

        res.json({
            signe: true,
            intact: actuelle === doc.signatureHash,
            empreinteSignature: doc.signatureHash,
            empreinteActuelle: actuelle,
            signeLe: doc.signedAt,
            signePar: doc.signedBy,
            motif: actuelle === doc.signatureHash
                ? "Le document est identique à celui qui a été signé."
                : "Le document diffère de celui qui a été signé."
        });
    } catch (error) {
        console.error('Erreur vérification d\'intégrité :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
