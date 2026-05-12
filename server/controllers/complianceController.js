const prisma = require('../prismaClient');

exports.getComplianceRules = async (req, res) => {
    try {
        const rules = await prisma.complianceRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(rules);
    } catch (error) {
        console.error('Error fetching compliance rules:', error);
        res.status(500).json({ error: 'Failed to fetch compliance rules' });
    }
};

exports.createComplianceRule = async (req, res) => {
    try {
        const { title, description, target, frequencyMonths } = req.body;
        const newRule = await prisma.complianceRule.create({
            data: { title, description, target, frequencyMonths: parseInt(frequencyMonths) }
        });
        res.status(201).json(newRule);
    } catch (error) {
        console.error('Error creating compliance rule:', error);
        res.status(500).json({ error: 'Failed to create compliance rule' });
    }
};

exports.deleteComplianceRule = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.complianceRule.delete({ where: { id } });
        res.status(200).json({ message: 'Compliance rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting compliance rule:', error);
        res.status(500).json({ error: 'Failed to delete compliance rule' });
    }
};
