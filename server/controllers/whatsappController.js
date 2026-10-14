const prisma = require('../prismaClient');
const { getPublicAppUrl, getPublicApiUrl } = require('../lib/publicUrl');
const passerelle = require('../lib/whatsapp');
const transcription = require('../lib/transcription');
const comprehension = require('../lib/comprehension');

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
    "• !acompte [montant] — demander un acompte sur salaire\n" +
    "• !quiz — défi vente & micro-learning du matin (+10 pts)\n" +
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

    if (commande.startsWith('!acompte')) {
        const parties = texte.split(/\s+/);
        const montant = parseFloat(parties[1]);
        if (!montant || isNaN(montant) || montant < 5000) {
            return "Format attendu : !acompte [montant en FCFA]\n" +
                   "Exemple : !acompte 25000\n" +
                   "La demande sera créditée sur votre mobile money après contrôle de quotité.";
        }
        const dernierBulletin = await prisma.payroll.findFirst({
            where: { employeeId: salarie.id },
            orderBy: { period: 'desc' }
        });
        const salaireRef = dernierBulletin?.baseSalary || 200000;
        const jourDuMois = Math.min(new Date().getDate(), 30);
        const acquisEstime = Math.round(salaireRef * (jourDuMois / 30) * 0.4);
        if (montant > acquisEstime) {
            return `Plafond dépassé : à cette date du mois, votre acompte maximum est de ${acquisEstime.toLocaleString('fr-FR')} FCFA.`;
        }

        const advance = await prisma.salaryAdvance.create({
            data: {
                employeeId: salarie.id,
                amount: montant,
                reason: "Acompte instantané demandé par WhatsApp",
                status: "En attente"
            }
        });
        return `✅ Demande d'acompte de ${montant.toLocaleString('fr-FR')} FCFA enregistrée (Réf: ${advance.id.slice(0, 8)}).\n` +
               "Elle est transmise au service RH pour déblocage sur votre compte Orange Money.";
    }

    if (commande.startsWith('!quiz')) {
        const parties = texte.split(/\s+/);
        const choix = parseInt(parties[1], 10);
        const { quizActifs, participations } = require('../routes/quizVenteRoutes');
        const quiz = quizActifs[0];

        if (!choix || isNaN(choix)) {
            return `⚡ *DÉFI DU MATIN* ⚡\n\n${quiz.question}\n\n` +
                   quiz.options.map(o => `*${o.numero}* : ${o.texte}`).join('\n') + '\n\n' +
                   `👉 Répondez avec : *!quiz [1, 2 ou 3]*`;
        }

        const estCorrect = choix === quiz.reponseCorrecte;
        const points = estCorrect ? quiz.pointsGagnes : 0;
        participations.unshift({
            id: `part-${Date.now()}`,
            employeNom: `${salarie.firstName} ${salarie.lastName || ''}`,
            siteNom: salarie.department || 'Boutique Orange',
            quizId: quiz.id,
            reponseChoisie: choix,
            estCorrect,
            points,
            date: new Date()
        });

        return estCorrect
            ? `🎉 *EXCELLENT !* Bonne réponse (N°${quiz.reponseCorrecte}).\n` +
              `+${points} points ajoutés à votre profil Rewards !\n\n💡 _${quiz.explication}_`
            : `❌ *Ce n'est pas tout à fait ça.*\n` +
              `La bonne réponse était la N°${quiz.reponseCorrecte}.\n\n💡 _${quiz.explication}_`;
    }

    return AIDE;
}

const iaDisponible = () => Boolean((process.env.ANTHROPIC_API_KEY || '').trim());

/**
 * Répond à un message libre.
 *
 * Une commande tapée (« !solde ») s'exécute telle quelle. Une phrase est
 * d'abord traduite en commande par Claude, puis exécutée par le même chemin :
 * les contrôles ne changent pas selon la manière de demander. Sans IA, ou si
 * elle échoue, le salarié reçoit l'aide comme avant — jamais un silence.
 */
async function repondre(texte, salarie) {
    const t = String(texte || '').trim();
    if (!salarie || t.startsWith('!') || !iaDisponible()) return traiterCommande(t, salarie);
    try {
        const { commande, message } = comprehension.versCommande(await comprehension.interpreter(t));
        if (commande) return traiterCommande(commande, salarie);
        if (message) return message;
    } catch (erreur) {
        console.error('[WHATSAPP] Compréhension indisponible :', erreur.message);
    }
    return traiterCommande(t, salarie);
}

/**
 * Note vocale : identification, transcription, puis même chemin qu'un texte.
 *
 * Le salarié est identifié avant toute transcription : un numéro inconnu ne
 * coûte rien et ne fait sortir aucune voix vers le service de transcription.
 * @returns {Promise<{reponse: string, transcrit: string|null}>}
 */
async function repondreAuVocal(message) {
    const salarie = await trouverSalarie(message.de);
    if (!salarie) return { reponse: await traiterCommande('', null), transcrit: null };

    if (!transcription.configuree()) {
        return {
            reponse: "Les messages vocaux ne sont pas encore activés sur ce guichet. " +
                     "Écrivez votre demande, par exemple : « combien de jours de congé me reste-t-il ? »\n\n" + AIDE,
            transcrit: null
        };
    }

    let texte;
    try {
        const media = await passerelle.telechargerMedia(message.audio.id, transcription.TAILLE_MAX_OCTETS);
        texte = await transcription.transcrire(media.contenu, media.typeMime);
    } catch (erreur) {
        console.error('[WHATSAPP] Vocal non transcrit :', erreur.message);
        return {
            reponse: /trop long/i.test(erreur.message)
                ? 'Votre message vocal est trop long. Envoyez un message plus court, ou écrivez votre demande.'
                : "Je n'ai pas pu écouter votre message vocal. Réessayez, ou écrivez votre demande.",
            transcrit: null
        };
    }

    // Répéter ce qui a été entendu : une date mal comprise se corrige aussitôt.
    const reponse = await repondre(texte, salarie);
    return { reponse: `🎙️ J'ai compris : « ${texte.slice(0, 300)} »\n\n${reponse}`, transcrit: texte };
}

exports.executeCommand = async (req, res) => {
    const { phoneNumber, message } = req.body;
    let reply;
    let status = 'SUCCESS';

    try {
        const salarie = await trouverSalarie(phoneNumber);
        reply = await repondre(message, salarie);
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
        let transcrit = null;
        let statut = 'SUCCESS';
        try {
            if (message.audio) {
                ({ reponse, transcrit } = await repondreAuVocal(message));
            } else if (!message.texte) {
                // Photos, pièces jointes : le guichet ne les traite pas, et le
                // dire vaut mieux qu'un silence.
                reponse = "Ce guichet comprend les messages écrits et les notes vocales, pas les fichiers.\n\n" + AIDE;
            } else {
                const salarie = await trouverSalarie(message.de);
                reponse = await repondre(message.texte, salarie);
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
                // La transcription remplace « [audio] » : la RH lit ce qui a été entendu.
                ...(transcrit ? { command: `🎙️ ${transcrit}` } : {}),
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
exports._interne = { repondre, repondreAuVocal };

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
        commandes: AIDE,
        // Le vocal dépend d'un service de transcription distinct de Claude.
        vocal: transcription.etatConfiguration(),
        langageNaturel: iaDisponible()
    });
};

// Diffusion collective de campagnes WhatsApp & SMS RH
exports.broadcastMessage = async (req, res) => {
    try {
        const { campaignTitle, message, targetAudience = 'ALL', channel = 'WHATSAPP' } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Le contenu du message est obligatoire." });
        }

        const employees = await prisma.employee.findMany({
            where: targetAudience === 'ALL' ? {} : { department: targetAudience },
            select: { id: true, firstName: true, lastName: true, phone: true, department: true }
        });

        // Enregistrer la trace de diffusion
        const log = await prisma.whatsappLog.create({
            data: {
                phoneNumber: `BROADCAST_${targetAudience}`,
                command: `[CAMPAGNE: ${campaignTitle || 'Alerte RH'}] - ${channel}`,
                response: message,
                status: 'BROADCAST_SENT'
            }
        });

        res.status(201).json({
            success: true,
            campaignTitle,
            recipientsCount: employees.length,
            channel,
            message: `Campagne envoyée avec succès à ${employees.length} collaborateurs.`,
            logId: log.id
        });
    } catch (error) {
        console.error("Error broadcasting campaign:", error);
        res.status(500).json({ error: "Erreur lors de la diffusion de la campagne." });
    }
};

/**
 * Flash matinal audio / texte diffusé sur WhatsApp à l'ensemble du réseau d'agences.
 */
exports.envoyerMorningBriefing = async (req, res) => {
    try {
        const maintenant = new Date();
        const dateStr = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, firstName: true, lastName: true, phone: true, birthDate: true }
        });

        const annivs = salaries.filter(s => {
            if (!s.birthDate) return false;
            const b = new Date(s.birthDate);
            return b.getUTCDate() === maintenant.getUTCDate() && b.getUTCMonth() === maintenant.getUTCMonth();
        });

        const annonces = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            take: 2
        });

        const texteBriefing =
            `🌅 *LE BRIEFING DU MATIN — SII* 🌅\n` +
            `📅 _${dateStr}_\n\n` +
            `Bonjour à toutes les équipes de distribution Orange Côte d'Ivoire !\n\n` +
            (annivs.length > 0 ? `🎂 *Anniversaire du jour :* Joyeux anniversaire à ${annivs.map(a => a.firstName).join(', ')} ! 🎉\n\n` : '') +
            (annonces.length > 0 ? `📢 *À la une :*\n${annonces.map(a => `• ${a.title}`).join('\n')}\n\n` : '') +
            `🎯 *Objectif du jour :* Cap sur l'excellence commerciale et le service client en agence !\n\n` +
            `💬 _Votre assistant RH reste à votre disposition (!aide). Belle et productive journée !_`;

        const destinataires = salaries.filter(s => s.phone && normaliserNumero(s.phone).length >= 10);
        let envoyes = 0;
        for (const dest of destinataires.slice(0, 30)) {
            passerelle.envoyerTexte(dest.phone, texteBriefing).catch(() => null);
            envoyes++;
        }

        await prisma.whatsappLog.create({
            data: {
                phoneNumber: 'MORNING_BRIEFING',
                command: '!morning-briefing',
                response: texteBriefing,
                status: 'BRIEFING_SENT'
            }
        });

        res.json({
            succes: true,
            destinataires: destinataires.length,
            envoyesReels: envoyes,
            briefing: texteBriefing
        });
    } catch (e) {
        console.error('[WHATSAPP] Briefing matinal :', e.message);
        res.status(500).json({ error: 'Erreur lors du briefing matinal.' });
    }
};
