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
