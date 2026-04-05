const prisma = require('../prismaClient');

// GET leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const allPoints = await prisma.employeePoints.findMany({
            include: { employee: { select: { firstName: true, lastName: true, department: true, positionTitle: true } } },
            orderBy: { total: 'desc' }
        });
        const leaderboard = allPoints.map((ep, i) => ({
            rank: i + 1,
            employeeId: ep.employeeId,
            name: `${ep.employee.firstName} ${ep.employee.lastName}`,
            department: ep.employee.department,
            positionTitle: ep.employee.positionTitle,
            total: ep.total,
            badge: ep.total >= 500 ? 'Platine' : ep.total >= 200 ? 'Or' : ep.total >= 100 ? 'Argent' : 'Bronze'
        }));
        res.json(leaderboard);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// GET history for logged-in user
exports.getMyHistory = async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable' });
        const events = await prisma.pointEvent.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST award points (manual, HR/Admin)
exports.awardPoints = async (req, res) => {
    try {
        const { employeeId, points, reason } = req.body;
        // Create point event
        await prisma.pointEvent.create({ data: { employeeId, points: parseInt(points), reason } });
        // Upsert total
        const updated = await prisma.employeePoints.upsert({
            where: { employeeId },
            create: { employeeId, total: parseInt(points) },
            update: { total: { increment: parseInt(points) } }
        });
        res.status(201).json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
