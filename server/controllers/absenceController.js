const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer pour les justificatifs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/justificatifs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `justif_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
    }
});
exports.upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/absences — Toutes les absences (RH/Admin/Manager)
exports.getAbsences = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        const where = {};

        if (employeeId) where.employeeId = employeeId;

        if (month && year) {
            const start = new Date(parseInt(year), parseInt(month) - 1, 1);
            const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            where.date = { gte: start, lte: end };
        }

        const absences = await prisma.absence.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.json(absences);
    } catch (error) {
        console.error('Error fetching absences:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// GET /api/absences/my — Mes absences (employé connecté)
exports.getMyAbsences = async (req, res) => {
    try {
        const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable' });

        const absences = await prisma.absence.findMany({
            where: { employeeId: employee.id },
            orderBy: { date: 'desc' }
        });

        res.json(absences);
    } catch (error) {
        console.error('Error fetching my absences:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// POST /api/absences — Créer une absence/retard (RH/Manager)
exports.createAbsence = async (req, res) => {
    try {
        const { employeeId, type, date, durationMinutes, justification } = req.body;

        if (!employeeId || !type || !date) {
            return res.status(400).json({ error: 'Champs obligatoires manquants (employé, type, date).' });
        }

        const absence = await prisma.absence.create({
            data: {
                employeeId,
                type,
                date: new Date(date),
                durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
                justification: justification || null,
                status: 'Non justifié',
                createdBy: req.user?.email || 'Système'
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.status(201).json(absence);
    } catch (error) {
        console.error('Error creating absence:', error);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
};

// POST /api/absences/:id/justificatif — Upload justificatif (employé)
exports.uploadJustificatif = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const justificatifPath = `/uploads/justificatifs/${req.file.filename}`;

        const updated = await prisma.absence.update({
            where: { id },
            data: {
                justificatifPath,
                status: 'En attente de validation'
            }
        });

        res.json({ message: 'Justificatif uploadé avec succès', absence: updated });
    } catch (error) {
        console.error('Error uploading justificatif:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
};

// PUT /api/absences/:id/status — Valider ou Contester (RH)
exports.updateAbsenceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Justifié', 'Contesté', 'Non justifié', 'En attente de validation'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const updated = await prisma.absence.update({
            where: { id },
            data: { status },
            include: {
                employee: { select: { firstName: true, lastName: true } }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating absence status:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// DELETE /api/absences/:id — Supprimer (RH/Admin)
exports.deleteAbsence = async (req, res) => {
    try {
        await prisma.absence.delete({ where: { id: req.params.id } });
        res.json({ message: 'Absence supprimée.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};
