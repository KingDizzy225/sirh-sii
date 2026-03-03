const prisma = require('../prismaClient');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été fourni." });
        }

        const { id, role, firstName, lastName } = req.user;
        const { title, type, employeeId } = req.body;

        const targetEmployeeId = employeeId || id;

        // Validation RH/Admin
        if (role === 'Employee' && targetEmployeeId !== id) {
            // Un employé ne peut verser que pour lui-même
            fs.unlinkSync(req.file.path); // Delete the uploaded file since unauthorized
            return res.status(403).json({ error: "Accès non autorisé au coffre de cet employé." });
        }

        const filePath = `/uploads/${req.file.filename}`;

        const newDoc = await prisma.employeeDocument.create({
            data: {
                employeeId: targetEmployeeId,
                title: title || req.file.originalname,
                type: type || 'Autre',
                filePath,
                fileSize: req.file.size,
                uploadedBy: `${firstName} ${lastName}`
            }
        });

        res.status(201).json(newDoc);
    } catch (error) {
        console.error("Erreur Upload Document:", error);
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ error: "Erreur serveur lors de l'enregistrement du document." });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const { id, role } = req.user;
        const targetEmployeeId = req.query.employeeId || id;

        if (role === 'Employee' && targetEmployeeId !== id) {
            return res.status(403).json({ error: "Vous ne pouvez consulter que vos propres documents." });
        }

        const docs = await prisma.employeeDocument.findMany({
            where: { employeeId: targetEmployeeId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(docs);
    } catch (error) {
        console.error("Erreur Fetch Documents:", error);
        res.status(500).json({ error: "Erreur serveur de récupération." });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { docId } = req.params;

        const doc = await prisma.employeeDocument.findUnique({ where: { id: docId } });
        if (!doc) return res.status(404).json({ error: "Document introuvable." });

        if (role === 'Employee' && doc.employeeId !== id) {
            return res.status(403).json({ error: "Vous n'avez pas l'autorisation de supprimer ce document." });
        }

        // Supprimer physiquement le fichier
        const fullPath = path.join(__dirname, '..', doc.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await prisma.employeeDocument.delete({ where: { id: docId } });
        res.status(200).json({ message: "Document supprimé avec succès." });
    } catch (error) {
        console.error("Erreur Delete Document:", error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
};
