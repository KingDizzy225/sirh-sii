const prisma = require('../prismaClient');

exports.getSuccessionPlans = async (req, res) => {
    try {
        const plans = await prisma.successionPlan.findMany({
            include: {
                successors: {
                    include: {
                        employee: {
                            select: { id: true, firstName: true, lastName: true, positionTitle: true, department: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const { positionTitle, department, criticality } = req.body;
        const plan = await prisma.successionPlan.create({
            data: { positionTitle, department, criticality }
        });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        await prisma.successionPlan.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// SUCCESSORS

exports.addSuccessor = async (req, res) => {
    try {
        const { planId, employeeId, readiness, notes } = req.body;
        
        // check if employee is already a successor in this plan
        const existing = await prisma.successor.findFirst({
            where: { planId, employeeId }
        });
        if (existing) return res.status(400).json({ error: "Cet employé est déjà dans le plan de succession." });

        const successor = await prisma.successor.create({
            data: { planId, employeeId, readiness, notes }
        });
        res.status(201).json(successor);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.updateSuccessor = async (req, res) => {
    try {
        const { readiness, notes } = req.body;
        const successor = await prisma.successor.update({
            where: { id: req.params.id },
            data: { readiness, notes }
        });
        res.json(successor);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.removeSuccessor = async (req, res) => {
    try {
        await prisma.successor.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
