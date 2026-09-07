/**
 * Adresse publique de l'application, telle qu'elle doit apparaître dans les
 * QR codes et les liens envoyés à l'extérieur.
 *
 * Un QR code encodant une adresse relative est inutilisable : scanné par un
 * téléphone, il ne mène nulle part. On garantit donc toujours une URL absolue,
 * quitte à retomber sur l'adresse de production connue, et on signale la
 * configuration manquante dans les journaux.
 */

const DEFAULT_APP_URL = 'https://sirh-sii.vercel.app';

let warned = false;

function getPublicAppUrl() {
    const configured = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL;

    if (configured && /^https?:\/\//i.test(configured)) {
        return configured.replace(/\/$/, '');
    }

    if (!warned) {
        console.warn(
            '[CONFIG] PUBLIC_APP_URL (ou FRONTEND_URL) non défini ou invalide : ' +
            `les liens publics utilisent ${DEFAULT_APP_URL}. ` +
            "Définissez-le dans les variables d'environnement pour pointer vers votre domaine."
        );
        warned = true;
    }
    return DEFAULT_APP_URL;
}

/**
 * Adresse publique de l'API elle-même — celle que des services extérieurs
 * doivent appeler (webhook WhatsApp, notamment).
 *
 * Ce n'est pas l'adresse du frontend : un webhook pointé sur Vercel n'atteint
 * aucune route de l'API. Render publie l'adresse du service dans
 * RENDER_EXTERNAL_URL ; ailleurs, il faut la déclarer. On ne devine rien :
 * une valeur absente est rendue telle quelle, à charge pour l'écran de le dire.
 *
 * @returns {string|null}
 */
function getPublicApiUrl() {
    const configured = process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL;
    if (configured && /^https?:\/\//i.test(configured)) {
        return configured.replace(/\/$/, '');
    }
    return null;
}

module.exports = { getPublicAppUrl, getPublicApiUrl, DEFAULT_APP_URL };
