const prisma = require('../prismaClient');

exports.getAuditLogs = async (req, res) => {
    try {
        // Optionnel : Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
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

/**
 * Consultations du dossier du salarié connecté : qui l'a ouvert, et quand.
 *
 * Détenir les salaires et les données de santé de quelqu'un crée une
 * obligation de transparence envers lui. Cet écran la rend effective : le
 * salarié voit lui-même les accès à son dossier, sans passer par la RH.
 */
exports.getMyAccessTrace = async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { email: req.user.email },
            select: { id: true }
        });
        if (!employee) return res.json([]);

        const acces = await prisma.auditLog.findMany({
            where: { action: 'CONSULT', recordId: employee.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // On expose qui a consulté et quoi, jamais l'adresse IP du consultant :
        // la transparence attendue porte sur l'accès, pas sur la localisation
        // d'un collègue.
        res.json(acces.map((a) => {
            let details = {};
            try { details = JSON.parse(a.newData || '{}'); } catch (e) { details = {}; }
            return {
                id: a.id,
                date: a.createdAt,
                ressource: a.tableName,
                consultePar: details.consultePar || 'Utilisateur inconnu',
                role: details.role || null
            };
        }));
    } catch (error) {
        console.error('Error fetching access trace:', error);
        res.status(500).json({ error: "Erreur lors de la lecture des consultations." });
    }
};
