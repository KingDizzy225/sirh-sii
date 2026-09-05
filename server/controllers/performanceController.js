const prisma = require('../prismaClient');

// ----------------------------------------------------
// GOALS (OBJECTIFS)
// ----------------------------------------------------

exports.getGoals = async (req, res) => {
    try {
        const { id, role } = req.user;
        let goals;

        // Si l'user est le Super Admin ou HR, il peut voir tous les objectifs
        if (role === 'ADMIN' || role === 'HR') {
            goals = await prisma.performanceGoal.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { dueDate: 'asc' }
            });
        } else {
            // Sinon on renvoie seulement ses objectifs
            goals = await prisma.performanceGoal.findMany({
                where: { employeeId: id },
                orderBy: { dueDate: 'asc' }
            });
        }

        res.status(200).json(goals);
    } catch (error) {
        console.error("Erreur Fetch Goals:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des objectifs." });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { title, category, dueDate, employeeId } = req.body;

        // Si employeeId n'est pas fourni, c'est l'employé actif qui s'auto-crée un but
        const targetEmployeeId = employeeId || id;

        // Un employé commun ne peut créer que SES objectifs (Admin et HR peuvent pour tous)
        if (role === 'Employee' && targetEmployeeId !== id) {
            return res.status(403).json({ error: "Non autorisé à assigner un but à un tiers." });
        }

        const newGoal = await prisma.performanceGoal.create({
            data: {
                employeeId: targetEmployeeId,
                title,
                category,
                dueDate: new Date(dueDate),
                progress: 0,
                status: 'En bonne voie'
            }
        });

        res.status(201).json(newGoal);
    } catch (error) {
        console.error("Erreur Create Goal:", error);
        res.status(500).json({ error: "Erreur serveur lors de la création de l'objectif." });
    }
};

exports.updateGoalProgress = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { id, role } = req.user;

        const goal = await prisma.performanceGoal.findUnique({ where: { id: goalId } });
        if (!goal) return res.status(404).json({ error: "Objectif introuvable." });

        if (role === 'Employee' && goal.employeeId !== id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        const newProgress = Math.min(goal.progress + 25, 100);
        const newStatus = newProgress === 100 ? 'Terminé' : goal.status;

        const updatedGoal = await prisma.performanceGoal.update({
            where: { id: goalId },
            data: { progress: newProgress, status: newStatus }
        });

        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error("Erreur Update Goal:", error);
        res.status(500).json({ error: "Erreur de mise à jour." });
    }
};

// ----------------------------------------------------
// ÉVALUATIONS ANNUELLES (REVIEWS)
// ----------------------------------------------------

exports.getReviews = async (req, res) => {
    try {
        const { id, role } = req.user;
        let reviews;

        if (role === 'ADMIN' || role === 'HR') {
            reviews = await prisma.performanceReview.findMany({
                include: { employee: { select: { firstName: true, lastName: true } } },
                orderBy: { reviewDate: 'desc' }
            });
        } else {
            reviews = await prisma.performanceReview.findMany({
                where: { employeeId: id },
                orderBy: { reviewDate: 'desc' }
            });
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Erreur Fetch Reviews:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.submitSelfEval = async (req, res) => {
    try {
        const { id } = req.user;
        const { achievements, reflection, cycle } = req.body;

        const newReview = await prisma.performanceReview.create({
            data: {
                employeeId: id,
                reviewerName: 'En attente de Manager',
                cycle: cycle || 'Annuel 2026',
                rating: 'En attente du Manager',
                status: 'Brouillon Soumis',
                achievements,
                reflection
            }
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error("Erreur Submit Eval:", error);
        res.status(500).json({ error: "Erreur serveur de soumission." });
    }
};

// ----------------------------------------------------
// FEEDBACKS 360
// ----------------------------------------------------

exports.getFeedbacks = async (req, res) => {
    try {
        const { id, role } = req.user;
        let feedbacks;

        if (role === 'ADMIN' || role === 'HR') {
            feedbacks = await prisma.performanceFeedback.findMany({
                include: { employee: { select: { firstName: true, lastName: true } } },
                orderBy: { date: 'desc' }
            });
        } else {
            feedbacks = await prisma.performanceFeedback.findMany({
                where: { employeeId: id },
                orderBy: { date: 'desc' }
            });
        }

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Erreur Fetch Feedbacks:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des feedbacks." });
    }
};

exports.requestFeedback = async (req, res) => {
    try {
        const { id } = req.user;
        const { peerName, context } = req.body;

        const newFeedback = await prisma.performanceFeedback.create({
            data: {
                employeeId: id,
                provider: peerName,
                relationship: 'Collègue',
                context
            }
        });

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error("Erreur Request Feedback:", error);
        res.status(500).json({ error: "Erreur lors de la demande de feedback." });
    }
};

exports.sendFeedback = async (req, res) => {
    try {
        const { id, email } = req.user;
        const { targetEmployeeId, badge, strengths, areas, context, isAnonymous } = req.body;

        if (!targetEmployeeId) {
            return res.status(400).json({ error: "L'employé ciblé est requis." });
        }

        // Récupérer le nom de l'envoyeur
        const sender = await prisma.employee.findUnique({ where: { id } });
        const providerName = isAnonymous 
            ? 'Collègue (Anonyme)' 
            : (sender ? `${sender.firstName} ${sender.lastName}` : email);

        const newFeedback = await prisma.performanceFeedback.create({
            data: {
                employeeId: targetEmployeeId,
                provider: providerName,
                relationship: 'Collègue (360°)',
                strengths: strengths || null,
                areas: areas || null,
                context: context || null,
                badge: badge || null,
                isAnonymous: isAnonymous || false,
                peerId: id
            }
        });

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error("Erreur Send 360 Feedback:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'envoi du feedback." });
    }
};

/**
 * Campagnes d'entretiens annuels.
 *
 * Les entretiens se créaient un par un, alors que la réalité du métier est une
 * campagne : on lance la revue pour tout l'effectif à une date donnée, on suit
 * l'avancement, on relance les retardataires. Le champ `cycle` du modèle
 * anticipait ce fonctionnement sans que rien ne l'exploite.
 */
exports.launchCampaign = async (req, res) => {
    try {
        const { cycle } = req.body;
        if (!cycle || !String(cycle).trim()) {
            return res.status(400).json({ error: "Le libellé du cycle est requis (ex. « Annuel 2026 »)." });
        }

        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, firstName: true, lastName: true, managerId: true }
        });
        if (salaries.length === 0) {
            return res.status(400).json({ error: 'Aucun salarié actif : campagne sans objet.' });
        }

        // Managers, pour renseigner l'évaluateur attendu
        const managers = await prisma.employee.findMany({
            where: { id: { in: salaries.map(s => s.managerId).filter(Boolean) } },
            select: { id: true, firstName: true, lastName: true }
        });
        const nomManager = Object.fromEntries(
            managers.map(m => [m.id, `${m.firstName} ${m.lastName}`])
        );

        // Relancer une campagne existante ne doit pas dupliquer les entretiens
        // ni écraser ceux déjà remplis : on ne crée que ce qui manque.
        const existants = await prisma.performanceReview.findMany({
            where: { cycle },
            select: { employeeId: true }
        });
        const dejaCouverts = new Set(existants.map(r => r.employeeId));
        const aCreer = salaries.filter(s => !dejaCouverts.has(s.id));

        if (aCreer.length > 0) {
            await prisma.performanceReview.createMany({
                data: aCreer.map(s => ({
                    employeeId: s.id,
                    cycle,
                    reviewerName: nomManager[s.managerId] || 'À désigner',
                    rating: 'En attente',
                    status: 'Brouillon'
                }))
            });
        }

        res.status(201).json({
            cycle,
            crees: aCreer.length,
            dejaPresents: dejaCouverts.size,
            effectif: salaries.length,
            message: aCreer.length > 0
                ? `${aCreer.length} entretien(s) ouvert(s) pour le cycle « ${cycle} ».`
                : `Tous les entretiens du cycle « ${cycle} » existaient déjà.`
        });
    } catch (error) {
        console.error('Error launching review campaign:', error);
        res.status(500).json({ error: "Erreur lors du lancement de la campagne." });
    }
};

/** Avancement des campagnes, cycle par cycle. */
exports.getCampaigns = async (req, res) => {
    try {
        const reviews = await prisma.performanceReview.findMany({
            select: { cycle: true, status: true, reviewerName: true }
        });

        const parCycle = new Map();
        for (const r of reviews) {
            if (!parCycle.has(r.cycle)) {
                parCycle.set(r.cycle, { cycle: r.cycle, total: 0, finalises: 0, enAttente: 0, sansEvaluateur: 0 });
            }
            const c = parCycle.get(r.cycle);
            c.total++;
            if (r.status === 'Finalisé') c.finalises++;
            else c.enAttente++;
            if (!r.reviewerName || r.reviewerName === 'À désigner') c.sansEvaluateur++;
        }

        const campagnes = [...parCycle.values()]
            .map(c => ({ ...c, avancement: c.total ? Math.round((c.finalises / c.total) * 100) : 0 }))
            .sort((a, b) => b.cycle.localeCompare(a.cycle));

        res.json(campagnes);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: "Erreur lors de la lecture des campagnes." });
    }
};
