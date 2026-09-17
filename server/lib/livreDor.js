const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Livre d'or : les mots des collègues, remis à la personne le jour venu.
 *
 * Deux liens, comme pour le badge : celui qu'on fait circuler pour écrire, et
 * celui qu'on remet à la personne pour lire. Qui écrit ne lit pas les autres
 * mots — la surprise tient à ça, et personne ne recopie le voisin.
 */

const OCCASIONS = {
    RETRAITE: 'Départ à la retraite',
    NAISSANCE: 'Naissance',
    MARIAGE: 'Mariage',
    ANCIENNETE: 'Anniversaire dans l\'entreprise',
    DEPART: 'Départ',
    AUTRE: 'Autre occasion'
};

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 600;
const AUTEUR_MAX = 60;
const MOTS_MAX = parseInt(process.env.LIVRE_DOR_MOTS_MAX, 10) || 500;
/** Envois admis depuis une même adresse, pour un même livre. */
const ENVOIS_PAR_ADRESSE = parseInt(process.env.LIVRE_DOR_ENVOIS_PAR_ADRESSE, 10) || 5;

const nouveauJeton = () => crypto.randomBytes(24).toString('hex');
const lienContribution = (jeton) => `${getPublicAppUrl()}/livre-dor/${jeton}`;
const lienRemise = (jeton) => `${getPublicAppUrl()}/livre-dor/remise/${jeton}`;

/** Empreinte salée de l'adresse IP : on compte les envois sans garder l'adresse. */
function empreinte(ip, livreId) {
    if (!ip) return null;
    return crypto.createHash('sha256').update(`${livreId}:${ip}`).digest('hex').slice(0, 32);
}

const debutJour = (d) => {
    const x = new Date(d);
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};

/** On écrit jusqu'à la fin du jour de remise, sauf clôture anticipée. */
function ouvertAuxMots(livre, reference = new Date()) {
    if (livre.clotureLe) return false;
    const fin = debutJour(livre.dateRemise);
    fin.setUTCDate(fin.getUTCDate() + 1);
    return reference < fin;
}

/** La personne lit à partir du jour de remise. */
const lisible = (livre, reference = new Date()) => debutJour(livre.dateRemise) <= reference;

/** @returns {{auteur, message}|{erreur}} */
function nettoyer({ auteur, message }) {
    const a = String(auteur || '').replace(/\s+/g, ' ').trim();
    const m = String(message || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (a.length < 2 || a.length > AUTEUR_MAX) return { erreur: 'Indiquez votre prénom (ou prénom et nom).' };
    if (m.length < MESSAGE_MIN) return { erreur: 'Votre message est vide.' };
    if (m.length > MESSAGE_MAX) return { erreur: `Votre message dépasse ${MESSAGE_MAX} caractères.` };
    return { auteur: a, message: m };
}

module.exports = {
    OCCASIONS, MESSAGE_MIN, MESSAGE_MAX, AUTEUR_MAX, MOTS_MAX, ENVOIS_PAR_ADRESSE,
    nouveauJeton, lienContribution, lienRemise, empreinte, ouvertAuxMots, lisible, nettoyer
};
