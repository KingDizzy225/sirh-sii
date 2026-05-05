const prisma = require('../prismaClient');

exports.getShifts = async (req, res) => {
    try {
        const { email, role } = req.user;
        let shifts;
        
        if (role === 'Administrator' || role === 'HR' || role === 'Manager') {
            shifts = await prisma.shiftSchedule.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { date: 'asc' }
            });
        } else {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });

            shifts = await prisma.shiftSchedule.findMany({
                where: { employeeId: employee.id },
                orderBy: { date: 'asc' }
            });
        }
        res.json(shifts);
    } catch (error) {
        console.error("Error fetching shifts:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.createShift = async (req, res) => {
    try {
        const { employeeId, date, startTime, endTime, type } = req.body;
        const newShift = await prisma.shiftSchedule.create({
            data: {
                employeeId,
                date: new Date(date),
                startTime,
                endTime,
                type: type || 'Morning'
            }
        });
        res.status(201).json(newShift);
    } catch (error) {
        console.error("Error creating shift:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime, type } = req.body;
        
        const updateData = {};
        if (date) updateData.date = new Date(date);
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (type) updateData.type = type;

        const updated = await prisma.shiftSchedule.update({
            where: { id },
            data: updateData
        });
        res.json(updated);
    } catch (error) {
        console.error("Error updating shift:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shiftSchedule.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting shift:", error);
        res.status(500).json({ error: "Server error" });
    }
};
