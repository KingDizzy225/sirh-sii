/**
 * Contrôle d'accès par rôle.
 *
 * Les rôles circulent sous deux écritures dans l'application : la base et les
 * jetons utilisent ADMIN / HR / MANAGER / EMPLOYEE, tandis que l'interface et
 * la table Employee utilisent Administrator / HR / Manager / Employee.
 * Tout est normalisé ici pour qu'un contrôle ne dépende jamais de l'écriture.
 */

const ROLE_ALIASES = {
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

const normalizeRole = (role) => {
    if (!role) return null;
    return ROLE_ALIASES[String(role).trim().toUpperCase()] || String(role).trim().toUpperCase();
};

/** true si le rôle de la requête fait partie des rôles autorisés. */
const hasRole = (user, allowed) => {
    const role = normalizeRole(user && user.role);
    if (!role) return false;
    return allowed.map(normalizeRole).includes(role);
};

const requireRole = (...rolesArg) => {
    const roles = Array.isArray(rolesArg[0]) ? rolesArg[0] : rolesArg;

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Accès refusé. Rôle manquant.' });
        }

        if (!hasRole(req.user, roles)) {
            return res.status(403).json({ error: 'Accès interdit. Privilèges insuffisants.' });
        }

        next();
    };
};

module.exports = requireRole;
module.exports.requireRole = requireRole;
module.exports.normalizeRole = normalizeRole;
module.exports.hasRole = hasRole;
