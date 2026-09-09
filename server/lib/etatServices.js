const prisma = require('../prismaClient');

/**
 * État des services extérieurs, consultable depuis l'application.
 *
 * Le diagnostic de l'IA existait déjà, derrière `GET /api/jobs/ia` — mais
 * cette adresse exige un jeton, que le navigateur n'envoie pas : la coller
 * dans la barre d'adresse répond « Token non fourni ». Le diagnostic était donc
 * inatteignable pour qui n'ouvre pas les outils de développement.
 *
 * `npm run preflight` reste l'audit de fond, lancé au shell avant une bascule.
 * Ce module répond à une autre question, posée n'importe quand : **qu'est-ce
 * qui est raccordé, et qu'est-ce qui ne l'est pas ?**
 *
 * Deux règles :
 *
 *  - **Aucune valeur n'est rendue.** Ni clé, ni mot de passe, ni identifiant
 *    d'espace de travail : seulement « défini » ou « absent ». Un écran de
 *    diagnostic qui recopie les secrets est un écran de fuite.
 *  - **Chaque manque dit sa conséquence.** « SMTP non configuré » n'apprend
 *    rien ; « aucun salarié ne recevra de notification » dit ce qui ne marche
 *    pas, et pour qui.
 */

const defini = (v) => Boolean(v && String(v).trim());

const ligne = (cle, libelle, niveau, detail, consequence = null) =>
    ({ cle, libelle, niveau, detail, consequence });

/**
 * @param {object} options
 * @param {boolean} options.testerIA  interroge réellement l'IA. Coûte un appel :
 *   on ne le fait qu'à la demande, jamais à chaque ouverture de l'écran.
 */
async function etat({ testerIA = false } = {}) {
    const services = [];

    // --- Intelligence artificielle ---
    const cleIA = defini(process.env.ANTHROPIC_API_KEY);
    const espaceIA = defini(process.env.ANTHROPIC_WORKSPACE_ID);

    if (!cleIA) {
        services.push(ligne('IA', 'Assistance par IA', 'absent',
            "ANTHROPIC_API_KEY n'est pas définie.",
            'Onze fonctions répondent en erreur : assistant, tri de candidatures, '
            + 'notes de frais, fiches de poste, organigramme, enquêtes.'));
    } else if (testerIA) {
        // L'essai réel est le seul verdict qui vaille : une clé peut être
        // définie et refusée.
        const { diagnostiquer } = require('./claudeAI');
        const verdict = await diagnostiquer();
        services.push(verdict.disponible
            ? ligne('IA', 'Assistance par IA', 'ok',
                `Répond (${verdict.modele}).`, null)
            : ligne('IA', 'Assistance par IA', 'absent',
                verdict.motif,
                'Onze fonctions répondent en erreur.'));
    } else {
        services.push(ligne('IA', 'Assistance par IA', espaceIA ? 'ok' : 'avertissement',
            espaceIA
                ? "Clé et espace de travail définis. Lancer l'essai pour confirmer qu'elle répond."
                : "Clé définie, espace de travail absent.",
            espaceIA ? null
                : "Une clé d'organisation non rattachée à un espace est refusée par l'API. "
                  + 'Définir ANTHROPIC_WORKSPACE_ID évite de régénérer une clé.'));
    }

    // --- Courriel ---
    const smtp = defini(process.env.SMTP_HOST) && defini(process.env.SMTP_USER);
    services.push(smtp
        ? ligne('SMTP', 'Envoi de courriels', 'ok', 'Serveur configuré.', null)
        : ligne('SMTP', 'Envoi de courriels', 'absent',
            'Aucun serveur configuré.',
            "Les envois aboutissent dans une boîte de test : ils « réussissent » et personne "
            + "ne les reçoit. Les salariés n'ouvrant plus de session, c'est leur seul canal de "
            + 'retour — accusés de réception, congés validés, refus.'));

    // --- Adresse publique ---
    const adresse = process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL;
    services.push(defini(adresse)
        ? ligne('ADRESSE', 'Adresse publique', 'ok', 'Définie.', null)
        : ligne('ADRESSE', 'Adresse publique', 'absent',
            "Ni FRONTEND_URL ni PUBLIC_APP_URL ne sont définies.",
            'Les liens produits par le serveur — remise de documents, signature, vérification '
            + "par QR — pointent vers une adresse par défaut qui n'est peut-être pas la vôtre."));

    // --- Clé de scellement ---
    try {
        const enBase = await prisma.signingKey.count({ where: { active: true } });
        const parEnv = defini(process.env.SIGNATURE_SEAL_PRIVATE_KEY);
        services.push(parEnv || enBase > 0
            ? ligne('SCEAU', 'Scellement des documents', 'ok',
                parEnv ? "Clé fournie par l'environnement." : 'Clé conservée en base.',
                parEnv ? null
                    : "La clé vit en base : elle ne survivrait pas à une recréation de la base. "
                      + 'La porter dans SIGNATURE_SEAL_PRIVATE_KEY est plus sûr.')
            : ligne('SCEAU', 'Scellement des documents', 'avertissement',
                'Aucune clé encore produite.',
                'Une clé sera engendrée au premier document scellé et conservée en base.'));
    } catch (e) {
        services.push(ligne('SCEAU', 'Scellement des documents', 'avertissement',
            `Contrôle impossible : ${e.message}`, null));
    }

    // --- Signataire habilité ---
    try {
        const signataires = await prisma.signataire.count({ where: { actif: true } });
        services.push(signataires > 0
            ? ligne('SIGNATAIRE', 'Signataire habilité', 'ok',
                `${signataires} signataire(s) enregistré(s).`, null)
            : ligne('SIGNATAIRE', 'Signataire habilité', 'avertissement',
                'Aucun signataire enregistré.',
                'Les documents émis porteront la mention « émis sans signataire désigné ».'));
    } catch (e) {
        services.push(ligne('SIGNATAIRE', 'Signataire habilité', 'avertissement',
            `Contrôle impossible : ${e.message}`, null));
    }

    // --- Connexion Google Workspace ---
    const clientGoogle = defini(process.env.GOOGLE_CLIENT_ID);
    const domaineGoogle = defini(process.env.GOOGLE_WORKSPACE_DOMAIN);
    if (!clientGoogle) {
        services.push(ligne('SSO', 'Connexion Google Workspace', 'avertissement',
            'Non configurée.',
            'La connexion par mot de passe reste seule disponible.'));
    } else {
        services.push(domaineGoogle
            ? ligne('SSO', 'Connexion Google Workspace', 'ok', 'Configurée et restreinte à un domaine.', null)
            : ligne('SSO', 'Connexion Google Workspace', 'absent',
                'Domaine autorisé non défini.',
                "Sans GOOGLE_WORKSPACE_DOMAIN, n'importe quel compte Google rattaché à un "
                + 'dossier salarié ouvrirait une session.'));
    }

    // --- Guichet WhatsApp ---
    try {
        const { etatConfiguration } = require('./whatsapp');
        const wa = etatConfiguration();
        if (wa.receptionActive && wa.envoiActif) {
            services.push(ligne('WHATSAPP', 'Guichet WhatsApp', 'ok', 'Réception et envoi configurés.', null));
        } else if (!wa.receptionActive && !wa.envoiActif) {
            services.push(ligne('WHATSAPP', 'Guichet WhatsApp', 'avertissement',
                'Non raccordé.', 'Aucun salarié ne peut écrire au guichet.'));
        } else {
            // Le pire des cas : il reçoit sans pouvoir répondre, ou l'inverse.
            // Personne ne s'en aperçoit avant qu'un salarié attende.
            services.push(ligne('WHATSAPP', 'Guichet WhatsApp', 'absent',
                `Raccordement incomplet (${(wa.variablesManquantes || []).join(', ')}).`,
                wa.receptionActive
                    ? 'Les messages arrivent, aucune réponse ne peut partir.'
                    : 'Les réponses peuvent partir, aucun message ne parvient.'));
        }
    } catch (e) {
        services.push(ligne('WHATSAPP', 'Guichet WhatsApp', 'avertissement',
            `Contrôle impossible : ${e.message}`, null));
    }

    return {
        services,
        synthese: {
            absents: services.filter((s) => s.niveau === 'absent').length,
            avertissements: services.filter((s) => s.niveau === 'avertissement').length,
            ok: services.filter((s) => s.niveau === 'ok').length
        },
        // L'essai de l'IA consomme un appel : on dit s'il a eu lieu, pour que
        // « configurée » ne se lise pas comme « vérifiée ».
        iaTestee: testerIA
    };
}

module.exports = { etat };
