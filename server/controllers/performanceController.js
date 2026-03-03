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
