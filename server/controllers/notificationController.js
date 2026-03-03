const prisma = require('../prismaClient');

exports.getNotifications = async (req, res) => {
    try {
        const { id } = req.user;

        const notifications = await prisma.notification.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'desc' },
            take: 20 // Les 20 dernières
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Erreur Fetch Notifications:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.user;
        const { notifId } = req.params;

        const notif = await prisma.notification.findUnique({ where: { id: notifId } });

        if (!notif) return res.status(404).json({ error: "Notification non trouvée." });
        if (notif.employeeId !== id) return res.status(403).json({ error: "Interdit." });

        const updated = await prisma.notification.update({
            where: { id: notifId },
            data: { isRead: true }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error("Erreur read notification:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { id } = req.user;

        await prisma.notification.updateMany({
            where: { employeeId: id, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({ message: "Toutes les notifications ont été marquées lues." });
    } catch (error) {
        console.error("Erreur read all notifications:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
