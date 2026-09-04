const prisma = require('../prismaClient');

/**
 * Vérification publique d'un document émis (scan du QR code).
 *
 * Accessible sans authentification : le vérificateur est une banque, un
 * bailleur ou une administration qui tient le document en main.
 *
 * Ne sont renvoyées que les mentions déjà portées sur le document lui-même —
 * jamais de rémunération, de coordonnées, de date de naissance ni d'identifiant
 * interne. Le jeton étant aléatoire sur 24 octets, il ne peut pas être deviné
 * ni énuméré, et un jeton inconnu ne révèle rien de plus qu'une non-validité.
 */
exports.verifyDocument = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token || !/^[a-f0-9]{48}$/.test(token)) {
            return res.status(404).json({ valide: false, motif: 'INTROUVABLE' });
        }

        const document = await prisma.issuedDocument.findUnique({
            where: { token },
            select: {
                type: true,
                issuedAt: true,
                revokedAt: true,
                revokedReason: true,
                employeeName: true,
                positionTitle: true,
                department: true,
                hireDate: true
            }
        });

        if (!document) {
            return res.status(404).json({ valide: false, motif: 'INTROUVABLE' });
        }

        if (document.revokedAt) {
            return res.status(200).json({
                valide: false,
                motif: 'REVOQUE',
                revoqueLe: document.revokedAt,
                revoqueRaison: document.revokedReason || null,
                emisLe: document.issuedAt
            });
        }

        res.status(200).json({
            valide: true,
            type: document.type,
            organisation: process.env.ORGANISATION_NAME || 'SIRH-SII',
            emisLe: document.issuedAt,
            titulaire: document.employeeName,
            fonction: document.positionTitle,
            departement: document.department,
            dateEmbauche: document.hireDate
        });
    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du document.' });
    }
};

/** Liste des documents émis pour un employé (RH/administration). */
exports.listIssuedDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const documents = await prisma.issuedDocument.findMany({
            where: { employeeId },
            orderBy: { issuedAt: 'desc' },
            select: {
                id: true, token: true, type: true, issuedAt: true,
                issuedByEmail: true, revokedAt: true, revokedReason: true
            }
        });
        res.json(documents);
    } catch (error) {
        console.error('Error listing issued documents:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des documents émis.' });
    }
};

/** Révocation d'un document émis par erreur ou devenu caduc. */
exports.revokeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const document = await prisma.issuedDocument.findUnique({ where: { id } });
        if (!document) return res.status(404).json({ error: 'Document introuvable.' });
        if (document.revokedAt) return res.status(400).json({ error: 'Document déjà révoqué.' });

        const updated = await prisma.issuedDocument.update({
            where: { id },
            data: { revokedAt: new Date(), revokedReason: reason || null }
        });

        res.json({ message: 'Document révoqué. Toute vérification le signalera désormais comme invalide.', document: updated });
    } catch (error) {
        console.error('Error revoking document:', error);
        res.status(500).json({ error: 'Erreur lors de la révocation.' });
    }
};
