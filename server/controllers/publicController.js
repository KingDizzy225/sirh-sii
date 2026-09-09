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

        const nameParts = name.trim().split(' ');
        if (nameParts.length < 2) {
            return res.status(400).json({ error: "Veuillez entrer votre prénom et votre nom (ex: Jean Dupont)." });
        }

        const first = nameParts[0];
        const second = nameParts.slice(1).join(' ');

        const employee = await prisma.employee.findFirst({
            where: {
                OR: [
                    { 
                        firstName: { equals: first, mode: 'insensitive' }, 
                        lastName: { equals: second, mode: 'insensitive' } 
                    },
                    { 
                        firstName: { equals: second, mode: 'insensitive' }, 
                        lastName: { equals: first, mode: 'insensitive' } 
                    }
                ],
                status: 'ACTIVE'
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

/**
 * GET /api/public/suivi/:reference
 *
 * Le portail rendait une référence après chaque dépôt, et rien ne permettait de
 * la consulter : le salarié déposait sa demande et n'en entendait plus parler.
 * Depuis que les comptes salariés sont fermés, c'était son seul lien avec
 * l'application — et il ne menait nulle part.
 *
 * La référence est l'identifiant du dépôt : trente-six caractères aléatoires,
 * ni devinables ni énumérables. C'est elle qui tient lieu d'autorisation, comme
 * le jeton d'un lien de remise.
 *
 * Ne sont renvoyées que les mentions du dépôt lui-même — nature, dates, état.
 * Ni rémunération, ni coordonnées, ni rien qui concerne un autre salarié.
 */
exports.suivreDemande = async (req, res) => {
    try {
        const reference = String(req.params.reference || '').trim();
        // Un format invalide se répond comme une référence inconnue : distinguer
        // les deux dirait à quoi ressemble une référence valable.
        if (!/^[0-9a-f-]{20,40}$/i.test(reference)) {
            return res.status(404).json({ trouve: false, motif: 'Référence inconnue.' });
        }

        const etatsLisibles = {
            PENDING: 'Reçue, en attente de validation',
            PENDING_HR: 'Validée par le responsable, en attente des ressources humaines',
            APPROVED: 'Approuvée',
            REJECTED: 'Refusée',
            'En attente': 'Reçue, en attente de validation',
            'Approuvé': 'Approuvée',
            'Rejeté': 'Refusée',
            OUVERT: 'Reçue',
            'Ouvert': 'Reçue',
            'Résolu': 'Traitée',
            'Fermé': 'Clôturée'
        };
        const lisible = (v) => etatsLisibles[v] || v || 'Reçue';

        const [conge, avance, ticket] = await Promise.all([
            prisma.leave.findUnique({
                where: { id: reference },
                select: { type: true, startDate: true, endDate: true, durationDays: true,
                          status: true, createdAt: true }
            }),
            prisma.salaryAdvance.findUnique({
                where: { id: reference },
                select: { amount: true, status: true, requestedAt: true, reason: true }
            }),
            prisma.supportTicket.findUnique({
                where: { id: reference },
                select: { category: true, status: true, createdAt: true }
            })
        ]);

        if (conge) {
            return res.json({
                trouve: true, nature: 'Demande de congé', objet: conge.type,
                depose: conge.createdAt, etat: lisible(conge.status),
                detail: `${conge.durationDays} jour(s) ouvrable(s), `
                    + `du ${new Date(conge.startDate).toLocaleDateString('fr-FR')} `
                    + `au ${new Date(conge.endDate).toLocaleDateString('fr-FR')}`
            });
        }
        if (avance) {
            return res.json({
                trouve: true, nature: 'Demande d\'avance', objet: avance.reason || null,
                depose: avance.requestedAt, etat: lisible(avance.status),
                detail: `${Math.round(avance.amount).toLocaleString('fr-FR')} FCFA`
            });
        }
        if (ticket) {
            return res.json({
                trouve: true, nature: 'Demande au service social', objet: ticket.category,
                depose: ticket.createdAt, etat: lisible(ticket.status),
                detail: null
            });
        }

        res.status(404).json({ trouve: false, motif: 'Référence inconnue.' });
    } catch (error) {
        console.error('Erreur suivi de demande :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du suivi.' });
    }
};
