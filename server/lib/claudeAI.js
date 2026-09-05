const Anthropic = require('@anthropic-ai/sdk');

/**
 * Couche d'accès à Claude pour toutes les fonctions IA du SIRH.
 *
 * L'application appelait auparavant Google Gemini via
 * `genAI.getGenerativeModel(...)` puis `model.generateContent(prompt)`, en
 * lisant `result.response.text()`. Ce module reproduit exactement cette
 * signature : les contrôleurs n'ont que leurs deux lignes d'initialisation à
 * changer, leurs prompts et leur traitement des réponses restent intacts.
 *
 * Variables d'environnement :
 *   ANTHROPIC_API_KEY   requise
 *   ANTHROPIC_MODEL     défaut claude-opus-5
 *   ANTHROPIC_EFFORT    défaut medium — voir la note sur l'effort plus bas
 */

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

// Extraction de données, rédaction de fiches de poste, réponses de chatbot :
// des tâches courantes où l'effort « medium » tient la qualité pour un coût
// nettement moindre. À relever via ANTHROPIC_EFFORT pour les usages sensibles.
const EFFORT = process.env.ANTHROPIC_EFFORT || 'medium';

const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '16000', 10);

let client = null;
const getClient = () => {
    if (!client) {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error(
                "ANTHROPIC_API_KEY absente : les fonctions IA sont indisponibles. " +
                "Définissez-la dans les variables d'environnement du serveur."
            );
        }
        // Une clé d'organisation non rattachée à un espace de travail est
        // refusée par l'API tant que l'espace n'est pas précisé. Renseigner
        // ANTHROPIC_WORKSPACE_ID évite d'avoir à régénérer une clé.
        const workspace = (process.env.ANTHROPIC_WORKSPACE_ID || '').trim();
        client = new Anthropic(
            workspace ? { defaultHeaders: { 'anthropic-workspace-id': workspace } } : {}
        );
    }
    return client;
};

/** Convertit une pièce jointe Gemini (inlineData) en bloc de contenu Claude. */
const toContentBlock = (part) => {
    if (typeof part === 'string') {
        return { type: 'text', text: part };
    }
    if (part && part.text) {
        return { type: 'text', text: part.text };
    }
    if (part && part.inlineData) {
        const { data, mimeType } = part.inlineData;
        // Le type de bloc doit correspondre au type MIME : un PDF est un
        // « document », une image reste une « image ».
        if (mimeType === 'application/pdf') {
            return {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data }
            };
        }
        return {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data }
        };
    }
    return null;
};

const JSON_INSTRUCTION =
    "Réponds exclusivement avec du JSON valide. N'ajoute aucun texte avant ou " +
    'après, et aucune balise de bloc de code.';

/**
 * Traduit une erreur de l'API en motif actionnable.
 *
 * Le code HTTP dit ce qu'il faut corriger, et par qui : une clé refusée relève
 * de l'exploitant, une surcharge passagère ne relève de personne. Les confondre
 * sous un même « erreur technique » laisse chercher au mauvais endroit.
 */
function motifLisible(erreur) {
    const statut = erreur?.status;
    if (statut === 401) return "Clé Anthropic refusée : ANTHROPIC_API_KEY est absente, expirée ou révoquée.";
    if (statut === 403) return "Clé Anthropic sans droit d'accès à ce modèle.";
    if (/anthropic-workspace-id|not scoped to a workspace/i.test(erreur?.message || '')) {
        return "Clé Anthropic non rattachée à un espace de travail. Renseigner " +
               "ANTHROPIC_WORKSPACE_ID sur le serveur, ou utiliser une clé créée " +
               "dans un espace de travail.";
    }
    if (statut === 400 && /model/i.test(erreur.message || '')) {
        return `Modèle « ${MODEL} » refusé par l'API. Vérifier la variable ANTHROPIC_MODEL.`;
    }
    if (statut === 429) return "Quota Anthropic atteint ou crédits épuisés.";
    if (statut >= 500) return "Service Anthropic momentanément indisponible.";
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed/i.test(erreur?.message || '')) {
        return "Service Anthropic injoignable depuis le serveur (réseau ou pare-feu).";
    }
    return `Appel à l'IA en échec : ${erreur?.message || 'motif inconnu'}`;
}

/**
 * Équivalent de `genAI.getGenerativeModel(...)`.
 * @param {object} options - `generationConfig.responseMimeType` reconnu.
 */
function getGenerativeModel(options = {}) {
    const wantsJson =
        options.generationConfig &&
        options.generationConfig.responseMimeType === 'application/json';

    // Consignes stables du module, séparées du contenu de la requête.
    // Deux bénéfices : le texte saisi par un utilisateur n'atteint jamais le
    // niveau des instructions, et ce préfixe devient éligible à la mise en
    // cache dès qu'il est assez volumineux.
    const systemInstruction = options.systemInstruction || null;

    return {
        /**
         * Accepte une chaîne, ou un tableau mêlant texte et pièces jointes,
         * comme le faisait l'API Gemini.
         * @returns {Promise<{response: {text: () => string}}>}
         */
        async generateContent(input) {
            const parts = Array.isArray(input) ? input : [input];
            const content = parts.map(toContentBlock).filter(Boolean);

            if (content.length === 0) {
                throw new Error('generateContent : contenu vide.');
            }

            const request = {
                model: MODEL,
                max_tokens: MAX_TOKENS,
                output_config: { effort: EFFORT },
                messages: [{ role: 'user', content }],
                // Reprise automatique sur un autre modèle si une requête est
                // déclinée par les classificateurs de sécurité, plutôt qu'un
                // échec sec au milieu d'un traitement RH.
                betas: ['server-side-fallback-2026-07-01'],
                fallbacks: 'default'
            };

            const consignes = [systemInstruction, wantsJson ? JSON_INSTRUCTION : null]
                .filter(Boolean)
                .join('\n\n');

            if (consignes) {
                request.system = [{
                    type: 'text',
                    text: consignes,
                    // Sans effet tant que le préfixe reste sous le seuil minimal
                    // de mise en cache ; utile dès qu'il s'étoffe.
                    cache_control: { type: 'ephemeral' }
                }];
            }

            let response;
            try {
                response = await getClient().beta.messages.create(request);
            } catch (erreur) {
                // Les appelants remplacent toute panne IA par « difficultés
                // techniques », si bien qu'une clé invalide et une coupure
                // réseau se présentent de la même façon — et que personne ne
                // sait quoi corriger. On journalise le détail et on remonte un
                // motif exploitable.
                console.error('[IA] Échec de l\'appel Anthropic :', erreur.status || '', erreur.message);
                throw new Error(motifLisible(erreur));
            }

            if (response.stop_reason === 'refusal') {
                const detail = response.stop_details || {};
                throw new Error(
                    "La requête a été déclinée par le modèle" +
                    (detail.category ? ` (${detail.category})` : '') + '.'
                );
            }

            const text = response.content
                .filter((block) => block.type === 'text')
                .map((block) => block.text)
                .join('\n');

            // Même forme de retour que l'API Gemini, pour que le code appelant
            // demeure inchangé.
            return { response: { text: () => text } };
        }
    };
}

/**
 * Vérifie que l'IA répond, avec la requête la plus courte possible.
 * Sert au diagnostic depuis les paramètres : distinguer « l'IA est en panne »
 * de « la fonction est cassée » demande autrement de lire les journaux du
 * serveur, ce dont l'exploitant ne dispose pas toujours.
 */
async function diagnostiquer() {
    if (!process.env.ANTHROPIC_API_KEY) {
        return { disponible: false, modele: MODEL, motif: "ANTHROPIC_API_KEY n'est pas définie sur le serveur." };
    }
    try {
        const modele = getGenerativeModel({});
        const r = await modele.generateContent('Réponds exactement : OK');
        return { disponible: true, modele: MODEL, reponse: (await r.response.text()).trim().slice(0, 40) };
    } catch (e) {
        return { disponible: false, modele: MODEL, motif: e.message };
    }
}

module.exports = { getGenerativeModel, diagnostiquer, MODEL };
