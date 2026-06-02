const prisma = require('../prismaClient');
const { sendMail } = require('../lib/mailer');

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
        const durationDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

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
        const userRole = req.user?.role;
        
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
        const durationDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

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
