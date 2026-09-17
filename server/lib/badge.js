const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Badge numérique : la carte professionnelle, sur le téléphone du salarié.
 *
 * Les commerciaux et techniciens se présentent chez des clients sans rien
 * pouvoir montrer qui prouve leur appartenance à l'entreprise. Une carte
 * plastifiée se garde après le départ ; celle-ci s'éteint d'elle-même.
 *
 * **Ce que la carte ne prouve pas.** Une capture d'écran se recopie. C'est
 * pourquoi la vérification ne repose pas sur l'image de la carte mais sur le
 * scan : la page de vérification est servie par le serveur, affiche la photo
 * enregistrée par la RH et l'heure de la vérification. Le vérificateur compare
 * un visage, pas un dessin.
 *
 * **Ce que la vérification révèle.** Le nom, la fonction et la photo — ce que
 * porte déjà la carte. Jamais le matricule, le département ou la date
 * d'embauche. Et un badge qui n'est plus valide ne dit pas pourquoi : « ce
 * salarié a quitté l'entreprise » est une information que le client n'a pas à
 * apprendre d'un QR.
 */

const VALIDITE_MOIS = parseInt(process.env.BADGE_VALIDITE_MOIS, 10) || 12;

const nouveauJeton = () => crypto.randomBytes(24).toString('hex');
const lienPorteur = (jeton) => `${getPublicAppUrl()}/badge/${jeton}`;
const lienVerification = (jeton) => `${getPublicAppUrl()}/badge/verifier/${jeton}`;

function echeance(reference = new Date(), mois = VALIDITE_MOIS) {
    const d = new Date(reference);
    d.setUTCMonth(d.getUTCMonth() + mois);
    return d;
}

/**
 * État d'un badge à une date.
 * @returns {'INTROUVABLE'|'REVOQUE'|'SALARIE_SORTI'|'EXPIRE'|'VALIDE'}
 */
function etat(badge, salarie, reference = new Date()) {
    if (!badge || !salarie) return 'INTROUVABLE';
    if (badge.revoqueLe) return 'REVOQUE';
    // Le départ éteint le badge sans que personne ait à y penser.
    if (salarie.status === 'TERMINATED') return 'SALARIE_SORTI';
    if (salarie.exitDate && new Date(salarie.exitDate) <= reference) return 'SALARIE_SORTI';
    if (new Date(badge.expireLe) < reference) return 'EXPIRE';
    return 'VALIDE';
}

/** Motifs rendus au porteur, qui a le droit de savoir pourquoi sa carte ne s'ouvre plus. */
const MOTIFS_PORTEUR = {
    INTROUVABLE: "Ce badge n'existe pas. Demandez un nouveau lien au service des ressources humaines.",
    REVOQUE: 'Ce badge a été annulé par le service des ressources humaines.',
    SALARIE_SORTI: "Ce badge n'est plus actif.",
    EXPIRE: 'Ce badge a expiré. Demandez-en le renouvellement au service des ressources humaines.'
};

/** Réponse au vérificateur : valide ou non, sans motif détaillé. */
function pourVerificateur(badge, salarie, reference = new Date()) {
    const e = etat(badge, salarie, reference);
    const organisation = require('./identite').nom();
    if (e !== 'VALIDE') {
        return { valide: false, organisation, verifieLe: reference.toISOString() };
    }
    return {
        valide: true,
        organisation,
        titulaire: `${salarie.firstName} ${salarie.lastName}`,
        fonction: salarie.positionTitle || null,
        photo: Boolean(badge.photoPath),
        expireLe: badge.expireLe,
        verifieLe: reference.toISOString()
    };
}

/** Ce qu'affiche la carte à son porteur. */
function pourPorteur(badge, salarie, reference = new Date()) {
    const e = etat(badge, salarie, reference);
    if (e !== 'VALIDE') return { valide: false, etat: e, motif: MOTIFS_PORTEUR[e] };
    return {
        valide: true,
        etat: e,
        organisation: require('./identite').nom(),
        prenom: salarie.firstName,
        nom: salarie.lastName,
        fonction: salarie.positionTitle || null,
        departement: salarie.department || null,
        matricule: salarie.matricule || null,
        photo: Boolean(badge.photoPath),
        emisLe: badge.emisLe,
        expireLe: badge.expireLe,
        lienVerification: lienVerification(badge.jetonVerification)
    };
}

/** Vue RH d'un badge. */
function pourRh(badge, salarie, reference = new Date()) {
    if (!badge) return null;
    return {
        id: badge.id,
        etat: etat(badge, salarie, reference),
        lienPorteur: lienPorteur(badge.jetonPorteur),
        lienVerification: lienVerification(badge.jetonVerification),
        photo: Boolean(badge.photoPath),
        emisLe: badge.emisLe,
        emisPar: badge.emisPar,
        expireLe: badge.expireLe,
        revoqueLe: badge.revoqueLe,
        revoqueMotif: badge.revoqueMotif,
        verifications: badge.verifications,
        derniereVerification: badge.derniereVerification
    };
}

module.exports = {
    VALIDITE_MOIS, MOTIFS_PORTEUR, nouveauJeton, lienPorteur, lienVerification,
    echeance, etat, pourVerificateur, pourPorteur, pourRh
};
