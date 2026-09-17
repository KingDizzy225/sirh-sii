const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Pré-accueil : le lien qu'un futur salarié reçoit avant son premier jour.
 *
 * L'intégration n'existait que côté RH. Le nouveau n'en voyait rien avant
 * d'arriver, et la première matinée se perdait à réclamer une photocopie de
 * pièce d'identité. Il sait désormais qui l'accueille, où, à quelle heure, ce
 * qu'il fera — et dépose ses pièces à l'avance.
 *
 * Le lien ne lit rien du dossier au-delà du prénom : les pièces déposées ne
 * sont jamais renvoyées, seulement marquées comme reçues.
 */

/** Pièces qu'on peut demander, avec l'intitulé montré au futur salarié. */
const PIECES = {
    IDENTITE: "Pièce d'identité (CNI ou passeport)",
    NAISSANCE: "Extrait d'acte de naissance",
    RIB: 'Relevé d\'identité bancaire',
    PHOTO: "Photo d'identité",
    CNPS: "Numéro d'immatriculation CNPS (si vous en avez un)",
    DIPLOMES: 'Diplômes et attestations',
    RESIDENCE: 'Certificat de résidence',
    CASIER: 'Extrait de casier judiciaire'
};

/** Le lien reste ouvert trente jours après l'embauche. */
const JOURS_APRES_EMBAUCHE = 30;

const nouveauJeton = () => crypto.randomBytes(32).toString('hex');
const lienDe = (token) => `${getPublicAppUrl()}/bienvenue/${token}`;

/** Intitulé du document déposé : c'est lui qui relie le dépôt à la pièce demandée. */
const titreDepot = (code) => `Pré-accueil — ${PIECES[code]}`;

function etat(preAccueil, salarie, reference = new Date()) {
    if (!preAccueil || !salarie) return 'INTROUVABLE';
    if (salarie.status === 'TERMINATED') return 'CLOS';
    const fin = new Date(salarie.hireDate);
    fin.setUTCDate(fin.getUTCDate() + JOURS_APRES_EMBAUCHE);
    if (fin < reference) return 'CLOS';
    return 'OUVERT';
}

/** Jours avant l'arrivée, en jours civils (0 le jour même, négatif après). */
function joursAvant(hireDate, reference = new Date()) {
    const jour = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.round((jour(new Date(hireDate)) - jour(reference)) / 86400000);
}

const codesValides = (codes) => [...new Set((Array.isArray(codes) ? codes : []).filter((c) => PIECES[c]))];

module.exports = { PIECES, JOURS_APRES_EMBAUCHE, nouveauJeton, lienDe, titreDepot, etat, joursAvant, codesValides };
