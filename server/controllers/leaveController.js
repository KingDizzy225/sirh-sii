const prisma = require('../prismaClient');

// Get all leaves
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await prisma.leave.findMany({
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
};

// Create a new leave request
exports.createLeave = async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, reason } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

        const newLeave = await prisma.leave.create({
            data: {
                employeeId,
                type,
                startDate: start,
                endDate: end,
                reason,
                status: 'PENDING',
                durationDays
            },
            include: { employee: true }
        });

        res.status(201).json(newLeave);
    } catch (error) {
        console.error('Error creating leave:', error);
        res.status(500).json({ error: 'Failed to create leave request' });
    }
};

// Update leave status (Approve/Reject)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'APPROVED', 'REJECTED'

        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: { status },
            include: { employee: true }
        });

        res.status(200).json(updatedLeave);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ error: 'Failed to update leave status' });
    }
};
