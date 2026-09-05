/**
 * Rapprochement entre les compétences déclarées d'un salarié et celles
 * attendues par un poste du référentiel métiers.
 *
 * Les deux côtés sont du texte libre saisi indépendamment : « Négociation
 * fournisseurs » côté référentiel peut correspondre à « Négociation
 * fournisseur » ou « négociation avec les fournisseurs » côté salarié. Une
 * comparaison stricte ne rapprocherait presque rien, ce qui rendrait l'écart
 * de compétences inexploitable. On accepte donc trois degrés de similitude,
 * du plus sûr au plus permissif, et on s'arrête au premier qui correspond.
 */

// Mots trop courants pour porter du sens dans un intitulé de compétence
const MOTS_VIDES = new Set([
    'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'aux', 'au', 'un', 'une',
    'pour', 'avec', 'sur', 'par', 'dans', 'projet', 'gestion'
]);

/** Minuscules, sans accents ni ponctuation, espaces normalisés. */
const normaliser = (texte) =>
    String(texte || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Racine approximative d'un mot : les six premiers caractères.
 * Rapproche les formes d'une même famille — « automatisés » et
 * « automatisation » partagent « automa » — sans dictionnaire.
 */
const racine = (mot) => mot.replace(/s$/, '').slice(0, 6);

/** Racines des mots porteurs de sens d'un intitulé. */
const motsCles = (texte) =>
    normaliser(texte)
        .split(' ')
        .filter((mot) => mot.length > 3 && !MOTS_VIDES.has(mot))
        .map(racine);

/**
 * Degré de correspondance entre deux intitulés.
 * @returns {'exacte'|'proche'|'partielle'|null}
 */
function comparer(attendue, declaree) {
    const a = normaliser(attendue);
    const d = normaliser(declaree);
    if (!a || !d) return null;

    if (a === d) return 'exacte';
    if (a.includes(d) || d.includes(a)) return 'proche';

    const motsA = motsCles(attendue);
    const motsD = new Set(motsCles(declaree));
    if (motsA.length === 0) return null;

    const communs = motsA.filter((mot) => motsD.has(mot)).length;
    // Seuil strictement supérieur à la moitié : un seul mot commun sur deux
    // ne suffit pas. « Architecture applicative » et « Architecture Cloud »
    // partagent leur premier mot sans désigner la même compétence, et créditer
    // à tort un salarié d'une compétence fausserait une décision RH.
    return communs / motsA.length > 0.5 ? 'partielle' : null;
}

/**
 * Écart de compétences entre un poste visé et le profil d'un salarié.
 *
 * @param {string[]} attendues        compétences du poste (référentiel)
 * @param {Array<{skillName: string, proficiencyLevel: string}>} declarees
 * @returns {{acquises: Array, manquantes: string[], tauxCouverture: number}}
 */
function ecartCompetences(attendues, declarees) {
    const requises = Array.isArray(attendues) ? attendues : [];
    const possedees = Array.isArray(declarees) ? declarees : [];

    const acquises = [];
    const manquantes = [];

    for (const attendue of requises) {
        let meilleure = null;
        for (const skill of possedees) {
            const degre = comparer(attendue, skill.skillName);
            if (!degre) continue;
            // Une correspondance exacte l'emporte sur une simple proximité
            const rang = { exacte: 3, proche: 2, partielle: 1 }[degre];
            if (!meilleure || rang > meilleure.rang) {
                meilleure = { rang, degre, skill };
            }
            if (degre === 'exacte') break;
        }

        if (meilleure) {
            acquises.push({
                attendue,
                declaree: meilleure.skill.skillName,
                niveau: meilleure.skill.proficiencyLevel,
                correspondance: meilleure.degre
            });
        } else {
            manquantes.push(attendue);
        }
    }

    const tauxCouverture = requises.length
        ? Math.round((acquises.length / requises.length) * 100)
        : null;

    return { acquises, manquantes, tauxCouverture };
}

module.exports = { ecartCompetences, comparer, normaliser, motsCles };
