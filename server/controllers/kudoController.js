const prisma = require('../prismaClient');

exports.sendKudo = async (req, res) => {
    try {
        const { receiverId, message, category } = req.body;
        const senderId = req.user.id; // From verifyToken

        if (senderId === receiverId) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer de Kudo à vous-même." });
        }

        const kudo = await prisma.$transaction(async (tx) => {
            // 1. Créer le Kudo
            const newKudo = await tx.kudo.create({
                data: { senderId, receiverId, message, category },
                include: { sender: { select: { firstName: true, lastName: true } } }
            });

            // 2. Ajouter des points au destinataire (ex: 50 points par Kudo)
            await tx.employeePoints.upsert({
                where: { employeeId: receiverId },
                update: { total: { increment: 50 } },
                create: { employeeId: receiverId, total: 50 }
            });

            // 3. Enregistrer l'événement de points
            await tx.pointEvent.create({
                data: {
                    employeeId: receiverId,
                    points: 50,
                    reason: `Kudo reçu de ${newKudo.sender.firstName} (${category})`
                }
            });

            // 4. Créer une notification pour le destinataire
            await tx.notification.create({
                data: {
                    employeeId: receiverId,
                    message: `Félicitations ! Vous avez reçu un Kudo de ${newKudo.sender.firstName} pour votre ${category}.`,
                    type: 'Succès',
                    link: '/rewards'
                }
            });

            return newKudo;
        });

        res.json(kudo);
    } catch (error) {
        console.error("Error sending kudo:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getKudos = async (req, res) => {
    try {
        const kudos = await prisma.kudo.findMany({
            include: {
                sender: { select: { firstName: true, lastName: true } },
                receiver: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(kudos);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await prisma.employeePoints.findMany({
            include: {
                employee: { select: { firstName: true, lastName: true, department: true, positionTitle: true } }
            },
            orderBy: { total: 'desc' },
            take: 10
        });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
