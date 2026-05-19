const prisma = require('../prismaClient');

exports.createPublicTicket = async (req, res) => {
    try {
        const { title, description, category, priority, email, name } = req.body;

        // Try to find the employee by email if provided, otherwise leave requesterId null
        let requesterId = null;
        if (email) {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (employee) {
                requesterId = employee.id;
            }
        }

        const fullDescription = name && email 
            ? `Requérant: ${name} (${email})\n\n${description}`
            : description;

        const newTicket = await prisma.supportTicket.create({
            data: {
                title,
                description: fullDescription,
                category: category || 'Général',
                priority: priority || 'Medium',
                status: 'Ouvert',
                requesterId,
                isAnonymous: !name
            }
        });

        // Add initial message so it shows up in chat history for HR
        await prisma.supportMessage.create({
            data: {
                ticketId: newTicket.id,
                sender: name || 'Employé',
                body: description
            }
        });

        res.status(201).json({ success: true, trackingId: newTicket.id });
    } catch (error) {
        console.error("Error creating public support ticket:", error);
        res.status(500).json({ error: "Erreur serveur lors de la création de la demande." });
    }
};

exports.getPublicTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!ticket) return res.status(404).json({ error: "Ticket non trouvé." });

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Error fetching public ticket:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

exports.addPublicMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { body, sender } = req.body;

        const message = await prisma.supportMessage.create({
            data: {
                ticketId: id,
                sender: sender || 'Employé',
                body
            }
        });

        await prisma.supportTicket.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error adding public message:", error);
        res.status(500).json({ error: "Erreur serveur Message" });
    }
};

exports.publicClockIn = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Le nom est requis pour pointer." });
        }

        const employee = await prisma.employee.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            }
        });
        if (!employee) {
            return res.status(404).json({ error: "Aucun employé trouvé avec ce nom." });
        }

        const timeLog = await prisma.timeLog.create({
            data: {
                employeeId: employee.id,
                type: 'CLOCK_IN'
            }
        });

        res.status(201).json({ success: true, message: "Présence enregistrée avec succès !", timeLog });
    } catch (error) {
        console.error("Error on public clock-in:", error);
        res.status(500).json({ error: "Erreur serveur lors du pointage." });
    }
};
