/**
 * Titres et habilitations à échéance des salariés.
 *
 * Les prestataires disposaient d'un dossier de pièces daté, relancé avant
 * expiration. Les salariés n'avaient rien : ni permis de conduire, ni aptitude
 * médicale, ni habilitation. Or ce sont les mêmes échéances, avec les mêmes
 * conséquences — un permis expiré au volant d'un véhicule de service engage
 * l'entreprise, et l'application ne savait pas répondre à « qui roule sans
 * permis valide ? ».
 *
 * Deux différences avec le dossier prestataire, qui commandent tout le reste :
 *
 *  - **Ces pièces sont personnelles.** L'aptitude médicale est une donnée de
 *    santé, le titre de séjour une donnée sensible. La hiérarchie a besoin de
 *    savoir qu'une échéance approche ; elle n'a pas à consulter la pièce. La
 *    distinction est portée par `confidentielle` et appliquée au contrôle
 *    d'accès, non laissée à la discipline de chacun.
 *  - **Le salarié dépose lui-même.** Ce qu'il dépose est « à contrôler », jamais
 *    « valide » : c'est la RH qui valide, pas le déposant. Sans cette règle, la
 *    conformité se déclarerait elle-même.
 */

const mois = (variable, defaut) => {
    const v = parseFloat(process.env[variable]);
    return Number.isFinite(v) ? v : defaut;
};

/**
 * Fenêtre d'alerte avant expiration.
 *
 * Plus large que pour les prestataires (30 jours) : renouveler un permis ou
 * obtenir une visite médicale demande des rendez-vous, pas un courrier.
 */
const PREAVIS_JOURS = parseInt(process.env.PIECES_PREAVIS_JOURS, 10) || 60;

const TYPES = [
    {
        code: 'PERMIS',
        libelle: 'Permis de conduire',
        validiteMois: mois('PIECES_VALIDITE_PERMIS_MOIS', 120),
        confidentielle: false,
        pourquoi: "Un salarié qui conduit un véhicule de service sans permis valide engage l'entreprise."
    },
    {
        code: 'APTITUDE',
        libelle: "Visite médicale d'aptitude",
        validiteMois: mois('PIECES_VALIDITE_APTITUDE_MOIS', 12),
        confidentielle: true,
        pourquoi: "L'aptitude au poste est une obligation de l'employeur, et se périme."
    },
    {
        code: 'HABILITATION',
        libelle: 'Habilitation technique',
        validiteMois: mois('PIECES_VALIDITE_HABILITATION_MOIS', 36),
        confidentielle: false,
        pourquoi: "Une intervention menée sans habilitation à jour n'est couverte par personne."
    },
    {
        code: 'CARTE_PRO',
        libelle: 'Carte professionnelle',
        validiteMois: mois('PIECES_VALIDITE_CARTE_PRO_MOIS', 12),
        confidentielle: false,
        pourquoi: "Exigible pour certaines activités réglementées, et contrôlée sur site."
    },
    {
        code: 'SEJOUR',
        libelle: 'Titre de séjour ou de travail',
        validiteMois: mois('PIECES_VALIDITE_SEJOUR_MOIS', 12),
        confidentielle: true,
        pourquoi: "Employer une personne dont le titre a expiré expose l'employeur, pas seulement l'intéressé."
    },
    {
        code: 'AUTRE',
        libelle: 'Autre pièce',
        validiteMois: null,
        confidentielle: false,
        pourquoi: "Agrément, certification ou qualification propre au poste."
    }
];

const PAR_CODE = Object.fromEntries(TYPES.map((t) => [t.code, t]));
const CODES = TYPES.map((t) => t.code);

/** Pièces dont le contenu ne se montre qu'à la RH et à l'intéressé. */
const CODES_CONFIDENTIELS = TYPES.filter((t) => t.confidentielle).map((t) => t.code);

const STATUTS = ['VALIDE', 'A_CONTROLER', 'REFUSEE'];

const JOUR = 24 * 3600 * 1000;

/**
 * État d'une pièce à une date donnée.
 *
 * L'état de validité et le statut de contrôle sont deux choses distinctes : une
 * pièce peut être parfaitement en cours de validité et n'avoir jamais été
 * vérifiée par la RH. Les confondre ferait passer pour acquis un document que
 * personne n'a regardé.
 *
 * @returns {'VALIDE'|'BIENTOT_EXPIREE'|'EXPIREE'|'SANS_ECHEANCE'}
 */
function etatPiece(piece, reference = new Date()) {
    if (!piece || !piece.expireLe) return 'SANS_ECHEANCE';
    const fin = new Date(piece.expireLe);
    if (isNaN(fin.getTime())) return 'SANS_ECHEANCE';
    if (fin < reference) return 'EXPIREE';
    if (fin.getTime() - reference.getTime() <= PREAVIS_JOURS * JOUR) return 'BIENTOT_EXPIREE';
    return 'VALIDE';
}

/** Jours restants avant expiration ; négatif si la pièce est déjà périmée. */
function joursRestants(piece, reference = new Date()) {
    if (!piece || !piece.expireLe) return null;
    const fin = new Date(piece.expireLe);
    if (isNaN(fin.getTime())) return null;
    return Math.ceil((fin.getTime() - reference.getTime()) / JOUR);
}

/**
 * Échéance déduite d'une date de délivrance, quand elle n'est pas fournie.
 *
 * Une pièce enregistrée sans date de fin ne serait jamais relancée : elle
 * dormirait au dossier en paraissant valide indéfiniment.
 */
function echeanceParDefaut(code, delivreeLe) {
    const type = PAR_CODE[code];
    if (!type || !type.validiteMois || !delivreeLe) return null;
    const d = new Date(delivreeLe);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + type.validiteMois);
    return d;
}

/**
 * Ce qu'un lecteur a le droit de voir d'une pièce.
 *
 * La hiérarchie reçoit l'échéance — c'est ce dont elle a besoin pour organiser
 * un remplacement — et jamais la référence, la pièce jointe ni le motif d'un
 * refus. Le tri se fait ici, à la source, plutôt que dans chaque écran.
 */
function pourLecteur(piece, { estRhOuAdmin, estTitulaire }) {
    const type = PAR_CODE[piece.type] || PAR_CODE.AUTRE;
    const complet = estRhOuAdmin || estTitulaire;

    const vue = {
        id: piece.id,
        type: piece.type,
        libelle: type.libelle,
        confidentielle: type.confidentielle,
        expireLe: piece.expireLe || null,
        etat: etatPiece(piece),
        joursRestants: joursRestants(piece),
        statut: piece.statut
    };

    if (!complet && type.confidentielle) {
        // L'existence de la pièce et sa date restent visibles : c'est ce qui
        // permet d'anticiper. Le contenu, lui, ne regarde pas le responsable.
        vue.restreinte = true;
        return vue;
    }

    return {
        ...vue,
        reference: piece.reference || null,
        delivreeLe: piece.delivreeLe || null,
        fichierJoint: Boolean(piece.filePath),
        deposeePar: piece.deposeePar || null,
        controleePar: piece.controleePar || null,
        controleeLe: piece.controleeLe || null,
        motifRefus: piece.motifRefus || null
    };
}

/**
 * Synthèse du dossier d'un salarié.
 *
 * Pour chaque type, la pièce valide la plus récente fait foi. Une pièce refusée
 * n'est jamais retenue comme couvrante : elle a été regardée et écartée.
 */
function bilan(pieces, reference = new Date()) {
    const parType = {};
    for (const p of pieces) {
        if (p.statut === 'REFUSEE') continue;
        const actuel = parType[p.type];
        const dateDe = (x) => new Date(x.expireLe || x.delivreeLe || 0).getTime();
        if (!actuel || dateDe(p) > dateDe(actuel)) parType[p.type] = p;
    }

    const retenues = Object.values(parType);
    const expirees = retenues.filter((p) => etatPiece(p, reference) === 'EXPIREE');
    const aRenouveler = retenues.filter((p) => etatPiece(p, reference) === 'BIENTOT_EXPIREE');
    const aControler = pieces.filter((p) => p.statut === 'A_CONTROLER');

    return {
        total: pieces.length,
        expirees: expirees.length,
        aRenouveler: aRenouveler.length,
        aControler: aControler.length,
        // « À jour » ne dit rien de l'exhaustivité du dossier : l'application
        // ne sait pas quelles pièces tel poste exige. Elle sait seulement que
        // celles qui y figurent sont valides.
        aJour: expirees.length === 0
    };
}

module.exports = {
    TYPES, PAR_CODE, CODES, CODES_CONFIDENTIELS, STATUTS, PREAVIS_JOURS,
    etatPiece, joursRestants, echeanceParDefaut, pourLecteur, bilan
};
