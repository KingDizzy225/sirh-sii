const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');

const DAYS_AHEAD = parseInt(process.env.ALERT_DAYS_AHEAD || '30', 10);

/** Notifie la RH et l'administration (une notification par destinataire). */
async function notifyHR(message, type, link) {
    const recipients = await prisma.employee.findMany({
        where: {
            status: { not: 'TERMINATED' },
            role: { in: ['HR', 'Administrator'] }
        },
        select: { id: true }
    });

    for (const recipient of recipients) {
        // Ne pas réémettre une alerte identique déjà non lue
        const existing = await prisma.notification.findFirst({
            where: { employeeId: recipient.id, message, isRead: false }
        });
        if (existing) continue;

        await prisma.notification.create({
            data: { employeeId: recipient.id, message, type, link }
        });
    }
    return recipients.length;
}

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

/**
 * Balaie les échéances RH et crée les notifications correspondantes.
 *
 * Ces alertes existaient à l'écran mais n'étaient calculées que lorsqu'un
 * utilisateur ouvrait le tableau de bord : une échéance pouvait passer
 * inaperçue si personne ne regardait au bon moment.
 */
async function scanDeadlines(referenceDate = new Date()) {
    const period = dayPeriod(referenceDate);

    return runOnce('DEADLINE_ALERTS', period, async () => {
        const horizon = new Date(referenceDate);
        horizon.setDate(horizon.getDate() + DAYS_AHEAD);

        const summary = [];

        // 1. Fins de CDD approchantes
        const endingContracts = await prisma.employee.findMany({
            where: {
                status: { not: 'TERMINATED' },
                contractEndDate: { gte: referenceDate, lte: horizon }
            },
            select: { firstName: true, lastName: true, contractEndDate: true }
        });
        for (const e of endingContracts) {
            await notifyHR(
                `Fin de contrat le ${formatDate(e.contractEndDate)} : ${e.firstName} ${e.lastName}. Renouvellement ou sortie à préparer.`,
                'Alerte',
                '/employees'
            );
        }
        summary.push(`${endingContracts.length} fin(s) de contrat`);

        // 2. Périodes d'essai arrivant à terme
        const endingTrials = await prisma.employee.findMany({
            where: {
                status: { not: 'TERMINATED' },
                trialPeriodEndDate: { gte: referenceDate, lte: horizon }
            },
            select: { firstName: true, lastName: true, trialPeriodEndDate: true }
        });
        for (const e of endingTrials) {
            await notifyHR(
                `Fin de période d'essai le ${formatDate(e.trialPeriodEndDate)} : ${e.firstName} ${e.lastName}. Décision de confirmation à prendre.`,
                'Alerte',
                '/employees'
            );
        }
        summary.push(`${endingTrials.length} période(s) d'essai`);

        // 3. Visites médicales à replanifier
        const dueCheckups = await prisma.medicalRecord.findMany({
            where: { nextCheckupDate: { gte: referenceDate, lte: horizon } },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        for (const record of dueCheckups) {
            await notifyHR(
                `Visite médicale à planifier avant le ${formatDate(record.nextCheckupDate)} : ${record.employee.firstName} ${record.employee.lastName}.`,
                'Info',
                '/medical-hub'
            );
        }
        summary.push(`${dueCheckups.length} visite(s) médicale(s)`);

        return summary.join(', ') + ` (horizon ${DAYS_AHEAD} jours)`;
    });
}

module.exports = { scanDeadlines, DAYS_AHEAD };
