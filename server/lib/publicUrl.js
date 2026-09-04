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

module.exports = { getPublicAppUrl, DEFAULT_APP_URL };
