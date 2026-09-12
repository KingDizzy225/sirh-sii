const pieces = require('./pieces');

/**
 * Lecture d'une pièce photographiée.
 *
 * Le numéro et les dates d'un permis, d'une aptitude médicale ou d'une carte
 * professionnelle se retapent à la main, pièce après pièce. C'est précisément
 * la saisie qu'on repousse, et une échéance non renseignée ne se relance
 * jamais : la pièce dort au dossier en paraissant valide.
 *
 * L'extraction est **proposée, jamais enregistrée** : la RH voit les champs
 * pré-remplis, les corrige et valide. Ce module ne parle pas au modèle ; il
 * prépare la question et vérifie la réponse, ce qui le rend contrôlable sans
 * dépenser un appel.
 */

/** Nature des champs attendus, et ce qu'on en fait s'ils sont absents. */
const CHAMPS = ['type', 'reference', 'delivreeLe', 'expireLe'];

function invite() {
    const catalogue = pieces.TYPES
        .map((t) => `- ${t.code} : ${t.libelle}`)
        .join('\n');

    return `Tu examines la photographie ou le scan d'une pièce administrative d'un salarié, en Côte d'Ivoire.

Rends UNIQUEMENT un objet JSON, sans texte autour ni bloc de code :
{
  "type": "le code de la nature de la pièce, parmi la liste ci-dessous, ou null si aucune ne correspond",
  "reference": "le numéro de la pièce tel qu'il est imprimé, ou null",
  "delivreeLe": "la date de délivrance au format AAAA-MM-JJ, ou null",
  "expireLe": "la date d'expiration au format AAAA-MM-JJ, ou null",
  "confiance": "elevee, moyenne ou faible"
}

Natures possibles :
${catalogue}

Règles :
- Ne devine jamais une date absente de la pièce : mets null.
- Une date écrite JJ/MM/AAAA se rend AAAA-MM-JJ.
- Si l'image est illisible, mets tous les champs à null et "confiance": "faible".`;
}

/** Date ISO plausible, ou null. Rien n'est inventé : une date douteuse est écartée. */
function dateSure(valeur) {
    if (!valeur || typeof valeur !== 'string') return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur.trim());
    if (!m) return null;
    const d = new Date(`${valeur.trim()}T00:00:00Z`);
    if (isNaN(d.getTime())) return null;
    const annee = parseInt(m[1], 10);
    // Une pièce délivrée avant 1950 ou expirant après 2100 est une erreur de lecture.
    if (annee < 1950 || annee > 2100) return null;
    return valeur.trim();
}

/**
 * Nettoie la réponse du modèle.
 * @returns {{champs:object, avertissements:string[]}}
 */
function interpreter(reponse) {
    const avertissements = [];
    let brut = reponse;

    if (typeof brut === 'string') {
        const nettoye = brut.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
            brut = JSON.parse(nettoye);
        } catch {
            return {
                champs: Object.fromEntries(CHAMPS.map((c) => [c, null])),
                avertissements: ["La lecture n'a rien donné d'exploitable : saisir la pièce à la main."]
            };
        }
    }
    if (!brut || typeof brut !== 'object') {
        return {
            champs: Object.fromEntries(CHAMPS.map((c) => [c, null])),
            avertissements: ["La lecture n'a rien donné d'exploitable : saisir la pièce à la main."]
        };
    }

    const type = pieces.PAR_CODE[String(brut.type || '').toUpperCase()] ? String(brut.type).toUpperCase() : null;
    if (brut.type && !type) {
        avertissements.push(`Nature « ${brut.type} » inconnue du catalogue : à choisir à la main.`);
    }

    const delivreeLe = dateSure(brut.delivreeLe);
    const expireLe = dateSure(brut.expireLe);
    if (brut.delivreeLe && !delivreeLe) avertissements.push('Date de délivrance illisible : à saisir.');
    if (brut.expireLe && !expireLe) avertissements.push("Date d'expiration illisible : à saisir.");
    if (delivreeLe && expireLe && expireLe < delivreeLe) {
        avertissements.push("La date d'expiration lue précède la délivrance : les deux sont à vérifier.");
    }

    const reference = typeof brut.reference === 'string' && brut.reference.trim()
        ? brut.reference.trim().slice(0, 64)
        : null;

    const confiance = ['elevee', 'moyenne', 'faible'].includes(String(brut.confiance || '').toLowerCase())
        ? String(brut.confiance).toLowerCase()
        : 'moyenne';
    if (confiance === 'faible') {
        avertissements.push('Lecture peu sûre : vérifier chaque champ avant d’enregistrer.');
    }
    if (!expireLe && type) {
        avertissements.push(
            `Aucune date d'expiration lue : à défaut, l'échéance par défaut de la nature `
            + `« ${pieces.PAR_CODE[type].libelle} » sera appliquée.`
        );
    }

    return { champs: { type, reference, delivreeLe, expireLe }, avertissements, confiance };
}

module.exports = { CHAMPS, invite, dateSure, interpreter };
