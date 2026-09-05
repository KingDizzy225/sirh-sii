const prisma = require('../prismaClient');
const { hasRole } = require('../middleware/roleMiddleware');

exports.getMedicalRecords = async (req, res) => {
    try {
        // Données de santé : la RH, l'administration et le service social voient
        // l'ensemble du suivi ; tout autre utilisateur ne voit que son propre dossier.
        let where = {};
        if (!hasRole(req.user, ['ADMIN', 'HR', 'SOCIAL_WORKER'])) {
            const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
            if (!employee) return res.json([]);
            where = { employeeId: employee.id };
        }

        const records = await prisma.medicalRecord.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true } }
            },
            orderBy: { visitDate: 'desc' }
        });
        res.json(records);
    } catch (error) {
        console.error("Error fetching medical records:", error);
        res.status(500).json({ error: "Erreur de récupération du suivi médical." });
    }
};

/** Suppression d'une visite saisie par erreur. */
exports.deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await prisma.medicalRecord.findUnique({ where: { id } });
        if (!record) return res.status(404).json({ error: 'Visite médicale introuvable.' });

        await prisma.medicalRecord.delete({ where: { id } });
        res.json({ message: 'Visite médicale supprimée.' });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la visite.' });
    }
};

exports.createMedicalRecord = async (req, res) => {
    try {
        const { employeeId, visitType, visitDate, doctorName, aptitudeStatus, nextCheckupDate, notes } = req.body;

        const record = await prisma.medicalRecord.create({
            data: {
                employeeId,
                visitType: visitType || 'ANNUAL',
                visitDate: new Date(visitDate),
                doctorName: doctorName || 'Dr. Kouamé (Médecine du Travail Abidjan)',
                aptitudeStatus: aptitudeStatus || 'FIT',
                nextCheckupDate: nextCheckupDate ? new Date(nextCheckupDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                notes: notes || null
            },
            include: { employee: true }
        });

        res.status(201).json(record);
    } catch (error) {
        console.error("Error creating medical record:", error);
        res.status(500).json({ error: "Erreur lors de la création de la visite médicale." });
    }
};
