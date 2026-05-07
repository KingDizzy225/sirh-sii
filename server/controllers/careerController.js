const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getEmployeeHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const history = await prisma.careerHistory.findMany({
            where: { employeeId },
            orderBy: { eventDate: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addHistoryEvent = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { eventDate, type, previousValue, newValue, comment } = req.body;
        
        const event = await prisma.careerHistory.create({
            data: {
                employeeId,
                eventDate: new Date(eventDate),
                type,
                previousValue,
                newValue,
                comment
            }
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
