const prisma = require('../prismaClient');

exports.getOffboardingTasks = async (req, res) => {
    try {
        const { email, role } = req.user;
        let tasks;
        
        if (role === 'Administrator' || role === 'HR') {
            tasks = await prisma.offboardingTask.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });

            tasks = await prisma.offboardingTask.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching offboarding tasks:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.createOffboardingTask = async (req, res) => {
    try {
        const { employeeId, taskName, assignedTo } = req.body;
        const newTask = await prisma.offboardingTask.create({
            data: {
                employeeId,
                taskName,
                assignedTo
            }
        });
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error creating offboarding task:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateOffboardingTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.offboardingTask.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        console.error("Error updating offboarding task:", error);
        res.status(500).json({ error: "Server error" });
    }
};
