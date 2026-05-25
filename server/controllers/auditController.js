const prisma = require('../prismaClient');

exports.getAuditLogs = async (req, res) => {
    try {
        // Optionnel : Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: skip
        });

        const total = await prisma.auditLog.count();

        res.status(200).json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des logs d'audit" });
    }
};
