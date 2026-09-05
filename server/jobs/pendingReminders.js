const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');

const JOURS_ATTENTE = parseInt(process.env.REMINDER_DAYS || '3', 10);

/** Notifie la RH et l'administration, sans doublon d'alerte non lue. */
async function notifierRH(message, type, lien) {
    const destinataires = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' }, role: { in: ['HR', 'Administrator'] } },
        select: { id: true }
    });
    for (const d of destinataires) {
        const existe = await prisma.notification.findFirst({
            where: { employeeId: d.id, message, isRead: false }
        });
        if (existe) continue;
        await prisma.notification.create({
            data: { employeeId: d.id, message, type, link: lien }
        });
    }
}

/**
 * Relance les demandes laissées sans réponse.
 *
 * Une demande de congé ou d'acompte oubliée est invisible : elle n'apparaît
 * nulle part tant que personne n'ouvre l'écran correspondant. Le salarié, lui,
 * attend sans savoir. Cette relance quotidienne rend l'oubli visible.
 */
async function relancerDemandesEnAttente(referenceDate = new Date()) {
    return runOnce('PENDING_REMINDERS', dayPeriod(referenceDate), async () => {
        const limite = new Date(referenceDate);
        limite.setDate(limite.getDate() - JOURS_ATTENTE);

        const resume = [];

        // Les statuts coexistent en deux écritures selon l'ancienneté du code
        // ('Pending' à la création, 'PENDING'/'PENDING_HR' dans le circuit
        // d'approbation) : les deux doivent être relancées.
        const conges = await prisma.leave.findMany({
            where: {
                status: { in: ['PENDING', 'PENDING_HR', 'Pending'] },
                createdAt: { lte: limite }
            },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        for (const c of conges) {
            await notifierRH(
                `Demande de congé en attente depuis plus de ${JOURS_ATTENTE} jours : ` +
                `${c.employee.firstName} ${c.employee.lastName}.`,
                'Alerte',
                '/leaves'
            );
        }
        resume.push(`${conges.length} congé(s)`);

        // Les acomptes portent un statut en français et datent leur demande
        // dans `requestedAt`, non `createdAt`.
        const avances = await prisma.salaryAdvance.findMany({
            where: { status: 'En attente', requestedAt: { lte: limite } },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        for (const a of avances) {
            await notifierRH(
                `Demande d'acompte en attente depuis plus de ${JOURS_ATTENTE} jours : ` +
                `${a.employee.firstName} ${a.employee.lastName}.`,
                'Alerte',
                '/advances'
            );
        }
        resume.push(`${avances.length} acompte(s)`);

        return resume.join(', ') + ` sans réponse depuis ${JOURS_ATTENTE} jours`;
    });
}

module.exports = { relancerDemandesEnAttente, notifierRH };
