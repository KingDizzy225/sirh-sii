const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/jwt');

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
        /**
         * 401, et non 403 : l'absence de jeton est un défaut d'authentification
         * — « je ne sais pas qui vous êtes » — et non un refus de droits.
         *
         * La distinction n'est pas théorique. Le client déconnecte sur 401 et
         * seulement sur 401 : confondre les deux faisait qu'un simple refus de
         * droits — un manager ouvrant le bulletin d'un subordonné, un salarié
         * touchant un écran réservé à la RH — effaçait la session et renvoyait
         * l'utilisateur à l'écran de connexion.
         */
        return res.status(401).json({ error: 'Token non fourni ou manquant' });
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
