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
        client = new Anthropic();
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

            const response = await getClient().beta.messages.create(request);

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

module.exports = { getGenerativeModel, MODEL };
