const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Accès refusé. Rôle manquant.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès interdit. Privilèges insuffisants.' });
        }

        next();
    };
};

module.exports = requireRole;
