/**
 * Contrats à durée déterminée : cumul, renouvellements, plafond.
 *
 * L'application ne connaissait d'un CDD que sa date de fin, et n'alertait qu'à
 * son approche. Elle ignorait depuis quand le salarié enchaînait les contrats :
 * personne n'était averti qu'un renouvellement ferait dépasser la durée
 * maximale, au-delà de laquelle le contrat risque d'être requalifié en contrat
 * à durée indéterminée — ni qu'un salarié continuait de travailler après le
 * terme, ce qui expose au même risque.
 *
 * Chaque renouvellement est désormais consigné. Pour un contrat antérieur à ce
 * suivi, la période est reconstituée depuis la fiche (embauche → terme), et
 * l'écran le signale.
 *
 * Les seuils sont réglables. La durée maximale de deux ans, renouvellements
 * compris, est celle du CDD à terme précis ; le nombre de renouvellements
 * admis n'est pas imposé par défaut et doit être confirmé par le conseil de
 * l'entreprise avant d'être renseigné.
 */

const JOUR = 86400000;

const DUREE_MAX_MOIS = parseInt(process.env.CDD_DUREE_MAX_MOIS || '24', 10);
const HORIZON_JOURS = parseInt(process.env.CDD_HORIZON_JOURS || '60', 10);
const RENOUVELLEMENTS_MAX = process.env.CDD_RENOUVELLEMENTS_MAX
    ? parseInt(process.env.CDD_RENOUVELLEMENTS_MAX, 10)
    : null;

const estCdd = (type) => /^cdd$/i.test(String(type || '').trim());

const jourUTC = (d) => {
    const x = new Date(d);
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};

const fr = (d) => new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' });

/** Ajoute des mois en restant sur un jour qui existe (31 janvier + 1 mois → 28 ou 29 février). */
function ajouterMois(date, mois) {
    const d = jourUTC(date);
    const jour = d.getUTCDate();
    const cible = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + mois, 1));
    const dernier = new Date(Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0)).getUTCDate();
    cible.setUTCDate(Math.min(jour, dernier));
    return cible;
}

/** Périodes du contrat : celles consignées, ou à défaut celle que décrit la fiche. */
function periodes(salarie, consignees = []) {
    if (consignees.length > 0) {
        return [...consignees].sort((a, b) => new Date(a.debut) - new Date(b.debut));
    }
    if (!salarie.hireDate) return [];
    return [{ debut: salarie.hireDate, fin: salarie.contractEndDate || null, nature: 'INITIAL', reconstituee: true }];
}

/**
 * Situation d'un CDD à une date.
 *
 * États, du plus urgent au moins urgent :
 *  DEPASSE        le terme dépasse déjà le plafond
 *  ECHU_EN_POSTE  le terme est passé et le salarié travaille encore
 *  SANS_TERME     aucune date de fin
 *  PLAFOND_ATTEINT le terme approche et ne peut plus être repoussé
 *  ECHEANCE_PROCHE le terme approche, un renouvellement reste possible
 *  INCOMPLET      date d'embauche absente
 *  EN_COURS       rien à décider pour l'instant
 */
function bilan(salarie, consignees = [], reference = new Date()) {
    const liste = periodes(salarie, consignees);
    const aujourdhui = jourUTC(reference);
    const debut = liste.length > 0 ? jourUTC(liste[0].debut) : null;
    const fin = salarie.contractEndDate ? jourUTC(salarie.contractEndDate) : null;
    const finMaxLegale = debut ? new Date(ajouterMois(debut, DUREE_MAX_MOIS).getTime() - JOUR) : null;
    const cumulJours = debut && fin ? Math.round((fin - debut) / JOUR) + 1 : null;
    const renouvellements = liste.filter((p) => p.nature === 'RENOUVELLEMENT').length;
    const joursRestants = fin ? Math.round((fin - aujourdhui) / JOUR) : null;

    let etat;
    let message;
    if (!debut) {
        etat = 'INCOMPLET';
        message = "Date d'embauche absente : la durée cumulée du contrat n'est pas calculable.";
    } else if (!fin) {
        etat = 'SANS_TERME';
        message = 'CDD sans date de fin. Un contrat à durée déterminée doit porter son terme, '
            + "faute de quoi il risque d'être regardé comme conclu pour une durée indéterminée.";
    } else if (fin > finMaxLegale) {
        etat = 'DEPASSE';
        message = `Le terme (${fr(fin)}) dépasse le plafond de ${DUREE_MAX_MOIS} mois renouvellements `
            + `compris, atteint le ${fr(finMaxLegale)} : le contrat risque d'être requalifié en CDI.`;
    } else if (fin < aujourdhui) {
        etat = salarie.status === 'TERMINATED' ? 'ECHU' : 'ECHU_EN_POSTE';
        message = etat === 'ECHU'
            ? `Contrat arrivé à son terme le ${fr(fin)}.`
            : `Terme échu le ${fr(fin)} et le salarié est toujours en poste : la poursuite du travail `
              + 'après le terme expose à une requalification en CDI. Renouveler, embaucher ou organiser la sortie.';
    } else if (joursRestants <= HORIZON_JOURS && (finMaxLegale - fin) / JOUR < 31) {
        etat = 'PLAFOND_ATTEINT';
        message = `Terme le ${fr(fin)}, et le plafond de ${DUREE_MAX_MOIS} mois est atteint : `
            + "le contrat ne peut plus être renouvelé. Décider d'une embauche en CDI ou préparer la sortie.";
    } else if (joursRestants <= HORIZON_JOURS) {
        etat = 'ECHEANCE_PROCHE';
        message = `Terme le ${fr(fin)} (dans ${joursRestants} jour(s)). Renouvellement possible `
            + `jusqu'au ${fr(finMaxLegale)} au plus tard, ou sortie à préparer.`;
    } else {
        etat = 'EN_COURS';
        message = null;
    }

    const avertissements = [];
    if (RENOUVELLEMENTS_MAX != null && renouvellements > RENOUVELLEMENTS_MAX) {
        avertissements.push(`${renouvellements} renouvellement(s), pour ${RENOUVELLEMENTS_MAX} admis.`);
    }
    if (consignees.length === 0 && debut) {
        avertissements.push("Période reconstituée depuis la fiche (embauche → terme) : les renouvellements "
            + "antérieurs à ce suivi ne sont pas connus.");
    }

    return {
        debut, fin, finMaxLegale, cumulJours,
        cumulMois: cumulJours != null ? Math.round((cumulJours / 30.4375) * 10) / 10 : null,
        renouvellements, joursRestants, etat, message, avertissements,
        reconstitue: consignees.length === 0,
        periodes: liste.map((p) => ({ debut: p.debut, fin: p.fin, nature: p.nature, motif: p.motif || null }))
    };
}

/** Ordre de traitement : ce qui expose le plus d'abord. */
const URGENCE = ['DEPASSE', 'ECHU_EN_POSTE', 'SANS_TERME', 'PLAFOND_ATTEINT', 'ECHEANCE_PROCHE', 'INCOMPLET', 'EN_COURS', 'ECHU'];

/** Ce qui s'oppose à repousser le terme jusqu'à `nouvelleFin`, ou null. */
function obstaclesRenouvellement(b, nouvelleFin) {
    const nf = nouvelleFin ? jourUTC(nouvelleFin) : null;
    if (!nf || isNaN(nf.getTime())) return 'Nouvelle date de fin invalide.';
    if (!b.debut) return "Date d'embauche absente : le plafond ne peut pas être contrôlé. Compléter la fiche.";
    if (!b.fin) return 'Le contrat ne porte pas de terme actuel : le renseigner sur la fiche avant de renouveler.';
    if (nf <= b.fin) return `La nouvelle échéance doit suivre l'échéance actuelle (${fr(b.fin)}).`;
    if (nf > b.finMaxLegale) {
        return `Au-delà du ${fr(b.finMaxLegale)}, le contrat dépasserait ${DUREE_MAX_MOIS} mois renouvellements `
            + "compris et risquerait d'être requalifié. Passer le salarié en CDI depuis sa fiche, ou préparer sa sortie.";
    }
    if (RENOUVELLEMENTS_MAX != null && b.renouvellements >= RENOUVELLEMENTS_MAX) {
        return `Le nombre de renouvellements admis (${RENOUVELLEMENTS_MAX}) est atteint.`;
    }
    return null;
}

module.exports = {
    DUREE_MAX_MOIS, HORIZON_JOURS, RENOUVELLEMENTS_MAX, URGENCE, JOUR,
    estCdd, ajouterMois, periodes, bilan, obstaclesRenouvellement
};
