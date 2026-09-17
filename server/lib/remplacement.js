/**
 * Bourse aux remplacements : règles d'une demande sur un créneau.
 *
 * Le créneau ne change de titulaire qu'à la validation d'un responsable. Avant,
 * rien n'est acquis : ni le salarié qui propose n'est libéré, ni le collègue
 * qui accepte n'est engagé aux yeux du planning.
 */

const STATUTS_EN_COURS = ['OUVERTE', 'ACCEPTEE'];

/** Instant de début d'un créneau : sa date (jour UTC) et son heure « HH:MM ». */
function debutCreneau(shift) {
    const d = new Date(shift.date);
    const [h, m] = String(shift.startTime || '00:00').split(':').map((n) => parseInt(n, 10) || 0);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m));
}

const memeJour = (a, b) => new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

/**
 * État affiché d'une demande. Une demande non validée dont le créneau a
 * commencé est échue : il est trop tard pour remplacer.
 */
function etat(demande, reference = new Date()) {
    if (STATUTS_EN_COURS.includes(demande.statut) && demande.shift && debutCreneau(demande.shift) <= reference) {
        return 'ECHUE';
    }
    return demande.statut;
}

/** Peut-on proposer ce créneau ? @returns {string|null} le motif du refus */
function refusProposition({ shift, demandeurId, demandesEnCours, reference = new Date() }) {
    if (!shift) return 'Créneau introuvable.';
    if (shift.employeeId !== demandeurId) return "Ce créneau n'est pas le vôtre.";
    if (debutCreneau(shift) <= reference) return 'Ce créneau a déjà commencé.';
    if (demandesEnCours > 0) return 'Ce créneau est déjà proposé au remplacement.';
    return null;
}

/** Ce collègue peut-il reprendre le créneau ? @returns {string|null} */
function refusReprise({ demande, remplacant, creneauxDuJour, reference = new Date() }) {
    if (!demande || demande.statut !== 'OUVERTE') return "Ce créneau n'est plus à reprendre.";
    if (etat(demande, reference) === 'ECHUE') return 'Ce créneau a déjà commencé.';
    if (!remplacant || remplacant.status === 'TERMINATED') return 'Salarié introuvable.';
    if (remplacant.id === demande.demandeurId) return 'Vous ne pouvez pas reprendre votre propre créneau.';
    if (demande.demandeur && remplacant.department !== demande.demandeur.department) {
        return "Ce créneau est réservé aux collègues du même service.";
    }
    if (creneauxDuJour.some((c) => c.id !== demande.shiftId && memeJour(c.date, demande.shift.date))) {
        return 'Vous avez déjà un créneau ce jour-là.';
    }
    return null;
}

module.exports = { STATUTS_EN_COURS, debutCreneau, memeJour, etat, refusProposition, refusReprise };
