const prisma = require('../prismaClient');
const { getPublicAppUrl, getPublicApiUrl } = require('../lib/publicUrl');
const passerelle = require('../lib/whatsapp');

/**
 * Guichet RH par WhatsApp.
 *
 * Les réponses étaient auparavant entièrement fictives : un solde de congés
 * figé à « 18,5 jours » quel que soit le salarié, un lien de bulletin vers un
 * domaine inexistant, et une confirmation de congé alors qu'aucune demande
 * n'était créée. Un salarié pouvait croire son congé posé sans qu'il le soit.
 *
 * Chaque commande interroge désormais la base, et l'expéditeur est identifié
 * par son numéro de téléphone.
 */

/**
 * Compare deux numéros en ignorant espaces, tirets et indicatif pays.
 *
 * La comparaison porte sur les dix derniers chiffres, soit le numéro national
 * ivoirien complet. Se limiter à huit ferait correspondre 0102030405 et
 * 0702030405 — deux salariés distincts — et un collaborateur recevrait le
 * solde de congés d'un collègue.
 */
const normaliserNumero = (numero) => {
    const chiffres = String(numero || '').replace(/[^0-9]/g, '');
    return chiffres.slice(-10);
};

async function trouverSalarie(phoneNumber) {
    const cible = normaliserNumero(phoneNumber);
    // Un numéro trop court ne permet pas une identification sûre : on préfère
    // ne reconnaître personne plutôt que de risquer une correspondance erronée.
    if (cible.length < 10) return null;

    const candidats = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' }, phone: { not: null } },
        select: {
            id: true, firstName: true, lastName: true, phone: true,
            annualLeaveBalance: true, positionTitle: true, department: true
        }
    });
    return candidats.find(e => normaliserNumero(e.phone) === cible) || null;
}

const AIDE =
    "🤖 Assistant RH\n" +
    "Commandes disponibles :\n" +
    "• !solde — votre solde de congés\n" +
    "• !paie — votre dernier bulletin\n" +
    "• !conge JJ/MM/AAAA JJ/MM/AAAA — demander un congé\n" +
    "• !aide — ce message";

/** Analyse une date au format JJ/MM/AAAA. */
const lireDate = (texte) => {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(texte || '').trim());
    if (!m) return null;
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
};

async function traiterCommande(message, salarie) {
    const texte = String(message || '').trim();
    const commande = texte.toLowerCase();

    if (!salarie) {
        return "Votre numéro n'est rattaché à aucun dossier salarié. " +
               "Rapprochez-vous des ressources humaines pour le faire enregistrer.";
    }

    if (commande.startsWith('!solde')) {
        const solde = salarie.annualLeaveBalance ?? 0;
        return `Bonjour ${salarie.firstName}. Votre solde de congés est de ` +
               `${solde} jour(s).\nPour demander un congé : !conge JJ/MM/AAAA JJ/MM/AAAA`;
    }

    if (commande.startsWith('!paie')) {
        const bulletin = await prisma.payroll.findFirst({
            where: { employeeId: salarie.id, status: { in: ['APPROVED', 'PAID'] } },
            orderBy: { period: 'desc' }
        });
        if (!bulletin) {
            return "Aucun bulletin de paie validé n'est disponible pour l'instant.";
        }
        const periode = new Date(bulletin.period)
            .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return `Votre bulletin de ${periode} est disponible.\n` +
               `Connectez-vous à ${getPublicAppUrl()}/payroll pour le télécharger.`;
    }

    if (commande.startsWith('!conge')) {
        const parties = texte.split(/\s+/);
        const debut = lireDate(parties[1]);
        const fin = lireDate(parties[2]);

        if (!debut || !fin) {
            return "Format attendu : !conge JJ/MM/AAAA JJ/MM/AAAA\n" +
                   "Exemple : !conge 15/09/2026 20/09/2026";
        }
        if (fin < debut) {
            return "La date de fin précède la date de début.";
        }

        const jours = Math.round((fin - debut) / 86400000) + 1;
        const solde = salarie.annualLeaveBalance ?? 0;
        if (jours > solde) {
            return `Demande impossible : ${jours} jour(s) demandé(s) pour un solde de ${solde}.`;
        }

        // La demande est réellement créée, et laissée en attente de validation.
        await prisma.leave.create({
            data: {
                employeeId: salarie.id,
                // Même libellé que le formulaire de l'application : une demande
                // venue de WhatsApp doit être indiscernable des autres dans les
                // écrans de validation.
                type: 'Congé Annuel',
                startDate: debut,
                endDate: fin,
                durationDays: jours,
                status: 'PENDING',
                reason: 'Demande transmise par WhatsApp'
            }
        });

        return `Demande enregistrée : ${jours} jour(s) du ` +
               `${debut.toLocaleDateString('fr-FR')} au ${fin.toLocaleDateString('fr-FR')}.\n` +
               'Elle est transmise à votre responsable pour validation.';
    }

    return AIDE;
}

exports.executeCommand = async (req, res) => {
    const { phoneNumber, message } = req.body;
    let reply;
    let status = 'SUCCESS';

    try {
        const salarie = await trouverSalarie(phoneNumber);
        reply = await traiterCommande(message, salarie);
    } catch (error) {
        console.error('Error in WhatsApp gateway:', error);
        reply = "Une erreur est survenue lors du traitement de votre demande. Réessayez plus tard.";
        status = 'ERROR';
    }

    try {
        const log = await prisma.whatsappLog.create({
            data: {
                phoneNumber: phoneNumber || 'inconnu',
                command: message || '!aide',
                response: reply,
                status,
                // Cet écran n'envoie rien : il éprouve les réponses du guichet.
                // Le marquer évite qu'un essai de la RH se lise plus tard comme
                // un message réellement reçu d'un salarié.
                direction: 'SIMULATION',
                delivered: false
            }
        });
        return res.json({ reply, logId: log.id });
    } catch (error) {
        // L'échec de journalisation ne doit pas priver l'utilisateur de sa réponse
        console.error('WhatsApp log non enregistré :', error.message);
        return res.json({ reply });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await prisma.whatsappLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(logs);
    } catch (error) {
        console.error("Error fetching WhatsApp logs:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des logs." });
    }
};


// ----------------------------------------------------
// Raccordement réel à WhatsApp
// ----------------------------------------------------

/**
 * Abonnement du webhook (appel de vérification de Meta).
 *
 * Meta appelle cette adresse une fois, au moment de l'abonnement, et attend
 * qu'on lui rende le défi tel quel — en texte brut, pas en JSON.
 */
exports.verifierWebhook = (req, res) => {
    const { etatConfiguration } = passerelle;
    const attendu = (process.env.WHATSAPP_VERIFY_TOKEN || '').trim();

    if (!attendu) {
        return res.status(503).send('Guichet WhatsApp non configuré (WHATSAPP_VERIFY_TOKEN absent).');
    }

    const mode = req.query['hub.mode'];
    const jeton = req.query['hub.verify_token'];
    const defi = req.query['hub.challenge'];

    if (mode === 'subscribe' && jeton === attendu) {
        console.log('[WHATSAPP] Webhook vérifié par Meta.');
        return res.status(200).send(String(defi || ''));
    }

    console.warn('[WHATSAPP] Vérification refusée (jeton incorrect).', etatConfiguration().variablesManquantes);
    return res.sendStatus(403);
};

/**
 * Réception des messages des salariés.
 *
 * Meta attend un accusé immédiat : au-delà de quelques secondes il considère la
 * remise en échec et réémet le message. On accuse donc réception d'abord, et on
 * traite ensuite — l'identifiant de message, unique en base, empêche qu'une
 * réémission enregistre deux fois la même demande de congé.
 */
exports.recevoirWebhook = async (req, res) => {
    // L'URL est publique. Sans vérification de signature, quiconque la connaît
    // pourrait poser un congé au nom d'un salarié dont il connaît le numéro.
    if (!passerelle.signatureValide(req.rawBody, req.get('x-hub-signature-256'))) {
        console.warn('[WHATSAPP] Message rejeté : signature absente ou invalide.');
        return res.sendStatus(403);
    }

    res.sendStatus(200);

    const messages = passerelle.extraireMessages(req.body);
    for (const message of messages) {
        if (!message.id) continue;

        try {
            // Réservation de l'identifiant : si la ligne existe déjà, c'est une
            // réémission et il n'y a rien à refaire.
            await prisma.whatsappLog.create({
                data: {
                    messageId: message.id,
                    phoneNumber: message.de || 'inconnu',
                    command: message.texte || `[${message.type || 'non textuel'}]`,
                    response: '',
                    status: 'SUCCESS',
                    direction: 'ENTRANT'
                }
            });
        } catch (erreur) {
            if (erreur.code === 'P2002') continue; // déjà traité
            console.error('[WHATSAPP] Journalisation impossible :', erreur.message);
            continue;
        }

        let reponse;
        let statut = 'SUCCESS';
        try {
            if (!message.texte) {
                // Photos, audio, pièces jointes : le guichet ne les traite pas,
                // et le dire vaut mieux qu'un silence.
                reponse = "Ce guichet ne comprend que les messages écrits.\n\n" + AIDE;
            } else {
                const salarie = await trouverSalarie(message.de);
                reponse = await traiterCommande(message.texte, salarie);
            }
        } catch (erreur) {
            console.error('[WHATSAPP] Traitement en échec :', erreur.message);
            reponse = "Une erreur est survenue lors du traitement de votre demande. Réessayez plus tard.";
            statut = 'ERROR';
        }

        const envoi = await passerelle.envoyerMessage(message.de, reponse);
        if (!envoi.remis) {
            // Une réponse calculée mais jamais remise laisse le salarié sans
            // nouvelle, alors que son congé a pu être enregistré.
            console.error('[WHATSAPP] Réponse non remise :', envoi.motif);
        }

        await prisma.whatsappLog.update({
            where: { messageId: message.id },
            data: {
                response: reponse,
                status: envoi.remis ? statut : 'ERROR',
                delivered: envoi.remis
            }
        }).catch((e) => console.error('[WHATSAPP] Mise à jour du journal :', e.message));
    }
};

/**
 * État du raccordement, pour l'écran RH.
 * Sans lui, un guichet à moitié configuré — qui reçoit mais ne répond pas —
 * passerait pour un guichet en service.
 */
exports.getConfiguration = (req, res) => {
    const etat = passerelle.etatConfiguration();
    res.json({
        ...etat,
        // Adresse à coller dans la console Meta. Elle vise l'API, pas le
        // frontend : un webhook pointé sur le site n'atteint aucune route.
        urlWebhook: getPublicApiUrl() ? `${getPublicApiUrl()}/api/whatsapp/webhook` : null,
        urlWebhookMotif: getPublicApiUrl()
            ? null
            : "Adresse de l'API inconnue : définir PUBLIC_API_URL sur le serveur.",
        commandes: AIDE
    });
};
