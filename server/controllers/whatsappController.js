const prisma = require('../prismaClient');
const { getPublicAppUrl } = require('../lib/publicUrl');

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
                status
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
