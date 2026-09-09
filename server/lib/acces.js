const { hasRole } = require('../middleware/roleMiddleware');

/**
 * Qui peut ouvrir une session dans l'application.
 *
 * L'application est un outil de gestion destiné aux ressources humaines. Les
 * salariés n'y ouvrent plus de session : ils passent par le portail public,
 * qui n'affiche aucune donnée personnelle et se contente de recevoir leurs
 * demandes.
 *
 * Cette décision réduit surtout la surface exposée. Un compte salarié qui
 * dormait avec un mot de passe par défaut — l'application en créait un à chaque
 * recrutement — était une porte ouverte sur des écrans qui montrent les
 * rémunérations de tout le monde.
 *
 * **La liste est réglable, et c'est délibéré.** Le circuit de validation des
 * congés comporte une étape « responsable » : retirer MANAGER la reporte
 * entièrement sur la RH. Si cela ne convient pas, ajouter MANAGER à
 * `ROLES_AUTORISES_CONNEXION` suffit — aucune reprise de code.
 */
const ROLES_AUTORISES = (process.env.ROLES_AUTORISES_CONNEXION || 'ADMIN,HR')
    .split(',')
    .map((r) => r.trim().toUpperCase())
    .filter(Boolean);

/** Vrai si ce rôle peut ouvrir une session. */
function peutSeConnecter(user) {
    return hasRole(user, ROLES_AUTORISES);
}

/**
 * Message renvoyé à qui n'a pas le droit d'ouvrir une session.
 *
 * Il ne dit jamais « mot de passe incorrect » : le compte existe et le mot de
 * passe était bon. Laisser croire à une erreur de saisie ferait recommencer
 * l'intéressé indéfiniment.
 */
const MESSAGE_REFUS = "Cette application est réservée au service des ressources humaines. "
    + 'Pour une demande de congé, une avance ou une question, utilisez le portail '
    + "des salariés — il ne demande aucun mot de passe.";

module.exports = { ROLES_AUTORISES, peutSeConnecter, MESSAGE_REFUS };
