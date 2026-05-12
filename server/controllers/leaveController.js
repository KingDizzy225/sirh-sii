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
        const { status } = req.body; // 'APPROVED', 'REJECTED'

        const existingLeave = await prisma.leave.findUnique({ where: { id } });
        if (!existingLeave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        let balanceDeduction = 0;
        if (status === 'APPROVED' && existingLeave.status !== 'APPROVED') {
            balanceDeduction = existingLeave.durationDays;
        } else if (status !== 'APPROVED' && existingLeave.status === 'APPROVED') {
            // Reverting an approval
            balanceDeduction = -existingLeave.durationDays;
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.leave.update({
                where: { id },
                data: { status }
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
            sendMail({
                to: result.employee.email,
                subject: `Statut de votre demande de congé : ${status}`,
                html: `<h1>Mise à jour</h1><p>Votre demande de congé a été marquée comme : <strong>${status}</strong>.</p>`
            }).catch(console.error);
        }

        // SIMULATION : Webhook Slack / Microsoft Teams
        if (status === 'APPROVED') {
            console.log(`[WEBHOOK SLACK] Envoi du message au canal #rh-absences : 
"✅ Congé validé pour ${result.employee?.firstName} ${result.employee?.lastName}. 
Dates : du ${new Date(existingLeave.startDate).toLocaleDateString()} au ${new Date(existingLeave.endDate).toLocaleDateString()}."`);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ error: 'Failed to update leave status' });
    }
};
