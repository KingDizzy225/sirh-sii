const prisma = require('../prismaClient');

exports.getMentorships = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const employee = await prisma.employee.findUnique({ where: { email: userEmail } });

        let whereClause = {};
        if (employee) {
            whereClause = { OR: [{ mentorId: employee.id }, { menteeId: employee.id }] };
        }

        const mentorships = await prisma.mentorshipRelation.findMany({
            where: whereClause,
            include: {
                mentor: { select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true } },
                mentee: { select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true } },
                sessions: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(mentorships);
    } catch (error) {
        console.error("Error fetching mentorships:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des mentorats." });
    }
};

exports.requestMentorship = async (req, res) => {
    try {
        const { mentorId, skillName, goals } = req.body;
        const userEmail = req.user.email;
        const mentee = await prisma.employee.findUnique({ where: { email: userEmail } });

        if (!mentee) return res.status(404).json({ error: "Profil employé introuvable." });
        if (!mentorId || !skillName) return res.status(400).json({ error: "Le mentor et la compétence visée sont obligatoires." });

        const relation = await prisma.$transaction(async (tx) => {
            const rel = await tx.mentorshipRelation.create({
                data: {
                    mentorId,
                    menteeId: mentee.id,
                    skillName,
                    goals: goals || null,
                    status: 'REQUESTED'
                },
                include: { mentor: true, mentee: true }
            });

            await tx.notification.create({
                data: {
                    employeeId: mentorId,
                    message: `${mentee.firstName} ${mentee.lastName} souhaite vous choisir comme Mentor pour la compétence "${skillName}".`,
                    type: 'Info',
                    link: '/mentorship'
                }
            });

            return rel;
        });

        res.status(201).json(relation);
    } catch (error) {
        console.error("Error requesting mentorship:", error);
        res.status(500).json({ error: "Erreur serveur lors de la demande de mentorat." });
    }
};

exports.updateMentorshipStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'ACTIVE', 'COMPLETED', 'DECLINED'

        const updated = await prisma.$transaction(async (tx) => {
            const rel = await tx.mentorshipRelation.update({
                where: { id },
                data: { status },
                include: { mentee: true, mentor: true }
            });

            if (status === 'COMPLETED') {
                // Upsert skill in GPEC matrix for mentee
                await tx.employeeSkill.create({
                    data: {
                        employeeId: rel.menteeId,
                        skillName: rel.skillName,
                        proficiencyLevel: 'Avancé',
                        interestedInTraining: false
                    }
                });

                // Award points to both mentor and mentee
                await tx.employeePoints.upsert({
                    where: { employeeId: rel.mentorId },
                    update: { total: { increment: 300 } },
                    create: { employeeId: rel.mentorId, total: 300 }
                });

                await tx.notification.create({
                    data: {
                        employeeId: rel.menteeId,
                        message: `Félicitations ! Votre cycle de mentorat sur "${rel.skillName}" est validé. Votre compétence GPEC a été mise à jour !`,
                        type: 'Succès',
                        link: '/skills'
                    }
                });
            }

            return rel;
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating mentorship:", error);
        res.status(500).json({ error: "Erreur de mise à jour du mentorat." });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { relationId, topic, date, durationMinutes, notes } = req.body;
        const session = await prisma.mentorshipSession.create({
            data: {
                relationId,
                topic,
                date: new Date(date),
                durationMinutes: durationMinutes ? parseInt(durationMinutes) : 60,
                notes: notes || null,
                status: 'SCHEDULED'
            }
        });
        res.status(201).json(session);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ error: "Erreur lors de la création de la session de mentorat." });
    }
};
