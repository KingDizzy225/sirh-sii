const requireRole = (...rolesArg) => {
    const roles = Array.isArray(rolesArg[0]) ? rolesArg[0] : rolesArg;

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Accès refusé. Rôle manquant.' });
        }

        // Check if the user's role is in the allowed roles array
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès interdit. Privilèges insuffisants.' });
        }

        next();
    };
};

module.exports = requireRole;
