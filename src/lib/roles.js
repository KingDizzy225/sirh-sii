/**
 * Rôles : une seule table de correspondance.
 *
 * Les rôles circulent sous deux écritures — `ADMIN` / `HR` / `MANAGER` en base
 * et dans les jetons, `Administrator` / `HR` / `Manager` dans les routes de
 * l'interface. Chaque côté tenait sa propre table, et elles ont divergé : le
 * serveur connaissait `SOCIAL_WORKER`, l'interface non. Un assistant social
 * aurait été renvoyé vers la page d'accès refusé sur ses propres écrans.
 *
 * Cette table est celle de l'interface. Elle reprend les mêmes clés que
 * `server/middleware/roleMiddleware.js`, et les deux doivent rester alignées —
 * un contrôle de la suite d'essais le vérifie.
 */

/** Écriture canonique d'un rôle, quelle que soit sa forme d'origine. */
const CANONIQUES = {
    ADMIN: 'ADMIN',
    ADMINISTRATOR: 'ADMIN',
    HR: 'HR',
    'RESSOURCES HUMAINES': 'HR',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
    EMPLOYE: 'EMPLOYEE',
    'SOCIAL WORKER': 'SOCIAL_WORKER',
    SOCIAL_WORKER: 'SOCIAL_WORKER'
};

export function canoniser(role) {
    if (!role) return null;
    const brut = String(role).trim().toUpperCase();
    return CANONIQUES[brut] || brut;
}

/**
 * Le rôle fait-il partie des rôles autorisés ?
 *
 * La comparaison passe par l'écriture canonique des deux côtés : une route qui
 * déclare `Administrator` accepte donc un compte dont le jeton porte `ADMIN`,
 * et l'inverse.
 */
export function aLeRole(role, autorises = []) {
    const mien = canoniser(role);
    if (!mien) return false;
    if (!Array.isArray(autorises) || autorises.length === 0) return true;
    return autorises.map(canoniser).includes(mien);
}

/** Rôles ayant la main sur les données RH de l'entreprise. */
export const ROLES_RH = ['ADMIN', 'HR'];

export const estRH = (role) => ROLES_RH.includes(canoniser(role));
