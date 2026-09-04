/**
 * Secret JWT — source unique de vérité.
 *
 * En production, l'absence de JWT_SECRET arrête le démarrage : un secret par
 * défaut versionné dans un dépôt permettrait de forger n'importe quel jeton.
 * En développement, un secret local est généré à chaque démarrage (les
 * sessions ne survivent donc pas à un redémarrage, ce qui est voulu).
 */

const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';
let secret = process.env.JWT_SECRET;

if (!secret || secret.trim().length === 0) {
    if (isProduction) {
        console.error(
            "[FATAL] JWT_SECRET absent. Définissez-le dans les variables d'environnement " +
            "avant de démarrer le serveur en production."
        );
        process.exit(1);
    }
    secret = crypto.randomBytes(48).toString('hex');
    console.warn(
        "[AVERTISSEMENT] JWT_SECRET absent : un secret temporaire a été généré pour " +
        "ce démarrage. Les sessions seront invalidées au prochain redémarrage."
    );
} else if (isProduction && secret.length < 32) {
    console.error("[FATAL] JWT_SECRET trop court (32 caractères minimum en production).");
    process.exit(1);
}

module.exports = { JWT_SECRET: secret };
