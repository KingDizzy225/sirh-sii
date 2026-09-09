const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Remise d'un document à un salarié, par lien.
 *
 * Les salariés n'ouvrant plus de session, un bulletin de paie ou une
 * attestation n'avait plus aucun moyen de leur parvenir : le PDF restait dans
 * l'application. La RH produit désormais un lien qu'elle transmet par le canal
 * de son choix — WhatsApp, message, main propre.
 *
 * **Le lien est la clé.** Ce n'est pas une faiblesse en soi, c'est un choix :
 * exiger un mot de passe reviendrait à rouvrir les comptes qu'on vient de
 * fermer. Mais un lien circule — il se transfère, il reste dans une
 * conversation, il se retrouve sur un téléphone prêté. Trois garde-fous
 * l'encadrent donc :
 *
 *  - **une expiration**, parce qu'un lien de bulletin n'a pas à valoir un an ;
 *  - **une vérification** à l'ouverture — la date de naissance —, pour qu'un
 *    lien transféré ne suffise pas à lire le bulletin de quelqu'un d'autre.
 *    Ce n'est pas un secret fort, et ce n'en est pas l'objet : il s'agit
 *    d'écarter le destinataire par erreur, pas de résister à une attaque ;
 *  - **une trace** de chaque ouverture et de chaque téléchargement, pour que la
 *    RH puisse dire quand le document a été retiré. Ou qu'il ne l'a pas été.
 */

/** Durée de validité d'un lien, en jours. */
const VALIDITE_JOURS = parseInt(process.env.REMISE_VALIDITE_JOURS, 10) || 90;

/**
 * Tentatives de vérification avant blocage.
 *
 * Une date de naissance se devine en quelques centaines d'essais. Sans
 * plafond, la vérification ne servirait à rien.
 */
const ECHECS_MAX = parseInt(process.env.REMISE_ECHECS_MAX, 10) || 5;

/** Natures de source admises, et l'intitulé qu'elles portent. */
const SOURCES = {
    BULLETIN: 'Bulletin de paie',
    DOCUMENT: 'Document',
    ATTESTATION: 'Attestation'
};

/** Jeton aléatoire sur 32 octets : ni devinable, ni énumérable. */
const nouveauJeton = () => crypto.randomBytes(32).toString('hex');

/** Adresse complète du lien à transmettre. */
const lienDe = (token) => `${getPublicAppUrl()}/document/${token}`;

/** Échéance d'un lien produit maintenant. */
function echeance(jours = VALIDITE_JOURS) {
    const d = new Date();
    d.setDate(d.getDate() + jours);
    return d;
}

/**
 * État d'une remise, du point de vue de qui présente le lien.
 * @returns {'VALIDE'|'EXPIREE'|'REVOQUEE'|'BLOQUEE'}
 */
function etat(remise, reference = new Date()) {
    if (!remise) return 'INTROUVABLE';
    if (remise.revoqueeLe) return 'REVOQUEE';
    if (remise.echecs >= ECHECS_MAX) return 'BLOQUEE';
    if (new Date(remise.expireLe) < reference) return 'EXPIREE';
    return 'VALIDE';
}

/**
 * Motif rendu au visiteur, en clair.
 *
 * Il ne dit jamais si le jeton a existé : « lien inconnu » et « lien expiré »
 * se ressemblent volontairement pour qui n'a pas le bon jeton, et l'un comme
 * l'autre invitent à demander un nouveau lien plutôt qu'à insister.
 */
const MOTIFS = {
    INTROUVABLE: "Ce lien n'est pas valide. Demandez-en un nouveau au service des ressources humaines.",
    EXPIREE: "Ce lien a expiré. Demandez-en un nouveau au service des ressources humaines.",
    REVOQUEE: "Ce lien a été annulé par le service des ressources humaines.",
    BLOQUEE: "Trop de vérifications ont échoué. Ce lien est bloqué ; demandez-en un nouveau."
};

/**
 * Compare deux dates au jour près, en temps constant sur la chaîne formatée.
 *
 * La comparaison directe de chaînes fuirait le nombre de caractères communs.
 * L'enjeu est modeste — une date de naissance n'est pas un mot de passe — mais
 * la précaution ne coûte rien.
 */
function memeJour(saisie, attendue) {
    if (!saisie || !attendue) return false;
    const a = new Date(saisie);
    const b = new Date(attendue);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return false;

    const cle = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const x = Buffer.from(cle(a));
    const y = Buffer.from(cle(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/**
 * La vérification demandée est-elle satisfaite ?
 * @returns {{ok:boolean, motif:string|null}}
 */
function verifier(remise, salarie, reponse) {
    if (remise.verification === 'AUCUNE') return { ok: true, motif: null };

    if (!salarie || !salarie.birthDate) {
        // La date n'est pas au dossier : la vérification ne peut pas aboutir,
        // et bloquer indéfiniment le salarié serait absurde. Le lien aurait dû
        // être produit sans contrôle — on le dit plutôt que de rester muet.
        return {
            ok: false,
            motif: "La vérification est impossible : la date de naissance n'est pas renseignée "
                + 'au dossier. Le service des ressources humaines doit produire un lien sans contrôle.'
        };
    }

    if (!memeJour(reponse, salarie.birthDate)) {
        return { ok: false, motif: 'La date de naissance ne correspond pas.' };
    }
    return { ok: true, motif: null };
}

/** Vue d'une remise pour la RH : où en est le document remis. */
function pourRh(remise) {
    return {
        id: remise.id,
        titre: remise.titre,
        sourceType: remise.sourceType,
        sourceId: remise.sourceId,
        lien: lienDe(remise.token),
        remisLe: remise.remisLe,
        remisPar: remise.remisPar,
        expireLe: remise.expireLe,
        verification: remise.verification,
        etat: etat(remise),
        ouvertLe: remise.ouvertLe,
        telechargeLe: remise.telechargeLe,
        telechargements: remise.telechargements,
        echecs: remise.echecs,
        revoqueeLe: remise.revoqueeLe,
        revoqueeMotif: remise.revoqueeMotif
    };
}

module.exports = {
    VALIDITE_JOURS, ECHECS_MAX, SOURCES, MOTIFS,
    nouveauJeton, lienDe, echeance, etat, verifier, memeJour, pourRh
};
