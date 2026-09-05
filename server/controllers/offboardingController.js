const prisma = require('../prismaClient');

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
 * Décompte final d'un départ (solde de tout compte).
 *
 * Le module de départ suivait des tâches sans rien calculer, alors que toutes
 * les données nécessaires existent : solde de congés, dernier salaire, avances
 * non déduites, ancienneté. C'est pourtant le calcul le plus délicat du métier,
 * celui dont une erreur se règle devant l'inspection du travail.
 *
 * Le résultat est un projet de décompte à vérifier, jamais un document
 * définitif : la RH conserve la décision, notamment sur l'indemnité de
 * licenciement dont l'éligibilité dépend du motif de rupture.
 */
exports.getFinalSettlement = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable.' });

        // Dernier bulletin connu : base du salaire de référence
        const dernierBulletin = await prisma.payroll.findFirst({
            where: { employeeId },
            orderBy: { period: 'desc' }
        });

        // Le salaire brut n'est pas stocké tel quel : le bulletin conserve le
        // salaire de base, sur lequel se calcule l'indemnité de congés payés.
        const salaireMensuel = dernierBulletin ? (dernierBulletin.baseSalary || 0) : 0;
        const salaireJournalier = salaireMensuel > 0 ? salaireMensuel / 30 : 0;

        // Congés acquis non pris
        const soldeConges = employee.annualLeaveBalance || 0;
        const indemniteConges = Math.round(soldeConges * salaireJournalier);

        // Avances accordées mais non encore déduites d'une paie
        const avances = await prisma.salaryAdvance.findMany({
            where: {
                employeeId,
                status: { in: ['Approuvé', 'APPROVED'] },
                deductedOnPayrollId: null
            },
            select: { id: true, amount: true, requestedAt: true, reason: true }
        });
        const totalAvances = avances.reduce((s, a) => s + (a.amount || 0), 0);

        // Ancienneté au jour du départ (ou à ce jour si non renseigné)
        const dateSortie = employee.exitDate ? new Date(employee.exitDate) : new Date();
        const embauche = new Date(employee.hireDate);
        const anneesAnciennete = Math.max(
            (dateSortie - embauche) / (365.25 * 24 * 3600 * 1000),
            0
        );

        const net = indemniteConges - totalAvances;

        res.json({
            salarie: {
                nom: `${employee.firstName} ${employee.lastName}`,
                poste: employee.positionTitle,
                dateEmbauche: employee.hireDate,
                dateSortie: employee.exitDate || null,
                ancienneteAnnees: Math.round(anneesAnciennete * 10) / 10
            },
            base: {
                salaireMensuelReference: Math.round(salaireMensuel),
                sourceReference: dernierBulletin
                    ? `Salaire de base du bulletin de ${new Date(dernierBulletin.period).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                    : 'Aucun bulletin de paie enregistré',
                salaireJournalier: Math.round(salaireJournalier)
            },
            lignes: [
                {
                    libelle: 'Indemnité compensatrice de congés payés',
                    detail: `${soldeConges} jour(s) acquis non pris`,
                    montant: indemniteConges,
                    sens: 'credit'
                },
                {
                    libelle: 'Avances sur salaire non déduites',
                    detail: `${avances.length} avance(s) en cours`,
                    montant: totalAvances,
                    sens: 'debit'
                }
            ],
            avances,
            netEstime: net,
            avertissements: [
                !dernierBulletin
                    ? "Aucun bulletin de paie n'a été trouvé : le salaire de référence est à saisir manuellement."
                    : null,
                !employee.exitDate
                    ? "La date de sortie n'est pas renseignée : l'ancienneté est calculée à ce jour."
                    : null,
                "L'indemnité de licenciement n'est pas incluse : son éligibilité et son barème dépendent du motif de rupture, qui relève d'une décision RH.",
                'Ce décompte est un projet à vérifier avant établissement du solde de tout compte définitif.'
            ].filter(Boolean)
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
