const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Authentification par Google Workspace.
 *
 * Le navigateur obtient un jeton d'identité auprès de Google, l'application le
 * vérifie ici, puis délivre sa propre session. Rien de ce que le navigateur
 * affirme n'est cru : c'est la signature de Google qui fait foi, contrôlée
 * contre ses clés publiques.
 *
 * Cinq contrôles, et aucun n'est superflu :
 *
 *  - la signature, contre les clés publiques de Google ;
 *  - l'émetteur, sans quoi un jeton signé ailleurs passerait ;
 *  - le destinataire, sans quoi un jeton délivré à une autre application —
 *    n'importe laquelle, sur le même compte Google — ouvrirait une session ici ;
 *  - l'expiration ;
 *  - le domaine de l'organisation, sans quoi n'importe quel compte Gmail
 *    ouvrirait une session dans le SIRH de l'entreprise.
 *
 * Ce dernier point est le plus important, et le plus facile à oublier : « se
 * connecter avec Google » ne veut pas dire « appartenir à l'entreprise ».
 */

const EMETTEURS = ['accounts.google.com', 'https://accounts.google.com'];
const URL_CLES = 'https://www.googleapis.com/oauth2/v3/certs';

const clientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();
const domaine = () => (process.env.GOOGLE_WORKSPACE_DOMAIN || '').trim().toLowerCase();

/** L'authentification Google est-elle configurée ? */
const configure = () => Boolean(clientId());

let cache = { cles: null, expire: 0 };

/**
 * Clés publiques de Google, mises en cache.
 *
 * Google fait tourner ses clés : les figer condamnerait l'authentification à
 * cesser un jour sans explication. La durée de vie est celle que Google annonce.
 */
async function clesPubliques() {
    if (cache.cles && Date.now() < cache.expire) return cache.cles;

    const reponse = await fetch(URL_CLES);
    if (!reponse.ok) {
        throw new Error(`Clés publiques Google indisponibles (HTTP ${reponse.status}).`);
    }
    const { keys } = await reponse.json();

    const controle = reponse.headers.get('cache-control') || '';
    const age = /max-age=(\d+)/.exec(controle);
    const duree = age ? parseInt(age[1], 10) * 1000 : 3600 * 1000;

    cache = { cles: keys, expire: Date.now() + duree };
    return keys;
}

/**
 * Vérifie un jeton d'identité Google.
 * @returns {Promise<{email:string, nom:string, domaine:string|null, photo:string|null}>}
 * @throws {Error} avec un `code` exploitable par l'appelant.
 */
async function verifierJeton(idToken) {
    if (!configure()) {
        const e = new Error("L'authentification Google n'est pas configurée sur ce serveur.");
        e.code = 'NON_CONFIGURE';
        throw e;
    }
    if (!idToken || typeof idToken !== 'string') {
        const e = new Error('Jeton absent.');
        e.code = 'JETON';
        throw e;
    }

    const entete = jwt.decode(idToken, { complete: true });
    if (!entete || !entete.header || !entete.header.kid) {
        const e = new Error('Jeton illisible.');
        e.code = 'JETON';
        throw e;
    }

    const keys = await clesPubliques();
    const jwk = keys.find((k) => k.kid === entete.header.kid);
    if (!jwk) {
        // Clé inconnue : soit le jeton vient d'ailleurs, soit les clés ont
        // tourné depuis la mise en cache. On réessaie une fois, sans cache.
        cache = { cles: null, expire: 0 };
        const fraiches = await clesPubliques();
        const seconde = fraiches.find((k) => k.kid === entete.header.kid);
        if (!seconde) {
            const e = new Error("Jeton signé par une clé que Google ne reconnaît pas.");
            e.code = 'SIGNATURE';
            throw e;
        }
        return verifierAvec(idToken, seconde);
    }

    return verifierAvec(idToken, jwk);
}

function verifierAvec(idToken, jwk) {
    const clePublique = crypto.createPublicKey({ key: jwk, format: 'jwk' });

    let charge;
    try {
        charge = jwt.verify(idToken, clePublique, {
            algorithms: ['RS256'],
            audience: clientId(),
            issuer: EMETTEURS
        });
    } catch (erreur) {
        const e = new Error(
            erreur.name === 'TokenExpiredError'
                ? 'Jeton expiré : recommencez la connexion.'
                : `Jeton refusé : ${erreur.message}`
        );
        e.code = 'SIGNATURE';
        throw e;
    }

    if (!charge.email) {
        const e = new Error('Le jeton ne porte aucune adresse.');
        e.code = 'JETON';
        throw e;
    }
    if (charge.email_verified === false) {
        const e = new Error("Adresse non vérifiée par Google.");
        e.code = 'EMAIL';
        throw e;
    }

    /**
     * Domaine de l'organisation.
     *
     * Sans ce contrôle, n'importe quel compte Google — un compte Gmail
     * personnel, créé en trente secondes — ouvrirait une session dans le SIRH.
     * La revendication `hd` n'est présente que pour les comptes Workspace.
     */
    const attendu = domaine();
    if (attendu) {
        const obtenu = String(charge.hd || '').toLowerCase();
        if (obtenu !== attendu) {
            const e = new Error(
                obtenu
                    ? `Ce compte appartient au domaine « ${obtenu} », non à « ${attendu} ».`
                    : "Ce compte Google n'appartient pas à l'organisation."
            );
            e.code = 'DOMAINE';
            throw e;
        }
    }

    return {
        email: String(charge.email).toLowerCase(),
        nom: charge.name || charge.email,
        domaine: charge.hd || null,
        photo: charge.picture || null
    };
}

/** État de la configuration, pour l'écran de connexion. */
function etat() {
    return {
        actif: configure(),
        clientId: clientId() || null,
        domaine: domaine() || null,
        // Un domaine non déclaré ouvre la porte à tout compte Google : le dire
        // plutôt que de laisser croire à une restriction qui n'existe pas.
        domaineRestreint: Boolean(domaine())
    };
}

module.exports = {
    configure, verifierJeton, etat, clesPubliques,
    // Exporté pour les contrôles : la vérification des revendications est la
    // partie sensible, et elle doit pouvoir être éprouvée sans appeler Google.
    verifierAvec
};
