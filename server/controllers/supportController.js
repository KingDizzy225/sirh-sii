const prisma = require('../prismaClient');

// Create a new support ticket (with anonymity option)
exports.createTicket = async (req, res) => {
    try {
        const { title, description, category, priority, isAnonymous } = req.body;
        const { email } = req.user;

        // Determine requester (Always attached so the employee can fetch it, but HR view hides name if anonymous)
        const employee = await prisma.employee.findUnique({ where: { email } });
        const requesterId = employee ? employee.id : null;

        const newTicket = await prisma.supportTicket.create({
            data: {
                title,
                description,
                category: category || 'Général',
                priority: priority || 'Medium',
                status: 'Ouvert',
                requesterId
            }
        });

        res.status(201).json(newTicket);
    } catch (error) {
        console.error("Error creating support ticket:", error);
        res.status(500).json({ error: "Erreur serveur lors de la création du ticket." });
    }
};

// Get tickets (All for Social Worker, Only Own for User)
exports.getTickets = async (req, res) => {
    try {
        const { email, role } = req.user;
        const employee = await prisma.employee.findUnique({ where: { email } });

        let tickets;

        // If the user is the Social Worker/HR/Admin, they see all tickets.
        if (role === 'Social Worker' || role === 'HR' || role === 'ADMIN') {
            tickets = await prisma.supportTicket.findMany({
                include: {
                    requester: {
                        select: { firstName: true, lastName: true, department: true }
                    },
                    messages: { orderBy: { createdAt: 'asc' } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });

            tickets = await prisma.supportTicket.findMany({
                where: { requesterId: employee.id },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Erreur serveur de récupération" });
    }
};

// Update ticket status
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.supportTicket.update({
            where: { id },
            data: { status }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ error: "Erreur serveur de mise à jour" });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { body, sender } = req.body;

        const message = await prisma.supportMessage.create({
            data: {
                ticketId,
                sender: sender || 'Employé',
                body
            }
        });

        // Update ticket updated_at
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Erreur serveur Message" });
    }
};
