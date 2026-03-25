const prisma = require('../prismaClient');

exports.getStats = async (req, res) => {
    try {
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' }
        });
        
        // Count leaves that are currently approved and active today
        const today = new Date();
        const activeLeaves = await prisma.leave.count({
            where: { 
                status: 'Approved',
                startDate: { lte: today },
                endDate: { gte: today }
            }
        });
        
        const pendingExpenses = await prisma.expense.count({
            where: { status: 'En attente' }
        });
        
        const availableAssets = await prisma.asset.count({
            where: { status: 'Disponible' }
        });

        res.json({
            totalEmployees,
            activeLeaves,
            pendingExpenses,
            availableAssets
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques du tableau de bord" });
    }
};
