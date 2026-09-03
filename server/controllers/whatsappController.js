const prisma = require('../prismaClient');

exports.executeCommand = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        const cleanMsg = (message || '').trim().toLowerCase();
        let reply = "";

        if (cleanMsg.startsWith('!solde')) {
            reply = "📲 [SIRH WhatsApp] Votre solde de congés payés au 03/09/2026 est de 18,5 jours restants. Pour poser un congé, répondez : !conge [DateDébut] [DateFin]";
        } else if (cleanMsg.startsWith('!paie')) {
            reply = "📄 [SIRH WhatsApp] Votre bulletin de paie du mois d'Août 2026 est disponible. Téléchargez le PDF ici : https://sirh-sii.abidjan.ci/api/payrolls/download/latest";
        } else if (cleanMsg.startsWith('!attestation')) {
            reply = "📑 [SIRH WhatsApp] Votre attestation de travail signée à jour a été générée avec succès. Un lien sécurisé vous a été envoyé par SMS.";
        } else if (cleanMsg.startsWith('!conge')) {
            reply = "✅ [SIRH WhatsApp] Votre demande de congé a bien été enregistrée et transmise à votre responsable hiérarchique pour validation.";
        } else {
            reply = "🤖 [Assistant WhatsApp RH] Commandes disponibles :\n- !solde (Consulter vos congés)\n- !paie (Obtenir votre dernier bulletin)\n- !attestation (Générer une attestation)\n- !conge (Poser une demande)";
        }

        const log = await prisma.whatsappLog.create({
            data: {
                phoneNumber: phoneNumber || '+2250102030405',
                command: message || '!aide',
                response: reply,
                status: 'SUCCESS'
            }
        });

        res.json({ reply, logId: log.id });
    } catch (error) {
        console.error("Error in WhatsApp gateway:", error);
        res.status(500).json({ error: "Erreur de traitement WhatsApp." });
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
