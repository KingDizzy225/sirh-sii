const prisma = require('../prismaClient');

exports.getCriticalAlerts = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(today.getDate() + 15);

        // 1. Contrats arrivant à échéance (CDD)
        const expiringContracts = await prisma.employee.findMany({
            where: {
                status: 'ACTIVE',
                contractType: { not: 'CDI' },
                contractEndDate: {
                    gte: today,
                    lte: thirtyDaysFromNow
                }
            },
            select: { id: true, firstName: true, lastName: true, contractEndDate: true, contractType: true }
        });

        // 2. Fins de périodes d'essai
        const trialEndings = await prisma.employee.findMany({
            where: {
                status: 'ACTIVE',
                trialPeriodEndDate: {
                    gte: today,
                    lte: fifteenDaysFromNow
                }
            },
            select: { id: true, firstName: true, lastName: true, trialPeriodEndDate: true }
        });

        // 3. Visites médicales à venir
        // La requête portait sur `medicalVisit`, une table qu'aucun contrôleur
        // n'écrit : le module de médecine du travail enregistre des
        // `medicalRecord`. L'alerte ne pouvait donc jamais se déclencher.
        // L'échéance pertinente est `nextCheckupDate`, la prochaine visite due,
        // et non la date de la visite déjà passée.
        const medicalVisits = await prisma.medicalRecord.findMany({
            where: {
                nextCheckupDate: {
                    gte: today,
                    lte: fifteenDaysFromNow
                }
            },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });

        const alerts = [
            ...expiringContracts.map(e => ({
                id: `contract-${e.id}`,
                type: 'CONTRACT_EXPIRY',
                title: 'Fin de contrat imminente',
                message: `${e.firstName} ${e.lastName} (${e.contractType}) se termine le ${new Date(e.contractEndDate).toLocaleDateString('fr-FR')}`,
                severity: 'high',
                link: `/employees/${e.id}`
            })),
            ...trialEndings.map(e => ({
                id: `trial-${e.id}`,
                type: 'TRIAL_EXPIRY',
                title: 'Fin de période d\'essai',
                message: `La période d'essai de ${e.firstName} ${e.lastName} se termine le ${new Date(e.trialPeriodEndDate).toLocaleDateString('fr-FR')}`,
                severity: 'medium',
                link: `/employees/${e.id}`
            })),
            ...medicalVisits.map(v => ({
                id: `medical-${v.id}`,
                type: 'MEDICAL_VISIT',
                title: 'Visite médicale prévue',
                // `nextCheckupDate` et non `visitDate` : c'est l'échéance à
                // venir qui est annoncée, pas la visite déjà effectuée.
                message: `Visite à prévoir pour ${v.employee.firstName} ${v.employee.lastName} avant le ${new Date(v.nextCheckupDate).toLocaleDateString('fr-FR')}`,
                severity: 'low',
                link: '/medical'
            }))
        ];

        res.json(alerts);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { id } = req.user; // assuming verifyToken attaches user with id
        const notifications = await prisma.notification.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notifId } = req.params;
        await prisma.notification.update({
            where: { id: notifId },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
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
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
