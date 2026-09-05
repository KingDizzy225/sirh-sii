const prisma = require('../prismaClient');

// GET - Personal for employee, all for HR/Admin
exports.getAdvances = async (req, res) => {
    try {
        const { role, email } = req.user;
        const employee = await prisma.employee.findUnique({ where: { email } });
        let advances;
        if (role === 'ADMIN' || role === 'MANAGER' || role === 'HR' || role === 'Administrator' || role === 'Manager') {
            advances = await prisma.salaryAdvance.findMany({
                include: { employee: true },
                orderBy: { requestedAt: 'desc' }
            });
        } else {
            if (!employee) return res.status(404).json({ error: 'Employé introuvable' });
            advances = await prisma.salaryAdvance.findMany({
                where: { employeeId: employee.id },
                include: { employee: true },
                orderBy: { requestedAt: 'desc' }
            });
        }
        const formatted = advances.map(a => ({
            id: a.id,
            employee: `${a.employee.firstName} ${a.employee.lastName}`,
            department: a.employee.department,
            amount: a.amount,
            reason: a.reason,
            status: a.status,
            requestedAt: new Date(a.requestedAt).toLocaleDateString('fr-FR'),
            approvedBy: a.approvedBy,
        }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST - Submit a request
exports.createAdvance = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable' });
        const advance = await prisma.salaryAdvance.create({
            data: { employeeId: employee.id, amount: parseFloat(amount), reason }
        });
        res.status(201).json(advance);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// PUT - Approve / Reject
exports.updateAdvanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.salaryAdvance.update({
            where: { id },
            data: {
                status,
                approvedAt: status === 'Approuvé' ? new Date() : undefined,
                approvedBy: status === 'Approuvé' ? req.user.email : undefined
            }
        });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST /api/advances/public — Demande d'avance depuis le Self-Service (sans connexion)
exports.createPublicAdvance = async (req, res) => {
    try {
        const { email, name, amount, reason, repaymentMonths } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ error: 'Champs obligatoires manquants (email, montant).' });
        }

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            return res.status(404).json({ error: 'Aucun employé trouvé avec cet email. Veuillez vérifier votre adresse.' });
        }

        const advance = await prisma.salaryAdvance.create({
            data: {
                employeeId: employee.id,
                amount: parseFloat(amount),
                reason: reason || null,
            }
        });

        res.status(201).json({ 
            message: 'Votre demande d\'avance a été transmise au service RH.',
            id: advance.id,
            trackingId: advance.id
        });
    } catch (e) {
        console.error('Error creating public advance:', e);
        res.status(500).json({ error: 'Erreur lors de la soumission.' });
    }
};

/**
 * Salaire déjà gagné et disponible à la demande.
 *
 * Le module d'avances acceptait n'importe quel montant sans le rapporter à ce
 * que le salarié avait effectivement gagné. Or les données nécessaires
 * existent : le salaire de base du dernier bulletin, et les jours écoulés dans
 * le mois en cours.
 *
 * Le calcul est volontairement prudent — il repose sur les jours calendaires
 * écoulés, plafonnés à une part du salaire, et déduit les avances déjà en
 * cours. Mieux vaut proposer moins que le montant réellement acquis que
 * l'inverse : un salarié ne doit pas se retrouver débiteur en fin de mois.
 */
const PART_DISPONIBLE = parseFloat(process.env.EARNED_WAGE_SHARE || '0.5');

exports.getEarnedWage = async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({ where: { email: req.user.email } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable' });

        const dernierBulletin = await prisma.payroll.findFirst({
            where: { employeeId: employee.id },
            orderBy: { period: 'desc' }
        });

        if (!dernierBulletin || !dernierBulletin.baseSalary) {
            return res.json({
                disponible: 0,
                eligible: false,
                motif: "Aucun bulletin de paie de référence : le salaire ne peut pas être établi."
            });
        }

        const salaireMensuel = dernierBulletin.baseSalary;
        const maintenant = new Date();
        const joursDansMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).getDate();
        const joursEcoules = maintenant.getDate();

        const acquisCeMois = Math.round(salaireMensuel * (joursEcoules / joursDansMois));
        const plafond = Math.round(acquisCeMois * PART_DISPONIBLE);

        // Avances déjà accordées et non encore déduites d'une paie
        const enCours = await prisma.salaryAdvance.findMany({
            where: {
                employeeId: employee.id,
                status: { in: ['En attente', 'Approuvé'] },
                deductedOnPayrollId: null
            },
            select: { amount: true }
        });
        const dejaEngage = enCours.reduce((s, a) => s + (a.amount || 0), 0);
        const disponible = Math.max(plafond - dejaEngage, 0);

        res.json({
            eligible: disponible > 0,
            disponible,
            detail: {
                salaireMensuelReference: Math.round(salaireMensuel),
                joursEcoules,
                joursDansMois,
                acquisCeMois,
                partDisponible: Math.round(PART_DISPONIBLE * 100),
                plafond,
                dejaEngage
            },
            motif: disponible > 0
                ? null
                : dejaEngage >= plafond
                    ? 'Le montant disponible est déjà engagé par une ou plusieurs avances en cours.'
                    : "Aucun montant disponible à ce stade du mois."
        });
    } catch (error) {
        console.error('Error computing earned wage:', error);
        res.status(500).json({ error: 'Erreur lors du calcul du salaire disponible.' });
    }
};
