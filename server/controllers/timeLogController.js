const prisma = require('../prismaClient');

// Get today's time logs for the logged-in employee
exports.getTodayLogs = async (req, res) => {
    try {
        const email = req.user.email;
        const employee = await prisma.employee.findUnique({ where: { email } });
        
        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const logs = await prisma.timeLog.findMany({
            where: {
                employeeId: employee.id,
                timestamp: { gte: startOfDay }
            },
            orderBy: { timestamp: 'asc' }
        });

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching today's time logs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Log a time entry (Clock In or Clock Out)
exports.logTime = async (req, res) => {
    try {
        const { type } = req.body; // 'CLOCK_IN' or 'CLOCK_OUT'
        if (!['CLOCK_IN', 'CLOCK_OUT'].includes(type)) {
            return res.status(400).json({ error: "Type de pointage invalide" });
        }

        const email = req.user.email;
        const employee = await prisma.employee.findUnique({ where: { email } });
        
        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        const newLog = await prisma.timeLog.create({
            data: {
                employeeId: employee.id,
                type: type
            }
        });

        res.status(201).json(newLog);
    } catch (error) {
        console.error("Error logging time:", error);
        res.status(500).json({ error: "Erreur lors du pointage" });
    }
};
