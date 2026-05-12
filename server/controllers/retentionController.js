const prisma = require('../prismaClient');

exports.getRetentionActions = async (req, res) => {
    try {
        const actions = await prisma.retentionAction.findMany({
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, positionTitle: true, department: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(actions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.createRetentionAction = async (req, res) => {
    try {
        const { employeeId, riskLevel, recommendedAction } = req.body;
        const action = await prisma.retentionAction.create({
            data: { employeeId, riskLevel, recommendedAction }
        });
        res.status(201).json(action);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.updateRetentionStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'COMPLETED', 'REJECTED', 'PENDING'
        const action = await prisma.retentionAction.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(action);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteRetentionAction = async (req, res) => {
    try {
        await prisma.retentionAction.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
