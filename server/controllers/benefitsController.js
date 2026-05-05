const prisma = require('../prismaClient');

exports.getBenefits = async (req, res) => {
    try {
        const { email, role } = req.user;
        let benefits;
        
        if (role === 'Administrator' || role === 'HR') {
            benefits = await prisma.employeeBenefit.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });

            benefits = await prisma.employeeBenefit.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(benefits);
    } catch (error) {
        console.error("Error fetching benefits:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.enrollBenefit = async (req, res) => {
    try {
        const { employeeId, type, provider, planLevel } = req.body;
        const newBenefit = await prisma.employeeBenefit.create({
            data: {
                employeeId,
                type: type || 'Mutuelle',
                provider,
                planLevel,
                status: 'Pending'
            }
        });
        res.status(201).json(newBenefit);
    } catch (error) {
        console.error("Error creating benefit:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateBenefit = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, planLevel } = req.body;
        const updated = await prisma.employeeBenefit.update({
            where: { id },
            data: { status, planLevel }
        });
        res.json(updated);
    } catch (error) {
        console.error("Error updating benefit:", error);
        res.status(500).json({ error: "Server error" });
    }
};
