/**
 * Conformité des prestataires et sous-traitants.
 *
 * Le modèle `Subcontractor` décrivait un prestataire — nom, société, taux,
 * dates — et aucune pièce. C'est une exposition invisible : le donneur d'ordre
 * répond financièrement des salariés qu'un sous-traitant n'a pas déclarés, et
 * cela ne se découvre qu'au contrôle, une fois la créance constituée.
 *
 * Les pièces ci-dessous sont celles qu'un donneur d'ordre demande couramment en
 * Côte d'Ivoire. Comme partout ailleurs dans cette application, ce sont des
 * valeurs par défaut : la liste exigible dépend de la nature du marché, et
 * chaque durée de validité est réglable sans redéploiement.
 *
 * Une attestation n'a de valeur qu'à sa date : une pièce périmée vaut une pièce
 * absente, et c'est précisément ce que personne ne voit passer.
 */

const mois = (variable, defaut) => {
    const v = parseFloat(process.env[variable]);
    return Number.isFinite(v) ? v : defaut;
};

// Fenêtre d'alerte avant expiration : une attestation se renouvelle, encore
// faut-il s'y prendre avant l'échéance.
const PREAVIS_JOURS = parseInt(process.env.SOUS_TRAITANCE_PREAVIS_JOURS, 10) || 30;

const PIECES = [
    {
        code: 'CNPS',
        libelle: 'Attestation de régularité CNPS',
        exigee: true,
        validiteMois: mois('SOUS_TRAITANCE_VALIDITE_CNPS_MOIS', 3),
        pourquoi: "La pièce maîtresse : le donneur d'ordre répond des salariés que le sous-traitant n'a pas déclarés."
    },
    {
        code: 'FISCAL',
        libelle: 'Attestation de régularité fiscale',
        exigee: true,
        validiteMois: mois('SOUS_TRAITANCE_VALIDITE_FISCAL_MOIS', 3),
        pourquoi: "Atteste que le prestataire est à jour de ses obligations déclaratives."
    },
    {
        code: 'RCCM',
        libelle: 'Registre du commerce (RCCM)',
        exigee: true,
        // Une immatriculation ne périme pas ; c'est l'extrait qui vieillit.
        validiteMois: mois('SOUS_TRAITANCE_VALIDITE_RCCM_MOIS', 12),
        pourquoi: "Établit l'existence légale du prestataire et la personne qui l'engage."
    },
    {
        code: 'ASSURANCE',
        libelle: 'Assurance responsabilité civile',
        exigee: true,
        validiteMois: mois('SOUS_TRAITANCE_VALIDITE_ASSURANCE_MOIS', 12),
        pourquoi: "Sans elle, un dommage causé par le prestataire revient au donneur d'ordre."
    },
    {
        code: 'PERSONNEL',
        libelle: 'Liste nominative du personnel affecté',
        exigee: false,
        validiteMois: mois('SOUS_TRAITANCE_VALIDITE_PERSONNEL_MOIS', 6),
        pourquoi: "Permet de rapprocher les personnes présentes sur site de celles qui sont déclarées."
    },
    {
        code: 'AUTRE',
        libelle: 'Autre pièce',
        exigee: false,
        validiteMois: null,
        pourquoi: "Pièce propre au marché : agrément, habilitation, qualification."
    }
];

const PAR_CODE = Object.fromEntries(PIECES.map((p) => [p.code, p]));
const CODES = PIECES.map((p) => p.code);

const JOUR = 24 * 3600 * 1000;

/**
 * État d'une pièce à une date donnée.
 * @returns {'VALIDE'|'BIENTOT_EXPIREE'|'EXPIREE'|'SANS_ECHEANCE'}
 */
function etatPiece(document, reference = new Date()) {
    if (!document.expiresAt) return 'SANS_ECHEANCE';
    const fin = new Date(document.expiresAt);
    if (fin < reference) return 'EXPIREE';
    if (fin.getTime() - reference.getTime() <= PREAVIS_JOURS * JOUR) return 'BIENTOT_EXPIREE';
    return 'VALIDE';
}

/**
 * Échéance déduite d'une date de délivrance, quand elle n'est pas fournie.
 * Une attestation remise sans date de fin n'est pas valable indéfiniment.
 */
function echeanceParDefaut(code, issuedAt) {
    const piece = PAR_CODE[code];
    if (!piece || !piece.validiteMois || !issuedAt) return null;
    const d = new Date(issuedAt);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + piece.validiteMois);
    return d;
}

/**
 * Bilan d'un prestataire : ce qui manque, ce qui a expiré, ce qui expire.
 *
 * Une pièce absente et une pièce périmée sont mises sur le même plan — elles
 * ont la même valeur devant un contrôle — mais nommées différemment, parce
 * qu'elles n'appellent pas la même démarche.
 */
function bilan(sousTraitant, documents, reference = new Date()) {
    const parCode = {};
    for (const d of documents) {
        // Pour chaque type, la pièce la plus récemment valable fait foi.
        const actuel = parCode[d.type];
        const plusRecente = !actuel ||
            new Date(d.expiresAt || d.issuedAt || 0) > new Date(actuel.expiresAt || actuel.issuedAt || 0);
        if (plusRecente) parCode[d.type] = d;
    }

    const pieces = PIECES.filter((p) => p.code !== 'AUTRE').map((p) => {
        const doc = parCode[p.code];
        const etat = doc ? etatPiece(doc, reference) : 'ABSENTE';
        return {
            code: p.code,
            libelle: p.libelle,
            exigee: p.exigee,
            pourquoi: p.pourquoi,
            etat,
            reference: doc?.reference || null,
            delivreeLe: doc?.issuedAt || null,
            expireLe: doc?.expiresAt || null,
            documentId: doc?.id || null
        };
    });

    const bloquantes = pieces.filter((p) => p.exigee && ['ABSENTE', 'EXPIREE'].includes(p.etat));
    const aRenouveler = pieces.filter((p) => p.etat === 'BIENTOT_EXPIREE');

    return {
        id: sousTraitant.id,
        nom: `${sousTraitant.lastName || ''} ${sousTraitant.firstName || ''}`.trim(),
        societe: sousTraitant.companyName,
        type: sousTraitant.type,
        statut: sousTraitant.status,
        cnpsNumber: sousTraitant.cnpsNumber || null,
        taxId: sousTraitant.taxId || null,
        pieces,
        // « Couvert » ne veut pas dire « en règle » : cela veut dire que les
        // pièces exigées sont au dossier et à jour à cette date.
        couvert: bloquantes.length === 0,
        bloquantes: bloquantes.map((p) => ({ code: p.code, libelle: p.libelle, etat: p.etat })),
        aRenouveler: aRenouveler.map((p) => ({ code: p.code, libelle: p.libelle, expireLe: p.expireLe }))
    };
}

module.exports = { PIECES, PAR_CODE, CODES, PREAVIS_JOURS, etatPiece, echeanceParDefaut, bilan };
