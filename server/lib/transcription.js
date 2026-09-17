/**
 * Transcription des messages vocaux.
 *
 * **Claude n'entend pas.** L'API Anthropic lit du texte, des images et des PDF,
 * pas du son. La note vocale passe donc d'abord par un service de
 * transcription, et c'est le texte obtenu que Claude interprète.
 *
 * Le service n'est pas imposé : l'adaptateur parle le format
 * `POST /audio/transcriptions` (multipart, champ `file`, réponse `{ text }`),
 * que proposent plusieurs fournisseurs hébergés comme des serveurs Whisper
 * installés chez soi. Trois variables suffisent :
 *
 *   TRANSCRIPTION_URL      adresse complète du point d'entrée
 *   TRANSCRIPTION_API_KEY  clé du service
 *   TRANSCRIPTION_MODEL    nom du modèle chez ce fournisseur (défaut whisper-1)
 *
 * Tant qu'elles manquent, le guichet dit au salarié que le vocal n'est pas
 * activé — il ne se tait pas.
 *
 * Donnée personnelle : la voix du salarié quitte l'entreprise vers ce service.
 * Le choix du fournisseur, et de son lieu d'hébergement, relève de la
 * déclaration à l'ARTCI.
 */

const TAILLE_MAX_OCTETS = parseInt(process.env.VOCAL_TAILLE_MAX_OCTETS, 10) || 5 * 1024 * 1024;

const config = () => ({
    url: (process.env.TRANSCRIPTION_URL || '').trim(),
    cle: (process.env.TRANSCRIPTION_API_KEY || '').trim(),
    modele: (process.env.TRANSCRIPTION_MODEL || 'whisper-1').trim(),
    langue: (process.env.TRANSCRIPTION_LANGUE || 'fr').trim()
});

function configuree() {
    const { url, cle } = config();
    return Boolean(url && cle);
}

function etatConfiguration() {
    const { url, cle, modele } = config();
    const manquantes = [];
    if (!url) manquantes.push('TRANSCRIPTION_URL');
    if (!cle) manquantes.push('TRANSCRIPTION_API_KEY');
    return { active: manquantes.length === 0, modele, variablesManquantes: manquantes };
}

/**
 * @param {Buffer} contenu
 * @param {string} typeMime - ex. audio/ogg; codecs=opus
 * @returns {Promise<string>} le texte transcrit
 */
async function transcrire(contenu, typeMime = 'audio/ogg') {
    const { url, cle, modele, langue } = config();
    if (!url || !cle) throw new Error('Transcription non configurée.');
    if (!contenu?.length) throw new Error('Message vocal vide.');
    if (contenu.length > TAILLE_MAX_OCTETS) throw new Error('Message vocal trop long.');

    const formulaire = new FormData();
    const type = String(typeMime).split(';')[0].trim() || 'audio/ogg';
    const extension = type.includes('mpeg') ? 'mp3' : type.includes('mp4') ? 'm4a' : 'ogg';
    formulaire.append('file', new Blob([contenu], { type }), `vocal.${extension}`);
    formulaire.append('model', modele);
    formulaire.append('language', langue);
    formulaire.append('response_format', 'json');

    const reponse = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cle}` },
        body: formulaire,
        signal: AbortSignal.timeout(60000)
    });
    if (!reponse.ok) {
        const detail = await reponse.text().catch(() => '');
        console.error('[VOCAL] Transcription refusée :', reponse.status, detail.slice(0, 300));
        throw new Error(`Transcription refusée (HTTP ${reponse.status}).`);
    }
    const corps = await reponse.json();
    const texte = String(corps?.text || '').trim();
    if (!texte) throw new Error('Transcription vide.');
    return texte;
}

module.exports = { TAILLE_MAX_OCTETS, configuree, etatConfiguration, transcrire };
