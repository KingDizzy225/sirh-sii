const prisma = require('../prismaClient');

// GET all medical visits
exports.getMedicalVisits = async (req, res) => {
    try {
        const visits = await prisma.medicalVisit.findMany({
            include: { employee: { select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true } } },
            orderBy: { expiryDate: 'asc' }
        });
        const now = new Date();
        const in30Days = new Date(now); in30Days.setDate(now.getDate() + 30);
        const formatted = visits.map(v => ({
            id: v.id,
            employeeId: v.employeeId,
            employee: `${v.employee.firstName} ${v.employee.lastName}`,
            department: v.employee.department,
            positionTitle: v.employee.positionTitle,
            visitDate: new Date(v.visitDate).toLocaleDateString('fr-FR'),
            expiryDate: new Date(v.expiryDate).toLocaleDateString('fr-FR'),
            expiryRaw: v.expiryDate,
            result: v.result,
            restrictions: v.restrictions,
            doctor: v.doctor,
            alertLevel: v.expiryDate < now ? 'Expiré' : v.expiryDate < in30Days ? 'Expire bientôt' : 'OK'
        }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// GET alerts only (expired + expiring in 30 days)
exports.getMedicalAlerts = async (req, res) => {
    try {
        const in30Days = new Date(); in30Days.setDate(in30Days.getDate() + 30);
        const alerts = await prisma.medicalVisit.findMany({
            where: { expiryDate: { lte: in30Days } },
            include: { employee: { select: { firstName: true, lastName: true, department: true } } },
            orderBy: { expiryDate: 'asc' }
        });
        res.json(alerts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST create a new visit
exports.createMedicalVisit = async (req, res) => {
    try {
        const { employeeId, visitDate, result, restrictions, doctor, notes } = req.body;
        const vDate = new Date(visitDate);
        const expiryDate = new Date(vDate); expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const visit = await prisma.medicalVisit.create({
            data: { employeeId, visitDate: vDate, expiryDate, result, restrictions, doctor, notes }
        });
        res.status(201).json(visit);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// DELETE
exports.deleteMedicalVisit = async (req, res) => {
    try {
        await prisma.medicalVisit.delete({ where: { id: req.params.id } });
        res.json({ message: 'Visite supprimée.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
