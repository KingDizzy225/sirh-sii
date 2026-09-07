const crypto = require('crypto');

/**
 * Raccordement au guichet WhatsApp (WhatsApp Cloud API).
 *
 * La logique du guichet — reconnaître le salarié à son numéro, lui donner son
 * solde, enregistrer sa demande de congé — existait déjà et fonctionnait. Elle
 * n'était joignable que depuis un écran d'administration : aucun salarié ne
 * pouvait l'atteindre. C'était un simulateur.
 *
 * Ce module fournit ce qui manquait : la réception des messages, la
 * vérification de leur origine, et l'envoi des réponses.
 *
 * Variables d'environnement :
 *   WHATSAPP_TOKEN            jeton d'accès permanent de l'application Meta
 *   WHATSAPP_PHONE_NUMBER_ID  identifiant du numéro expéditeur
 *   WHATSAPP_VERIFY_TOKEN     chaîne choisie par vous, redonnée à Meta lors de
 *                             l'abonnement au webhook
 *   WHATSAPP_APP_SECRET       secret de l'application, sert à vérifier que les
 *                             messages viennent bien de Meta
 *   WHATSAPP_API_VERSION      défaut v21.0
 */

const VERSION_API = process.env.WHATSAPP_API_VERSION || 'v21.0';

const config = () => ({
    token: (process.env.WHATSAPP_TOKEN || '').trim(),
    phoneNumberId: (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim(),
    verifyToken: (process.env.WHATSAPP_VERIFY_TOKEN || '').trim(),
    appSecret: (process.env.WHATSAPP_APP_SECRET || '').trim()
});

/**
 * État du raccordement, tel que l'écran RH doit le montrer.
 *
 * Un guichet à moitié configuré est le pire des cas : il accepte les messages
 * et ne répond jamais, sans que personne ne s'en aperçoive. On distingue donc
 * la réception de l'émission.
 */
function etatConfiguration() {
    const c = config();
    const manquantes = [];
    if (!c.token) manquantes.push('WHATSAPP_TOKEN');
    if (!c.phoneNumberId) manquantes.push('WHATSAPP_PHONE_NUMBER_ID');
    if (!c.verifyToken) manquantes.push('WHATSAPP_VERIFY_TOKEN');
    if (!c.appSecret) manquantes.push('WHATSAPP_APP_SECRET');

    return {
        receptionActive: Boolean(c.verifyToken && c.appSecret),
        envoiActif: Boolean(c.token && c.phoneNumberId),
        variablesManquantes: manquantes,
        versionApi: VERSION_API
    };
}

/**
 * Vérifie la signature d'un appel entrant.
 *
 * L'URL du webhook est publique : sans cette vérification, n'importe qui
 * pouvant l'atteindre pourrait poser un congé au nom d'un salarié en se
 * contentant de connaître son numéro de téléphone.
 *
 * @param {Buffer|string} corpsBrut  corps exact reçu, avant analyse JSON
 */
function signatureValide(corpsBrut, entete) {
    const { appSecret } = config();
    if (!appSecret) return false;
    if (!entete || !corpsBrut) return false;

    const attendue = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(corpsBrut)
        .digest('hex');

    const a = Buffer.from(attendue);
    const b = Buffer.from(String(entete));
    // Comparaison à durée constante : une comparaison ordinaire laisserait
    // deviner la signature octet par octet.
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Extrait les messages texte d'une notification Meta.
 * Les accusés de lecture et les changements de statut arrivent par le même
 * canal et ne sont pas des messages : on les ignore.
 */
function extraireMessages(corps) {
    const messages = [];
    for (const entree of corps?.entry || []) {
        for (const changement of entree.changes || []) {
            const valeur = changement.value || {};
            for (const message of valeur.messages || []) {
                messages.push({
                    id: message.id,
                    de: message.from,
                    type: message.type,
                    texte: message.text?.body
                        || message.button?.text
                        || message.interactive?.list_reply?.title
                        || null
                });
            }
        }
    }
    return messages;
}

/**
 * Envoie un message texte à un numéro.
 * @returns {Promise<{remis: boolean, motif?: string}>}
 */
async function envoyerMessage(numero, texte) {
    const { token, phoneNumberId } = config();
    if (!token || !phoneNumberId) {
        return { remis: false, motif: 'Envoi non configuré (WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID absent).' };
    }

    try {
        const reponse = await fetch(
            `https://graph.facebook.com/${VERSION_API}/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: String(numero).replace(/[^0-9]/g, ''),
                    type: 'text',
                    text: { preview_url: false, body: String(texte).slice(0, 4096) }
                })
            }
        );

        if (!reponse.ok) {
            const detail = await reponse.text();
            // Le message d'erreur de Meta est explicite (jeton expiré, numéro
            // hors fenêtre de 24 h, modèle requis) : le journaliser tel quel
            // évite de chercher à l'aveugle.
            console.error('[WHATSAPP] Envoi refusé :', reponse.status, detail.slice(0, 400));
            return { remis: false, motif: `Refus de l'opérateur (HTTP ${reponse.status}).` };
        }
        return { remis: true };
    } catch (erreur) {
        console.error('[WHATSAPP] Envoi impossible :', erreur.message);
        return { remis: false, motif: `Opérateur injoignable : ${erreur.message}` };
    }
}

module.exports = { etatConfiguration, signatureValide, extraireMessages, envoyerMessage, VERSION_API };
