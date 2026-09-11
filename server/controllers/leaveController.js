const prisma = require('../prismaClient');
const delegation = require('../lib/delegation');
const { sendMail } = require('../lib/mailer');
const couverture = require('../lib/couverture');
const evenements = require('../lib/evenements');

/** Ce qu'un événement dit d'un congé : ni motif, ni justificatif. */
const congePourEvenement = (c) => ({
    id: c.id, type: c.type, du: c.startDate, au: c.endDate, jours: c.durationDays
});

/**
 * Durée d'un congé, en jours décomptés du solde.
 *
 * Elle valait `(fin - début) + 1` en jours calendaires. Le solde étant crédité
 * en jours ouvrables — 2,2 par mois de travail effectif —, le compteur se
 * remplissait dans une unité et se vidait dans une autre : un congé du vendredi
 * au lundi retirait quatre jours au lieu de deux, et le 7 août se décomptait
 * comme un jour ordinaire.
 *
 * Le surplus se propageait jusqu'au solde de tout compte, où l'indemnité
 * compensatrice se calcule sur ce même solde : le salarié partait avec moins
 * que son dû.
 *
 * @returns {Promise<{jours:number, feriesTraverses:Array, calendaires:number}>}
 */
// Désormais partagé avec la préparation de la paie, qui décompte les congés
// sans solde dans la même unité.
const { dureeEnJoursOuvrables } = require('../lib/calendrier');

/**
 * GET /api/leaves/apercu?employeeId=&startDate=&endDate=
 *
 * Ce que coûtera le congé, et qui sera absent en même temps — avant de le
 * poser. Sans cet aperçu, le demandeur découvre le décompte après validation
 * et le responsable découvre le chevauchement le matin venu.
 */
exports.apercu = async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;
        if (!employeeId || !startDate || !endDate) {
            return res.status(400).json({ error: 'employeeId, startDate et endDate sont requis.' });
        }

        const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const debut = new Date(startDate);
        const fin = new Date(endDate);
        if (isNaN(debut.getTime()) || isNaN(fin.getTime()) || fin < debut) {
            return res.status(400).json({ error: 'Dates invalides.' });
        }

        const decompte = await dureeEnJoursOuvrables(debut, fin);
        const equipe = await couverture.conflits(prisma, salarie, debut, fin);

        res.json({
            jours: decompte.jours,
            joursCalendaires: decompte.calendaires,
            feriesTraverses: decompte.feriesTraverses,
            soldeActuel: salarie.annualLeaveBalance,
            soldeApres: Math.round((salarie.annualLeaveBalance - decompte.jours) * 10) / 10,
            // Le solde peut passer sous zéro : l'application le montre plutôt
            // que de refuser, la RH pouvant accorder une avance sur congés.
            soldeSuffisant: salarie.annualLeaveBalance >= decompte.jours,
            couverture: { ...equipe, avertissement: couverture.avertissement(equipe) }
        });
    } catch (error) {
        console.error('Erreur aperçu de congé :', error);
        res.status(500).json({ error: "Erreur lors du calcul de l'aperçu." });
    }
};

// Get all leaves
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await prisma.leave.findMany({
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
};

// Create a new leave request
exports.createLeave = async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, reason } = req.body;
        const attachmentPath = req.file ? `/uploads/justificatifs/${req.file.filename}` : null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            return res.status(400).json({ error: 'Dates de congé invalides.' });
        }

        const decompte = await dureeEnJoursOuvrables(start, end);
        if (decompte.jours === 0) {
            return res.status(400).json({
                error: 'La période demandée ne comporte aucun jour ouvrable : '
                    + 'elle ne tombe que sur des dimanches ou des jours fériés.'
            });
        }
        const durationDays = decompte.jours;

        const newLeave = await prisma.leave.create({
            data: {
                employeeId,
                type,
                startDate: start,
                endDate: end,
                reason,
                attachmentPath,
                status: 'PENDING',
                durationDays
            },
            include: { employee: true }
        });

        // Chevauchement dans l'équipe : signalé, jamais bloquant. Un congé
        // simultané peut être voulu, et une règle qui refuserait serait
        // contournée en une semaine.
        const equipe = await couverture.conflits(
            prisma, newLeave.employee, start, end, newLeave.id
        ).catch(() => null);
        newLeave.couverture = equipe
            ? { ...equipe, avertissement: couverture.avertissement(equipe) }
            : null;
        newLeave.feriesTraverses = decompte.feriesTraverses;

        evenements.emettreSansAttendre('LEAVE_REQUESTED', {
            conge: congePourEvenement(newLeave),
            salarie: evenements.salarie(newLeave.employee),
            canal: 'APPLICATION'
        });

        // Notify employee by email
        if (newLeave.employee?.email) {
            sendMail({
                to: newLeave.employee.email,
                subject: `Nouvelle demande de congé : ${type}`,
                html: `<h1>Demande envoyée</h1><p>Votre demande du ${startDate} au ${endDate} a bien été transmise à votre manager.</p>`
            }).catch(console.error);
        }

        // Notify via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.emit('new_notification', {
                type: 'LEAVE_REQUEST',
                message: `Nouvelle demande de congé de ${newLeave.employee?.firstName || 'un employé'} (${type})`,
                date: new Date()
            });
        }

        res.status(201).json(newLeave);
    } catch (error) {
        console.error('Error creating leave:', error);
        res.status(500).json({ error: 'Failed to create leave request' });
    }
};

// Update leave status (Approve/Reject)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Target status, or we deduce based on role

        /**
         * Rôle effectif : le sien, ou celui d'un titulaire qui l'a désigné
         * suppléant pendant son absence.
         *
         * Sans cela, les demandes s'arrêtaient dès que le responsable qui valide
         * était lui-même en congé — précisément la période où elles affluent.
         * La délégation est bornée dans le temps et dans son objet, et ne donne
         * jamais plus que ce que le titulaire pouvait faire.
         */
        const effectif = await delegation.roleEffectif(req.user, 'CONGES');
        const userRole = effectif.role;
        
        const existingLeave = await prisma.leave.findUnique({ where: { id } });
        if (!existingLeave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        let newStatus = status;

        // Custom Multi-Level Approval Logic if status is not explicitly sent or we enforce it
        if (!status || status === 'APPROVED') {
            if (userRole === 'Manager' && existingLeave.status === 'PENDING') {
                newStatus = 'PENDING_HR';
            } else if ((userRole === 'HR' || userRole === 'ADMIN' || userRole === 'Administrator' || userRole === 'HR_MANAGER') 
                        && (existingLeave.status === 'PENDING' || existingLeave.status === 'PENDING_HR')) {
                newStatus = 'APPROVED';
            } else {
                newStatus = status || existingLeave.status;
            }
        }

        let balanceDeduction = 0;
        if (newStatus === 'APPROVED' && existingLeave.status !== 'APPROVED') {
            balanceDeduction = existingLeave.durationDays;
        } else if (newStatus !== 'APPROVED' && existingLeave.status === 'APPROVED') {
            balanceDeduction = -existingLeave.durationDays;
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.leave.update({
                where: { id },
                data: { status: newStatus }
            });

            if (balanceDeduction !== 0) {
                await tx.employee.update({
                    where: { id: existingLeave.employeeId },
                    data: { annualLeaveBalance: { decrement: balanceDeduction } }
                });
            }

            return await tx.leave.findUnique({
                where: { id },
                include: { employee: true }
            });
        });

        // Seule une décision est un événement : le passage d'un responsable à la
        // RH (PENDING_HR) n'en est pas une pour qui suit les absences.
        if (['APPROVED', 'REJECTED'].includes(newStatus) && newStatus !== existingLeave.status) {
            evenements.emettreSansAttendre('LEAVE_DECIDED', {
                conge: congePourEvenement(result),
                decision: newStatus === 'APPROVED' ? 'VALIDE' : 'REFUSE',
                salarie: evenements.salarie(result.employee)
            });
        }

        // Envoi E-mail transactionnel de statut
        if (result.employee?.email) {
            let subject = `Mise à jour de votre demande de congé`;
            let htmlMsg = `Votre demande est maintenant à l'étape : <strong>${newStatus}</strong>.`;
            
            if (newStatus === 'PENDING_HR') {
                htmlMsg = `Votre manager a validé votre congé. Il est en attente de validation RH.`;
            } else if (newStatus === 'APPROVED') {
                htmlMsg = `Votre congé a été définitivement approuvé !`;
                subject = `Congé Approuvé`;
            } else if (newStatus === 'REJECTED') {
                htmlMsg = `Malheureusement, votre demande de congé a été refusée.`;
                subject = `Congé Refusé`;
            }
            
            sendMail({
                to: result.employee.email,
                subject: subject,
                html: `<h1>${subject}</h1><p>${htmlMsg}</p>`
            }).catch(console.error);
        }

        // Notify via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.emit('new_notification', {
                type: 'LEAVE_UPDATE',
                message: `Mise à jour d'un congé (${newStatus}) pour ${result.employee?.firstName || ''}`,
                date: new Date()
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ error: 'Failed to update leave status' });
    }
};

// POST /api/leaves/public — Demande de congé depuis le Self-Service (sans connexion)
exports.createPublicLeave = async (req, res) => {
    try {
        const { email, type, startDate, endDate, reason } = req.body;
        const attachmentPath = req.file ? `/uploads/justificatifs/${req.file.filename}` : null;

        if (!email || !type || !startDate || !endDate) {
            return res.status(400).json({ error: 'Champs obligatoires manquants (email, type, startDate, endDate).' });
        }

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            return res.status(404).json({ error: 'Aucun employé trouvé avec cet email. Veuillez vérifier votre adresse.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            return res.status(400).json({ error: 'Dates de congé invalides.' });
        }

        const decompte = await dureeEnJoursOuvrables(start, end);
        if (decompte.jours === 0) {
            return res.status(400).json({
                error: 'La période demandée ne comporte aucun jour ouvrable.'
            });
        }
        const durationDays = decompte.jours;

        const newLeave = await prisma.leave.create({
            data: {
                employeeId: employee.id,
                type,
                startDate: start,
                endDate: end,
                reason: reason || null,
                attachmentPath,
                status: 'PENDING',
                durationDays
            },
            include: { employee: true }
        });

        // Notify via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.emit('new_notification', {
                type: 'LEAVE_REQUEST',
                message: `Nouvelle demande de congé de ${newLeave.employee?.firstName || 'un employé'} (${type})`,
                date: new Date()
            });
        }

        evenements.emettreSansAttendre('LEAVE_REQUESTED', {
            conge: congePourEvenement(newLeave),
            salarie: evenements.salarie(newLeave.employee),
            canal: 'PORTAIL'
        });

        res.status(201).json({
            message: 'Votre demande de congé a été transmise au service RH.',
            id: newLeave.id,
            trackingId: newLeave.id
        });
    } catch (e) {
        console.error('Error creating public leave:', e);
        res.status(500).json({ error: 'Erreur lors de la soumission.' });
    }
};
