const prisma = require('../prismaClient');

exports.getMedicalRecords = async (req, res) => {
    try {
        const records = await prisma.medicalRecord.findMany({
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
