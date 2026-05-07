const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getEmployeeRecords = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const records = await prisma.disciplinaryRecord.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addRecord = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { date, type, reason, sanction } = req.body;
        
        const record = await prisma.disciplinaryRecord.create({
            data: {
                employeeId,
                date: new Date(date),
                type,
                reason,
                sanction,
                createdBy: req.user?.name || 'Système'
            }
        });
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
