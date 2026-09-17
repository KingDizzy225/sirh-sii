const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');
const { distanceMetres } = require('./anomaliesPointage');

/**
 * Pointage sur l'écran d'agence.
 *
 * Le QR fixe propre à chaque salarié se photographie : un collègue pointe à sa
 * place. Le GPS se falsifie. L'écran de l'agence affiche ici un code qui change
 * toutes les trente secondes, calculé comme un code d'authentification à usage
 * limité dans le temps : pour le scanner, il faut être devant l'écran, ou que
 * quelqu'un qui y est vous l'envoie dans la minute.
 *
 * **Ce que ce dispositif ne prouve pas.** Une photo du QR relayée aussitôt par
 * WhatsApp reste possible. La position du téléphone, quand elle est fournie,
 * est donc enregistrée et confrontée au site : un scan lointain est marqué hors
 * périmètre et remonte dans les anomalies. Et si le lien de l'écran lui-même
 * circule, le code peut se lire à distance — d'où la révocation, qui change
 * aussi le secret.
 *
 * Le salarié est reconnu par son badge numérique, ouvert au moins une fois sur
 * son téléphone : pas de nom à taper, rien à deviner.
 */

const PERIODE_S = 30;
/** Un double scan dans cet intervalle est ignoré plutôt que pris pour une sortie. */
const DELAI_ANTI_DOUBLON_MS = (parseInt(process.env.POINTAGE_ECRAN_DOUBLON_MIN, 10) || 2) * 60000;

const nouveauSecret = () => crypto.randomBytes(32).toString('hex');
const fenetre = (date = new Date()) => Math.floor(date.getTime() / (PERIODE_S * 1000));

function code(secret, numeroFenetre) {
    return crypto.createHmac('sha256', secret).update(String(numeroFenetre)).digest('hex').slice(0, 16);
}

/** Secondes avant le prochain changement de code. */
const secondesRestantes = (date = new Date()) => PERIODE_S - (Math.floor(date.getTime() / 1000) % PERIODE_S);

/**
 * Le code présenté est-il celui de la fenêtre courante ou de la précédente ?
 * La précédente est admise : un scan fait à la 29e seconde arrive à la 31e.
 * @returns {number|null} la fenêtre reconnue
 */
function verifier(secret, presente, date = new Date()) {
    if (!secret || !/^[a-f0-9]{16}$/.test(String(presente || ''))) return null;
    const courante = fenetre(date);
    for (const f of [courante, courante - 1]) {
        const attendu = Buffer.from(code(secret, f));
        if (crypto.timingSafeEqual(attendu, Buffer.from(String(presente)))) return f;
    }
    return null;
}

const lienScan = (ecranId, codeCourant) =>
    `${getPublicAppUrl()}/pointer?e=${encodeURIComponent(ecranId)}&c=${codeCourant}`;

/**
 * Type du pointage à enregistrer, d'après le dernier du jour.
 * @returns {{type: 'CLOCK_IN'|'CLOCK_OUT'|null, doublon: boolean}}
 */
function typeSuivant(dernier, date = new Date()) {
    if (!dernier) return { type: 'CLOCK_IN', doublon: false };
    if (date - new Date(dernier.timestamp) < DELAI_ANTI_DOUBLON_MS) return { type: null, doublon: true };
    return { type: dernier.type === 'CLOCK_IN' ? 'CLOCK_OUT' : 'CLOCK_IN', doublon: false };
}

/**
 * Position du téléphone confrontée au site. Sans position, le scan de l'écran
 * vaut présence : c'est précisément ce qu'il prouve.
 */
function perimetre(site, position) {
    const lat = Number(position?.latitude);
    const lng = Number(position?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return { latitude: null, longitude: null, accuracy: null, distanceMeters: null, withinPerimeter: true };
    }
    const precision = Number.isFinite(Number(position.accuracy)) ? Number(position.accuracy) : null;
    const distance = distanceMetres({ latitude: lat, longitude: lng }, site);
    const marge = Math.min(precision || 0, 150);
    return {
        latitude: lat,
        longitude: lng,
        accuracy: precision,
        distanceMeters: distance === null ? null : Math.round(distance),
        withinPerimeter: distance === null ? true : distance - marge <= site.radiusMeters
    };
}

module.exports = {
    PERIODE_S, DELAI_ANTI_DOUBLON_MS, nouveauSecret, fenetre, code, secondesRestantes,
    verifier, lienScan, typeSuivant, perimetre
};
