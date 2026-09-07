const prisma = require('../prismaClient');

exports.getSubcontractors = async (req, res) => {
    try {
        const subcontractors = await prisma.subcontractor.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(subcontractors);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.createSubcontractor = async (req, res) => {
    try {
        const { firstName, lastName, companyName, type, startDate, endDate, rate, department } = req.body;
        
        const newSub = await prisma.subcontractor.create({
            data: {
                firstName,
                lastName,
                companyName,
                type: type || 'Freelance',
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                rate: rate ? parseFloat(rate) : null,
                department
            }
        });
        res.status(201).json(newSub);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateSubcontractor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, endDate } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (endDate) updateData.endDate = new Date(endDate);

        const updated = await prisma.subcontractor.update({
            where: { id },
            data: updateData
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// ----------------------------------------------------
// Conformité des prestataires
// ----------------------------------------------------

const sousTraitance = require('../lib/sousTraitance');

/** Liste des pièces attendues, pour l'écran de saisie. */
exports.getPieces = (req, res) => {
    res.json({
        preavisJours: sousTraitance.PREAVIS_JOURS,
        pieces: sousTraitance.PIECES
    });
};

/**
 * Bilan de conformité de l'ensemble des prestataires.
 *
 * Les prestataires sortis ne sont pas comptés : leurs attestations expirent
 * sans conséquence, et les laisser dans le décompte ferait passer pour un
 * manquement ce qui n'en est plus un.
 */
exports.getConformite = async (req, res) => {
    try {
        const prestataires = await prisma.subcontractor.findMany({
            where: { status: { not: 'Terminated' } },
            include: { documents: true },
            orderBy: { companyName: 'asc' }
        });

        const bilans = prestataires.map((p) => sousTraitance.bilan(p, p.documents));

        res.json({
            preavisJours: sousTraitance.PREAVIS_JOURS,
            total: bilans.length,
            couverts: bilans.filter((b) => b.couvert).length,
            decouverts: bilans.filter((b) => !b.couvert).length,
            aRenouveler: bilans.filter((b) => b.aRenouveler.length > 0).length,
            prestataires: bilans
        });
    } catch (error) {
        console.error('Erreur conformité sous-traitance :', error);
        res.status(500).json({ error: 'Erreur lors du contrôle de conformité.' });
    }
};

/** Pièces d'un prestataire. */
exports.getDocuments = async (req, res) => {
    try {
        const prestataire = await prisma.subcontractor.findUnique({
            where: { id: req.params.id },
            include: { documents: { orderBy: { createdAt: 'desc' } } }
        });
        if (!prestataire) return res.status(404).json({ error: 'Prestataire introuvable.' });

        res.json({
            ...sousTraitance.bilan(prestataire, prestataire.documents),
            documents: prestataire.documents.map((d) => ({
                ...d,
                etat: sousTraitance.etatPiece(d)
            }))
        });
    } catch (error) {
        console.error('Erreur lecture des pièces :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des pièces.' });
    }
};

/** Verse une pièce au dossier d'un prestataire. */
exports.addDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, reference, issuedAt, expiresAt, note, filePath } = req.body;

        if (!sousTraitance.CODES.includes(type)) {
            return res.status(400).json({
                error: `Type de pièce inconnu : ${type}.`,
                types: sousTraitance.CODES
            });
        }

        const prestataire = await prisma.subcontractor.findUnique({ where: { id } });
        if (!prestataire) return res.status(404).json({ error: 'Prestataire introuvable.' });

        const delivree = issuedAt ? new Date(issuedAt) : null;
        if (delivree && isNaN(delivree.getTime())) {
            return res.status(400).json({ error: 'Date de délivrance invalide.' });
        }
        if (delivree && delivree > new Date()) {
            return res.status(400).json({ error: "Une pièce ne peut pas être délivrée à une date future." });
        }

        // Échéance déduite de la durée de validité usuelle quand elle n'est pas
        // fournie : une attestation sans date de fin passerait pour valable
        // indéfiniment, ce qu'aucune attestation n'est.
        let fin = expiresAt ? new Date(expiresAt) : null;
        if (fin && isNaN(fin.getTime())) {
            return res.status(400).json({ error: "Date d'expiration invalide." });
        }
        let echeanceDeduite = false;
        if (!fin) {
            fin = sousTraitance.echeanceParDefaut(type, delivree);
            echeanceDeduite = Boolean(fin);
        }
        if (fin && delivree && fin < delivree) {
            return res.status(400).json({ error: "L'expiration précède la délivrance." });
        }

        const document = await prisma.subcontractorDocument.create({
            data: {
                subcontractorId: id,
                type,
                reference: reference || null,
                issuedAt: delivree,
                expiresAt: fin,
                filePath: filePath || null,
                note: note || null,
                createdBy: (req.user && (req.user.email || req.user.name)) || null
            }
        });

        res.status(201).json({
            ...document,
            etat: sousTraitance.etatPiece(document),
            echeanceDeduite,
            // Une échéance déduite est une hypothèse, pas une lecture de la
            // pièce : le dire évite de la prendre pour une donnée constatée.
            avertissement: echeanceDeduite
                ? "Échéance déduite de la durée de validité usuelle. À corriger si la pièce en porte une autre."
                : null
        });
    } catch (error) {
        console.error('Erreur ajout de pièce :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de la pièce." });
    }
};

/** Retire une pièce versée par erreur. */
exports.deleteDocument = async (req, res) => {
    try {
        const document = await prisma.subcontractorDocument.findUnique({
            where: { id: req.params.documentId }
        });
        if (!document) return res.status(404).json({ error: 'Pièce introuvable.' });

        await prisma.subcontractorDocument.delete({ where: { id: document.id } });
        res.json({ message: 'Pièce retirée du dossier.' });
    } catch (error) {
        console.error('Erreur suppression de pièce :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
};
