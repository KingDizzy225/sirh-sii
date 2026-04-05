const prisma = require('../prismaClient');

// GET - Personal for employee, all for HR/Admin
exports.getAdvances = async (req, res) => {
    try {
        const { role, email } = req.user;
        const employee = await prisma.employee.findUnique({ where: { email } });
        let advances;
        if (role === 'ADMIN' || role === 'MANAGER' || role === 'HR' || role === 'Administrator' || role === 'Manager') {
            advances = await prisma.salaryAdvance.findMany({
                include: { employee: true },
                orderBy: { requestedAt: 'desc' }
            });
        } else {
            if (!employee) return res.status(404).json({ error: 'Employé introuvable' });
            advances = await prisma.salaryAdvance.findMany({
                where: { employeeId: employee.id },
                include: { employee: true },
                orderBy: { requestedAt: 'desc' }
            });
        }
        const formatted = advances.map(a => ({
            id: a.id,
            employee: `${a.employee.firstName} ${a.employee.lastName}`,
            department: a.employee.department,
            amount: a.amount,
            reason: a.reason,
            status: a.status,
            requestedAt: new Date(a.requestedAt).toLocaleDateString('fr-FR'),
            approvedBy: a.approvedBy,
        }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST - Submit a request
exports.createAdvance = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable' });
        const advance = await prisma.salaryAdvance.create({
            data: { employeeId: employee.id, amount: parseFloat(amount), reason }
        });
        res.status(201).json(advance);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// PUT - Approve / Reject
exports.updateAdvanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.salaryAdvance.update({
            where: { id },
            data: {
                status,
                approvedAt: status === 'Approuvé' ? new Date() : undefined,
                approvedBy: status === 'Approuvé' ? req.user.email : undefined
            }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
