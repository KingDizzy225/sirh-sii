const prisma = require('../prismaClient');
const soldeToutCompte = require('../lib/soldeToutCompte');

exports.getOffboardingTasks = async (req, res) => {
    try {
        const { email, role } = req.user;
        let tasks;
        
        if (role === 'Administrator' || role === 'HR') {
            tasks = await prisma.offboardingTask.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });

            tasks = await prisma.offboardingTask.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching offboarding tasks:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.createOffboardingTask = async (req, res) => {
    try {
        const { employeeId, taskName, assignedTo } = req.body;
        const newTask = await prisma.offboardingTask.create({
            data: {
                employeeId,
                taskName,
                assignedTo
            }
        });
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Error creating offboarding task:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateOffboardingTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.offboardingTask.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        console.error("Error updating offboarding task:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/**
 * Décompte final d'un départ (projet de solde de tout compte).
 *
 * Le calcul lui-même vit désormais dans lib/soldeToutCompte.js : le reçu remis
 * au salarié doit porter exactement les montants affichés ici, et deux copies
 * du même calcul auraient fini par diverger.
 *
 * Ce que renvoie cette route reste un projet, révisable. C'est `arreterSolde`
 * qui le fige, et le reçu n'est produit que depuis cette version figée.
 */
exports.getFinalSettlement = async (req, res) => {
    try {
        const projet = await soldeToutCompte.calculer(req.params.employeeId);
        if (!projet) return res.status(404).json({ error: 'Employé introuvable.' });

        // L'écran doit savoir si le décompte a déjà été arrêté, et ce qui
        // empêcherait de l'arrêter : sans cela, le bouton refuserait sans dire
        // pourquoi.
        const arrete = await soldeToutCompte.lireArrete(req.params.employeeId);

        res.json({
            ...projet,
            arrete: arrete ? {
                arreteLe: arrete.arreteLe,
                arretePar: arrete.arretePar,
                netArrete: arrete.netArrete,
                observations: arrete.observations
            } : null,
            empechements: soldeToutCompte.obstacles(projet)
        });
    } catch (error) {
        console.error('Error computing final settlement:', error);
        res.status(500).json({ error: 'Erreur lors du calcul du décompte final.' });
    }
};

/** Motifs de départ et raisons, pour alimenter le formulaire. */
exports.getExitInterviewOptions = (req, res) => {
    res.json({
        typesDepart: ['Démission', 'Licenciement', 'Fin de CDD', 'Rupture période essai', 'Retraite', 'Autre'],
        raisons: ['Rémunération', 'Évolution de carrière', 'Management', 'Charge de travail',
                  'Projet personnel', 'Mobilité géographique', 'Ambiance de travail', 'Autre']
    });
};

/**
 * Enregistre l'entretien de sortie d'un salarié.
 *
 * Un seul entretien par personne : le relancer met à jour le précédent plutôt
 * que d'en empiler plusieurs, un départ n'ayant qu'un motif.
 */
exports.saveExitInterview = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const {
            departureType, primaryReason, wouldRecommend,
            satisfaction, whatWorked, whatToImprove, comments
        } = req.body;

        if (!departureType || !primaryReason) {
            return res.status(400).json({ error: 'Le type de départ et le motif principal sont requis.' });
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable.' });

        const donnees = {
            departureType,
            primaryReason,
            wouldRecommend: typeof wouldRecommend === 'boolean' ? wouldRecommend : null,
            satisfaction: Number.isInteger(satisfaction) && satisfaction >= 1 && satisfaction <= 5
                ? satisfaction : null,
            whatWorked: whatWorked || null,
            whatToImprove: whatToImprove || null,
            comments: comments || null,
            conductedBy: req.user?.email || null
        };

        const entretien = await prisma.exitInterview.upsert({
            where: { employeeId },
            create: { employeeId, ...donnees },
            update: donnees
        });

        res.status(201).json(entretien);
    } catch (error) {
        console.error('Error saving exit interview:', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'entretien de sortie." });
    }
};

/**
 * Synthèse des motifs de départ.
 *
 * C'est cette synthèse qui donne au module anti-turnover de quoi confronter
 * ses prédictions aux départs réellement survenus.
 */
exports.getExitInsights = async (req, res) => {
    try {
        const entretiens = await prisma.exitInterview.findMany({
            include: { employee: { select: { department: true, positionTitle: true } } }
        });

        if (entretiens.length === 0) {
            return res.json({ total: 0, motifs: [], typesDepart: [], recommandation: null, satisfactionMoyenne: null });
        }

        const compter = (cle) => {
            const m = new Map();
            for (const e of entretiens) {
                const v = e[cle] || 'Non précisé';
                m.set(v, (m.get(v) || 0) + 1);
            }
            return [...m.entries()]
                .map(([libelle, nombre]) => ({
                    libelle, nombre,
                    part: Math.round((nombre / entretiens.length) * 100)
                }))
                .sort((a, b) => b.nombre - a.nombre);
        };

        const avecAvis = entretiens.filter(e => typeof e.wouldRecommend === 'boolean');
        const avecNote = entretiens.filter(e => e.satisfaction);

        res.json({
            total: entretiens.length,
            motifs: compter('primaryReason'),
            typesDepart: compter('departureType'),
            recommandation: avecAvis.length
                ? Math.round((avecAvis.filter(e => e.wouldRecommend).length / avecAvis.length) * 100)
                : null,
            satisfactionMoyenne: avecNote.length
                ? Math.round((avecNote.reduce((s, e) => s + e.satisfaction, 0) / avecNote.length) * 10) / 10
                : null
        });
    } catch (error) {
        console.error('Error computing exit insights:', error);
        res.status(500).json({ error: 'Erreur lors du calcul de la synthèse des départs.' });
    }
};
