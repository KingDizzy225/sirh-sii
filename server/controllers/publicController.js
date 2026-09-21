const prisma = require('../prismaClient');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialiser Gemini pour la FAQ publique
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Helper : trouver un employé par email ou par nom ou par ID
async function findEmployee(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim();

    // 1. Par email
    if (clean.includes('@')) {
        return await prisma.employee.findUnique({
            where: { email: clean }
        });
    }

    // 2. Par ID exact
    try {
        const byId = await prisma.employee.findUnique({
            where: { id: clean }
        });
        if (byId) return byId;
    } catch (_) {}

    // 3. Par Prénom Nom
    const parts = clean.split(' ');
    if (parts.length >= 2) {
        const first = parts[0];
        const rest = parts.slice(1).join(' ');
        const emp = await prisma.employee.findFirst({
            where: {
                OR: [
                    { firstName: { equals: first, mode: 'insensitive' }, lastName: { equals: rest, mode: 'insensitive' } },
                    { firstName: { equals: rest, mode: 'insensitive' }, lastName: { equals: first, mode: 'insensitive' } }
                ],
                status: 'ACTIVE'
            }
        });
        if (emp) return emp;
    }

    // 4. Par prénom ou nom seul
    return await prisma.employee.findFirst({
        where: {
            OR: [
                { firstName: { equals: clean, mode: 'insensitive' } },
                { lastName: { equals: clean, mode: 'insensitive' } }
            ],
            status: 'ACTIVE'
        }
    });
}

// ---------------------------------------------------------------------
// 1. POINTAGE COMPLET (IN / OUT / RETARD / QR)
// ---------------------------------------------------------------------
exports.publicClockIn = async (req, res) => {
    try {
        const { identifier, name, type = 'CLOCK_IN', reason, delayMinutes } = req.body;
        const lookup = identifier || name;

        if (!lookup) {
            return res.status(400).json({ error: "Matricule, Email ou Nom de l'employé requis pour pointer." });
        }

        const employee = await findEmployee(lookup);
        if (!employee) {
            return res.status(404).json({ error: "Collaborateur introuvable. Vérifiez votre email ou nom." });
        }

        // Cas : Signalement de Retard
        if (type === 'DELAY') {
            const today = new Date();
            const absence = await prisma.absence.create({
                data: {
                    employeeId: employee.id,
                    type: 'Retard',
                    date: today,
                    durationMinutes: parseInt(delayMinutes) || 30,
                    justification: reason || 'Retard signalé via le Guichet Libre-Service',
                    status: 'Justifié',
                    createdBy: `${employee.firstName} ${employee.lastName} (Self-Service)`
                }
            });

            // Notification pour les RH
            try {
                await prisma.notification.create({
                    data: {
                        employeeId: employee.id,
                        type: 'Alerte',
                        message: `⚠️ Retard signalé : ${employee.firstName} ${employee.lastName} (${delayMinutes || 30} min) - ${reason || 'Sans motif'}`,
                        link: '/absences'
                    }
                });
            } catch (_) {}

            return res.status(201).json({
                success: true,
                message: `Retard de ${delayMinutes || 30} minutes enregistré et transmis aux RH.`,
                employee: { id: employee.id, name: `${employee.firstName} ${employee.lastName}`, department: employee.department }
            });
        }

        // Cas : Pointage Normal (CLOCK_IN ou CLOCK_OUT)
        const timeLog = await prisma.timeLog.create({
            data: {
                employeeId: employee.id,
                type: type === 'CLOCK_OUT' ? 'CLOCK_OUT' : 'CLOCK_IN'
            }
        });

        const isArrival = type !== 'CLOCK_OUT';
        const actionLabel = isArrival ? 'Arrivée' : 'Départ';

        res.status(201).json({
            success: true,
            message: `Pointage d'${actionLabel} validé pour ${employee.firstName} ${employee.lastName} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
            timeLog,
            employee: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`,
                position: employee.positionTitle,
                department: employee.department
            }
        });
    } catch (error) {
        console.error("Error on public clock-in:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'enregistrement du pointage." });
    }
};

// ---------------------------------------------------------------------
// 2. GÉNÉRATEUR D'ATTESTATIONS RH INSTANTANÉES (PDF)
// ---------------------------------------------------------------------
exports.generatePublicCertificate = async (req, res) => {
    try {
        const { identifier, certificateType = 'WORK' } = req.body;

        if (!identifier) {
            return res.status(400).json({ error: "Veuillez renseigner votre email ou matricule." });
        }

        const employee = await findEmployee(identifier);
        if (!employee) {
            return res.status(404).json({ error: "Aucun collaborateur trouvé avec cet identifiant." });
        }

        // Générer le PDF avec PDFKit
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Configuration des en-têtes de réponse pour le téléchargement
        const filename = `Attestation_${certificateType}_${employee.lastName}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // Header / Logo
        doc.fillColor('#1e3a8a')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text('SII CÔTE D\'IVOIRE', 50, 50);

        doc.fillColor('#64748b')
           .font('Helvetica')
           .fontSize(9)
           .text('Technologies & Services Numériques - Direction des Ressources Humaines', 50, 75)
           .text('Abidjan Plateau, Immeuble Horizon - Tél : +225 27 20 00 00 00 - rh@sii-ci.com', 50, 88);

        doc.moveTo(50, 105).lineTo(550, 105).strokeColor('#cbd5e1').stroke();

        // Titre du document
        let docTitle = "ATTESTATION DE TRAVAIL";
        if (certificateType === 'SALARY') docTitle = "ATTESTATION DE SALAIRE";
        if (certificateType === 'INTERNSHIP') docTitle = "CERTIFICAT DE STAGE";

        doc.moveDown(3);
        doc.fillColor('#0f172a')
           .font('Helvetica-Bold')
           .fontSize(16)
           .text(docTitle, { align: 'center', underline: true });

        doc.moveDown(2);

        // Corps du document
        const todayDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const hireDate = employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'la date d\'embauche';

        doc.font('Helvetica').fontSize(11).fillColor('#334155').lineGap(6);

        doc.text(`La Direction des Ressources Humaines de la société SII Côte d'Ivoire certifie par la présente que :`);
        doc.moveDown(0.5);

        doc.font('Helvetica-Bold')
           .text(`Madame / Monsieur : ${employee.firstName.toUpperCase()} ${employee.lastName.toUpperCase()}`)
           .text(`Matricule interne : ${employee.id.slice(0, 8).toUpperCase()}`)
           .text(`Poste occupé : ${employee.positionTitle || 'Collaborateur'}`)
           .text(`Département : ${employee.department || 'Opérations'}`)
           .text(`Type de contrat : ${employee.contractType || 'CDI'}`);

        doc.moveDown(0.5);
        doc.font('Helvetica');

        if (certificateType === 'WORK') {
            doc.text(`Est employé(e) au sein de notre entreprise depuis le ${hireDate} et fait partie de nos effectifs à ce jour.`);
            doc.text(`Pendant cette période, le collaborateur a toujours fait preuve de professionnalisme, d'engagement et de probité dans l'exercice de ses missions.`);
        } else if (certificateType === 'SALARY') {
            doc.text(`Est régulièrement rémunéré(e) au titre de ses fonctions contractuelles.`);
            doc.text(`La présente attestation est délivrée pour servir et valoir ce que de droit auprès des organismes bancaires, consulaires ou administratifs.`);
        } else if (certificateType === 'INTERNSHIP') {
            doc.text(`A effectué avec succès sa période de stage d'immersion professionnelle au sein de nos équipes.`);
            doc.text(`Le présent certificat lui est délivré pour faire valoir ses compétences techniques et son expérience pratique.`);
        }

        doc.moveDown(1.5);
        doc.text(`La présente attestation lui est délivrée à sa demande pour servir et valoir ce que de droit.`);

        doc.moveDown(2);
        doc.text(`Fait à Abidjan, le ${todayDate}.`, { align: 'right' });

        // Signature et tampon
        doc.moveDown(2);
        const signatureY = doc.y;

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
        doc.text('Pour la Direction des Ressources Humaines', 320, signatureY);
        doc.font('Helvetica').fontSize(9).fillColor('#64748b');
        doc.text('Le Directeur des Ressources Humaines', 320, signatureY + 14);

        // Cadre Tampon Numérique
        doc.rect(320, signatureY + 35, 180, 75).strokeColor('#2563eb').lineWidth(1.5).stroke();
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#2563eb');
        doc.text('SII CÔTE D\'IVOIRE', 330, signatureY + 45);
        doc.font('Helvetica').fontSize(7.5).fillColor('#1e40af');
        doc.text('DIRECTION DES RESSOURCES HUMAINES', 330, signatureY + 58);
        doc.text('Certifié Conforme & Authentifié', 330, signatureY + 70);
        doc.text(`RÉF : CERT-${Date.now().toString().slice(-6)}`, 330, signatureY + 82);

        // Footer avec authenticité
        doc.fontSize(8).fillColor('#94a3b8');
        doc.text(`Document officiel généré électroniquement par le SIRH SII. Vérifiable auprès de rh@sii-ci.com avec la réf : ${employee.id.slice(0, 8)}`, 50, 750, { align: 'center', width: 500 });

        doc.end();
    } catch (error) {
        console.error("Error generating public certificate:", error);
        res.status(500).json({ error: "Erreur lors de la génération du document PDF." });
    }
};

// ---------------------------------------------------------------------
// 3. SUIVI UNIVERSEL DE DOSSIER (TRACKING)
// ---------------------------------------------------------------------
exports.trackPublicRequest = async (req, res) => {
    try {
        const { query } = req.params; // ID de ticket, ID de demande, ou email
        if (!query) {
            return res.status(400).json({ error: "Veuillez spécifier une référence ou un email." });
        }

        const clean = query.trim();

        // 1. Recherche par Ticket de Support
        const ticket = await prisma.supportTicket.findFirst({
            where: {
                OR: [
                    { id: clean },
                    { id: { startsWith: clean } }
                ]
            },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (ticket) {
            return res.json({
                found: true,
                type: 'TICKET',
                reference: ticket.id.slice(0, 8).toUpperCase(),
                title: ticket.title,
                category: ticket.category,
                status: ticket.status,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
                messagesCount: ticket.messages.length,
                messages: ticket.messages.map(m => ({ sender: m.sender, body: m.body, date: m.createdAt }))
            });
        }

        // 2. Recherche par Demande de Congé / Absence
        const leave = await prisma.leave.findFirst({
            where: {
                OR: [
                    { id: clean },
                    { id: { startsWith: clean } }
                ]
            },
            include: { employee: true }
        });

        if (leave) {
            return res.json({
                found: true,
                type: 'LEAVE',
                reference: leave.id.slice(0, 8).toUpperCase(),
                title: `Demande de ${leave.type}`,
                category: 'Congés & Absences',
                status: leave.status === 'Approved' ? 'Validé' : leave.status === 'Rejected' ? 'Refusé' : 'En attente',
                createdAt: leave.createdAt,
                details: {
                    startDate: leave.startDate,
                    endDate: leave.endDate,
                    duration: leave.durationDays,
                    employee: `${leave.employee.firstName} ${leave.employee.lastName}`
                }
            });
        }

        // 3. Recherche par Avance sur salaire
        const advance = await prisma.salaryAdvance.findFirst({
            where: {
                OR: [
                    { id: clean },
                    { id: { startsWith: clean } }
                ]
            },
            include: { employee: true }
        });

        if (advance) {
            return res.json({
                found: true,
                type: 'ADVANCE',
                reference: advance.id.slice(0, 8).toUpperCase(),
                title: `Demande d'avance : ${advance.amount.toLocaleString('fr-FR')} FCFA`,
                category: 'Avance sur Salaire',
                status: advance.status,
                createdAt: advance.requestedAt,
                details: {
                    amount: advance.amount,
                    reason: advance.reason,
                    employee: `${advance.employee.firstName} ${advance.employee.lastName}`
                }
            });
        }

        // 4. Si c'est un email, retourner l'ensemble de ses demandes actives
        if (clean.includes('@')) {
            const emp = await prisma.employee.findUnique({ where: { email: clean } });
            if (emp) {
                const tickets = await prisma.supportTicket.findMany({
                    where: { requesterId: emp.id },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                });
                const leaves = await prisma.leave.findMany({
                    where: { employeeId: emp.id },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                });
                const advances = await prisma.salaryAdvance.findMany({
                    where: { employeeId: emp.id },
                    orderBy: { requestedAt: 'desc' },
                    take: 5
                });

                return res.json({
                    found: true,
                    type: 'EMAIL_SUMMARY',
                    employee: `${emp.firstName} ${emp.lastName}`,
                    tickets: tickets.map(t => ({ id: t.id.slice(0, 8).toUpperCase(), title: t.title, status: t.status, date: t.createdAt })),
                    leaves: leaves.map(l => ({ id: l.id.slice(0, 8).toUpperCase(), type: l.type, status: l.status, date: l.createdAt })),
                    advances: advances.map(a => ({ id: a.id.slice(0, 8).toUpperCase(), amount: a.amount, status: a.status, date: a.requestedAt }))
                });
            }
        }

        return res.status(404).json({ error: "Aucun dossier trouvé pour cette référence ou cet email." });
    } catch (error) {
        console.error("Error tracking public request:", error);
        res.status(500).json({ error: "Erreur serveur lors de la recherche du dossier." });
    }
};

// ---------------------------------------------------------------------
// 4. DÉPÔT PUBLIC DE NOTES DE FRAIS
// ---------------------------------------------------------------------
exports.submitPublicExpense = async (req, res) => {
    try {
        const { email, amount, category, merchant, date, notes } = req.body;

        if (!email || !amount) {
            return res.status(400).json({ error: "L'email et le montant sont requis." });
        }

        let employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            return res.status(404).json({ error: "Aucun collaborateur trouvé avec cet email." });
        }

        const expense = await prisma.expense.create({
            data: {
                employeeId: employee.id,
                amount: parseFloat(amount),
                currency: 'FCFA',
                category: category || 'Déplacement',
                merchant: merchant || 'Non spécifié',
                date: date ? new Date(date) : new Date(),
                status: 'En attente',
                rejectionReason: notes || null
            }
        });

        // Notification RH
        try {
            await prisma.notification.create({
                data: {
                    employeeId: employee.id,
                    type: 'Info',
                    message: `🧾 Note de frais soumise : ${employee.firstName} ${employee.lastName} (${parseFloat(amount).toLocaleString('fr-FR')} FCFA)`,
                    link: '/expenses'
                }
            });
        } catch (_) {}

        res.status(201).json({
            success: true,
            message: "Note de frais enregistrée avec succès. Elle sera traitée lors de la prochaine paie.",
            trackingId: expense.id
        });
    } catch (error) {
        console.error("Error submitting public expense:", error);
        res.status(500).json({ error: "Erreur lors du dépôt de la note de frais." });
    }
};

// ---------------------------------------------------------------------
// 5. CLIMAT SOCIAL, ENPS & BOÎTE À IDÉES
// ---------------------------------------------------------------------
exports.submitPublicFeedback = async (req, res) => {
    try {
        const { score, feedback, department, isIdea = false } = req.body;

        let activeSurvey = await prisma.climateSurvey.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        if (!activeSurvey) {
            activeSurvey = await prisma.climateSurvey.create({
                data: {
                    title: 'Baromètre Climat Continu & Idées',
                    description: 'Recueil continu des avis et suggestions collaborateurs',
                    status: 'ACTIVE',
                    createdBy: 'system'
                }
            });
        }

        const newResponse = await prisma.surveyResponse.create({
            data: {
                surveyId: activeSurvey.id,
                score: score !== undefined ? parseInt(score) : 10,
                feedback: feedback || (isIdea ? 'Suggestion d\'amélioration' : null),
                department: department || 'Général'
            }
        });

        res.status(201).json({
            success: true,
            message: isIdea ? "Merci pour votre idée ! Elle a été transmise à la direction RH." : "Merci pour votre évaluation ! Votre avis compte énormément.",
            id: newResponse.id
        });
    } catch (error) {
        console.error("Error submitting public feedback:", error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de votre avis." });
    }
};

// ---------------------------------------------------------------------
// 6. ASSISTANT CHATBOT FAQ RH (PUBLIC)
// ---------------------------------------------------------------------
exports.publicFaqChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message requis." });
        }

        const prompt = `Tu es l'assistant virtuel RH du guichet unique pour l'entreprise SII Côte d'Ivoire.
Tu t'adresses de façon courtoise, chaleureuse et professionnelle aux employés de SII qui posent des questions sans être connectés.

Règles de base de l'entreprise :
- Horaires normaux : 08h00 à 17h00 (du lundi au vendredi).
- Les fiches de paie sont disponibles le dernier jour ouvré du mois.
- Congés annuels : 2.5 jours ouvrables acquis par mois travaillé (30 jours par an).
- Pour déclarer une naissance, un mariage ou un changement d'adresse : fournir l'acte d'état civil via le guichet ("Requête Générale").
- Mutuelle d'entreprise : prise en charge à 80% des soins chez les partenaires agréés.
- Pointage : possible directement sur cette page via l'onglet Pointage ou via QR Code.

Question du collaborateur : "${message}"

Réponds de manière concise (3 à 5 phrases maximum), claire, empathique et avec des conseils pratiques. N'invente pas de lois non mentionnées.`;

        try {
            const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await aiModel.generateContent(prompt);
            const reply = result.response.text();
            return res.json({ reply });
        } catch (aiErr) {
            console.warn("AI generation fallback:", aiErr.message);
            const lower = message.toLowerCase();
            let fallbackReply = "Bonjour ! Le service des Ressources Humaines de SII Côte d'Ivoire est à votre écoute. Vous pouvez déposer votre demande officielle via l'onglet 'Requête Générale' ou 'Demande d'Absence', ou contacter l'équipe à rh@sii-ci.com.";

            if (lower.includes('paie') || lower.includes('salaire')) {
                fallbackReply = "Les salaires sont généralement virés entre le 25 et le 30 de chaque mois. Pour toute question spécifique sur vos déductions ou primes, vous pouvez soumettre une requête générale avec votre email.";
            } else if (lower.includes('congé') || lower.includes('absence') || lower.includes('vacance')) {
                fallbackReply = "Vous bénéficiez de 2,5 jours de congés par mois travaillé (soit 30 jours par an). Vous pouvez soumettre votre demande directement via l'onglet 'Demande d'Absence' de ce guichet.";
            } else if (lower.includes('pointage') || lower.includes('pointer') || lower.includes('retard')) {
                fallbackReply = "Vous pouvez enregistrer votre arrivée ou signaler un retard imprévu directement depuis l'onglet 'Pointage & Présence' en haut de ce guichet avec votre matricule ou email.";
            } else if (lower.includes('attestation')) {
                fallbackReply = "Les attestations de travail et de salaire sont téléchargeables immédiatement au format officiel PDF depuis l'onglet 'Attestations RH' de ce guichet.";
            }

            return res.json({ reply: fallbackReply });
        }
    } catch (error) {
        console.error("Error in public FAQ chat:", error);
        res.status(500).json({ error: "Erreur serveur assistant RH." });
    }
};

// ---------------------------------------------------------------------
// 7. FONCTIONS EXISTANTES CONSERVÉES (TICKETS & MESSAGES)
// ---------------------------------------------------------------------
exports.createPublicTicket = async (req, res) => {
    try {
        const { title, description, category, priority, email, name } = req.body;

        let requesterId = null;
        if (email) {
            const employee = await prisma.employee.findUnique({ where: { email } });
            if (employee) requesterId = employee.id;
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
/**
 * GET /api/public/suivi/:reference
 *
 * Suivi d'un dépôt par sa référence.
 */
exports.suivreDemande = async (req, res) => {
    try {
        const reference = String(req.params.reference || '').trim();
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
