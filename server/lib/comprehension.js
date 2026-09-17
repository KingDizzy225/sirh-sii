/**
 * Comprendre une demande formulée librement, à l'écrit ou à la voix.
 *
 * Personne ne retient `!conge 15/09/2026 20/09/2026`. Le salarié dit
 * « je voudrais poser du lundi 5 au vendredi 9 octobre » ; Claude en tire une
 * intention et des dates, et c'est la **commande existante** qui s'exécute,
 * avec tous ses contrôles : solde suffisant, dates cohérentes, demande laissée
 * en attente de validation.
 *
 * Claude ne décide donc rien. Il traduit. Et la réponse répète au salarié ce
 * qui a été compris, pour qu'une date mal entendue se corrige tout de suite.
 */

const INTENTIONS = ['SOLDE_CONGES', 'DERNIER_BULLETIN', 'DEMANDE_CONGE', 'AUTRE'];
const FORMAT_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function consignes(reference = new Date()) {
    const jour = reference.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return [
        "Tu reçois un message d'un salarié ivoirien adressé au service RH par WhatsApp,",
        'parfois transcrit depuis un message vocal, donc avec des fautes possibles.',
        `Nous sommes le ${jour}.`,
        'Classe la demande dans une seule intention :',
        '- SOLDE_CONGES : il veut connaître ses jours de congé restants ;',
        '- DERNIER_BULLETIN : il demande son bulletin ou sa fiche de paie ;',
        '- DEMANDE_CONGE : il veut poser un congé ou s\'absenter à des dates données ;',
        '- AUTRE : tout le reste, y compris les salutations seules.',
        'Pour DEMANDE_CONGE, convertis les dates au format JJ/MM/AAAA en résolvant les',
        'expressions relatives (« lundi prochain », « du 5 au 9 ») par rapport à la date du jour.',
        "N'invente jamais une date absente du message : laisse-la à null.",
        'Réponds uniquement en JSON : {"intention": "...", "debut": "JJ/MM/AAAA" | null, "fin": "JJ/MM/AAAA" | null}.'
    ].join('\n');
}

const dateValide = (texte) => {
    const m = FORMAT_DATE.exec(String(texte || ''));
    if (!m) return false;
    const d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
    return d.getUTCDate() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1;
};

/**
 * Traduit une interprétation en commande du guichet. Fonction pure.
 * @returns {{commande: string|null, message: string|null}}
 */
function versCommande(interpretation) {
    const intention = interpretation?.intention;
    if (!INTENTIONS.includes(intention) || intention === 'AUTRE') return { commande: null, message: null };
    if (intention === 'SOLDE_CONGES') return { commande: '!solde', message: null };
    if (intention === 'DERNIER_BULLETIN') return { commande: '!paie', message: null };

    const { debut, fin } = interpretation;
    if (!dateValide(debut) || !dateValide(fin)) {
        return {
            commande: null,
            message: 'Pour poser un congé, précisez la date de début et la date de fin. ' +
                     'Exemple : « du lundi 5 au vendredi 9 octobre ».'
        };
    }
    return { commande: `!conge ${debut} ${fin}`, message: null };
}

/** Interprète un texte libre. Lève une erreur si l'IA est indisponible. */
async function interpreter(texte, reference = new Date()) {
    const { getGenerativeModel } = require('./claudeAI');
    const modele = getGenerativeModel({
        systemInstruction: consignes(reference),
        generationConfig: { responseMimeType: 'application/json' }
    });
    const resultat = await modele.generateContent(String(texte).slice(0, 1000));
    const brut = resultat.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(brut);
}

module.exports = { INTENTIONS, consignes, versCommande, interpreter };
