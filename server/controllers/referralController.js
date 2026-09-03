const prisma = require('../prismaClient');

// Get all referrals
exports.getAllReferrals = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const employee = await prisma.employee.findUnique({
            where: { email: userEmail }
        });

        const isHrOrAdmin = req.user.role === 'Administrator' || req.user.role === 'HR' || req.user.role === 'ADMIN';

        let whereClause = {};
        if (!isHrOrAdmin && employee) {
            whereClause = { referrerId: employee.id };
        }

        const referrals = await prisma.referral.findMany({
            where: whereClause,
            include: {
                referrer: {
                    select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true, email: true }
                },
                jobOffer: {
                    select: { id: true, title: true, department: true, location: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(referrals);
    } catch (error) {
        console.error("Error fetching referrals:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des cooptations." });
    }
};

// Create a new referral
exports.createReferral = async (req, res) => {
    try {
        const { jobOfferId, candidateFirstName, candidateLastName, candidateEmail, candidatePhone, relationship, notes, bonusAmount } = req.body;

        if (!jobOfferId || !candidateFirstName || !candidateLastName || !candidateEmail) {
            return res.status(400).json({ error: "Les informations du candidat et de l'offre sont obligatoires." });
        }

        const employee = await prisma.employee.findUnique({
            where: { email: req.user.email }
        });

        if (!employee) {
            return res.status(404).json({ error: "Profil employé non trouvé pour cet utilisateur." });
        }

        const newReferral = await prisma.$transaction(async (tx) => {
            // 1. Create referral record
            const ref = await tx.referral.create({
                data: {
                    referrerId: employee.id,
                    jobOfferId,
                    candidateFirstName,
                    candidateLastName,
                    candidateEmail,
                    candidatePhone: candidatePhone || null,
                    relationship: relationship || "Recommandation réseau",
                    notes: notes || null,
                    bonusAmount: bonusAmount ? parseFloat(bonusAmount) : 150000,
                    status: 'SUBMITTED'
                },
                include: {
                    referrer: { select: { firstName: true, lastName: true } },
                    jobOffer: { select: { title: true } }
                }
            });

            // 2. Also register applicant in recruitment pipeline
            await tx.applicant.create({
                data: {
                    jobOfferId,
                    firstName: candidateFirstName,
                    lastName: candidateLastName,
                    email: candidateEmail,
                    phone: candidatePhone || null,
                    source: `Cooptation par ${employee.firstName} ${employee.lastName}`,
                    status: 'Applied',
                    matchScore: 88
                }
            });

            // 3. Award 100 points for submitting a candidate
            await tx.employeePoints.upsert({
                where: { employeeId: employee.id },
                update: { total: { increment: 100 } },
                create: { employeeId: employee.id, total: 100 }
            });

            await tx.pointEvent.create({
                data: {
                    employeeId: employee.id,
                    points: 100,
                    reason: `Cooptation soumise pour ${candidateFirstName} ${candidateLastName}`
                }
            });

            // 4. Create Notification
            await tx.notification.create({
                data: {
                    employeeId: employee.id,
                    message: `Votre cooptation pour ${candidateFirstName} (${ref.jobOffer.title}) a bien été enregistrée (+100 pts !).`,
                    type: 'Succès',
                    link: '/referrals'
                }
            });

            return ref;
        });

        res.status(201).json(newReferral);
    } catch (error) {
        console.error("Error creating referral:", error);
        res.status(500).json({ error: "Erreur serveur lors de la soumission de la cooptation." });
    }
};

// Update referral status
exports.updateReferralStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, bonusPaid } = req.body;

        const existingReferral = await prisma.referral.findUnique({
            where: { id },
            include: { referrer: true, jobOffer: true }
        });

        if (!existingReferral) {
            return res.status(404).json({ error: "Cooptation introuvable." });
        }

        const wasHired = existingReferral.status === 'HIRED';

        const updated = await prisma.$transaction(async (tx) => {
            const ref = await tx.referral.update({
                where: { id },
                data: {
                    status: status || existingReferral.status,
                    notes: notes !== undefined ? notes : existingReferral.notes,
                    bonusPaid: bonusPaid !== undefined ? bonusPaid : existingReferral.bonusPaid
                },
                include: {
                    referrer: { select: { id: true, firstName: true, lastName: true } },
                    jobOffer: { select: { title: true } }
                }
            });

            // If newly marked as HIRED, award 500 bonus points and send notification
            if (status === 'HIRED' && !wasHired) {
                await tx.employeePoints.upsert({
                    where: { employeeId: existingReferral.referrerId },
                    update: { total: { increment: 500 } },
                    create: { employeeId: existingReferral.referrerId, total: 500 }
                });

                await tx.pointEvent.create({
                    data: {
                        employeeId: existingReferral.referrerId,
                        points: 500,
                        reason: `Candidat coopté (${existingReferral.candidateFirstName} ${existingReferral.candidateLastName}) recruté avec succès !`
                    }
                });

                await tx.notification.create({
                    data: {
                        employeeId: existingReferral.referrerId,
                        message: `🎉 Félicitations ! Votre candidat coopté ${existingReferral.candidateFirstName} a été recruté sur le poste "${existingReferral.jobOffer.title}". Votre prime de ${existingReferral.bonusAmount.toLocaleString()} FCFA est débloquée (+500 pts !).`,
                        type: 'Succès',
                        link: '/referrals'
                    }
                });
            }

            return ref;
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating referral status:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
    }
};

// Get stats and leaderboard
exports.getReferralStats = async (req, res) => {
    try {
        const totalReferrals = await prisma.referral.count();
        const hiredReferrals = await prisma.referral.count({ where: { status: 'HIRED' } });
        const pendingReferrals = await prisma.referral.count({ where: { status: { in: ['SUBMITTED', 'SCREENING', 'INTERVIEW'] } } });

        const bonusAggregate = await prisma.referral.aggregate({
            where: { status: 'HIRED' },
            _sum: { bonusAmount: true }
        });

        const leaderboardRaw = await prisma.referral.groupBy({
            by: ['referrerId'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        const referrerIds = leaderboardRaw.map(l => l.referrerId);
        const employees = await prisma.employee.findMany({
            where: { id: { in: referrerIds } },
            select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true }
        });

        const leaderboard = leaderboardRaw.map(item => {
            const emp = employees.find(e => e.id === item.referrerId);
            return {
                referrerId: item.referrerId,
                totalCount: item._count.id,
                employee: emp || { firstName: "Employé", lastName: "Inconnu", department: "RH" }
            };
        });

        res.json({
            totalReferrals,
            hiredReferrals,
            pendingReferrals,
            totalBonusPaid: bonusAggregate._sum.bonusAmount || 0,
            leaderboard
        });
    } catch (error) {
        console.error("Error fetching referral stats:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des statistiques." });
    }
};
