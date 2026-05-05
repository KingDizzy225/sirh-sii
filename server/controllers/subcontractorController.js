const prisma = require('../prismaClient');

exports.getSubcontractors = async (req, res) => {
    try {
        const subcontractors = await prisma.subcontractor.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(subcontractors);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.createSubcontractor = async (req, res) => {
    try {
        const { firstName, lastName, companyName, type, startDate, endDate, rate, department } = req.body;
        
        const newSub = await prisma.subcontractor.create({
            data: {
                firstName,
                lastName,
                companyName,
                type: type || 'Freelance',
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                rate: rate ? parseFloat(rate) : null,
                department
            }
        });
        res.status(201).json(newSub);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateSubcontractor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, endDate } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (endDate) updateData.endDate = new Date(endDate);

        const updated = await prisma.subcontractor.update({
            where: { id },
            data: updateData
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
