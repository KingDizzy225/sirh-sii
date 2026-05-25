const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sirh-key-2026';

const verifyToken = (req, res, next) => {
    // Le token est généralement envoyé dans le header Authorization: Bearer <token>
    // Ou via la query string pour les téléchargements de fichiers
    let token = req.query.token;

    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            token = authHeader.split(' ')[1]; // Extract token after "Bearer"
        }
    }

    if (!token) {
        return res.status(403).json({ error: 'Token non fourni ou manquant' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // On attache les informations de l'utilisateur à la requête
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    return next();
};

module.exports = verifyToken;
