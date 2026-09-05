/**
 * Calcul de paie — source unique.
 *
 * Avant ce module, le salaire brut et les cotisations étaient recalculés à
 * quatre endroits avec quatre formules différentes : l'exécution de la paie,
 * le PDF du bulletin, l'export comptable et la page Paie du frontend. Les
 * quatre donnaient des montants différents pour le même bulletin, et la
 * soustraction affichée à l'écran ne tombait pas juste.
 *
 * Tout passe désormais par `calculerPaie()`, et le résultat est enregistré sur
 * la fiche de paie. Les consommateurs lisent, ils ne recalculent plus.
 *
 * ⚠️ Les taux ci-dessous sont ceux qui étaient déjà appliqués par
 * l'application. Ils sont regroupés ici pour être vérifiables d'un coup d'œil,
 * pas parce qu'ils ont été validés : ils doivent l'être par le comptable de
 * l'entreprise avant toute paie réelle. Chacun est surchargeable par variable
 * d'environnement, sans redéploiement du code.
 */

const nombre = (valeur, defaut) => {
    const n = parseFloat(valeur);
    return Number.isFinite(n) ? n : defaut;
};

const TAUX = {
    // Part salariale — retenue sur le bulletin.
    cnpsSalarie: nombre(process.env.TAUX_CNPS_SALARIE, 0.063),

    // Couverture Maladie Universelle : forfait mensuel par personne, non
    // proportionnel au salaire.
    cmuForfait: nombre(process.env.CMU_FORFAIT, 1000),

    // Part patronale — coût de l'employeur, jamais retenu au salarié.
    // Agrège prestations familiales, accident du travail et retraite. Le taux
    // réel dépend de la branche d'activité et de plafonds par assiette ; cette
    // valeur unique est une approximation héritée, à affiner avec le comptable.
    cnpsPatronal: nombre(process.env.TAUX_CNPS_PATRONAL, 0.15),

    // Heures supplémentaires : majoration et horaire mensuel de référence.
    majorationHeureSup: nombre(process.env.MAJORATION_HEURE_SUP, 1.15),
    heuresMensuelles: nombre(process.env.HEURES_MENSUELLES, 173.33),

    // Jours ouvrés servant au prorata d'une absence non rémunérée.
    joursOuvres: nombre(process.env.JOURS_OUVRES_MOIS, 26)
};

/**
 * Barème progressif de l'Impôt sur Traitement et Salaires, par tranches.
 * Exprimé en tranches plutôt qu'en cascade de `if` : le total cumulé de
 * chaque tranche se déduit du barème au lieu d'être recopié à la main, ce qui
 * évite qu'une modification de taux laisse une constante périmée derrière elle.
 */
const TRANCHES_ITS = [
    { plafond: 75000, taux: 0 },
    { plafond: 240000, taux: 0.16 },
    { plafond: 800000, taux: 0.21 },
    { plafond: Infinity, taux: 0.24 }
];

function calculerITS(netImposable) {
    if (!(netImposable > 0)) return 0;
    let impot = 0;
    let precedent = 0;
    for (const tranche of TRANCHES_ITS) {
        if (netImposable <= precedent) break;
        const assiette = Math.min(netImposable, tranche.plafond) - precedent;
        impot += assiette * tranche.taux;
        precedent = tranche.plafond;
    }
    return impot;
}

/**
 * Calcule un bulletin complet.
 *
 * @param {object} e Éléments variables du mois.
 * @param {number} e.baseSalary     Salaire de base mensuel.
 * @param {number} [e.bonus]        Primes du mois.
 * @param {number} [e.overtimeHours] Heures supplémentaires (en heures).
 * @param {number} [e.leaveDays]    Jours d'absence non rémunérés.
 * @param {number} [e.deductions]   Retenues diverses (avances, prêts…).
 * @returns {object} Décomposition complète, montants non arrondis.
 */
function calculerPaie({ baseSalary, bonus, overtimeHours, leaveDays, deductions } = {}) {
    const base = nombre(baseSalary, 0);
    const primes = nombre(bonus, 0);
    const heuresSup = nombre(overtimeHours, 0);
    const joursAbsence = nombre(leaveDays, 0);
    const retenuesDiverses = nombre(deductions, 0);

    // Les heures supplémentaires sont une quantité, pas un montant : l'export
    // comptable les additionnait telles quelles au brut, ce qui ajoutait
    // 10 FCFA pour 10 heures effectuées.
    const montantHeuresSup = base > 0 && heuresSup > 0
        ? (base / TAUX.heuresMensuelles) * TAUX.majorationHeureSup * heuresSup
        : 0;

    const retenueAbsence = base > 0 && joursAbsence > 0
        ? (base / TAUX.joursOuvres) * joursAbsence
        : 0;

    const brut = Math.max(base + montantHeuresSup - retenueAbsence + primes, 0);

    const cnpsSalarie = brut * TAUX.cnpsSalarie;
    const cmu = brut > 0 ? TAUX.cmuForfait : 0;
    const netImposable = Math.max(brut - cnpsSalarie - cmu, 0);
    const its = calculerITS(netImposable);

    // Retenues portées au bulletin du salarié.
    const cotisationsSalariales = cnpsSalarie + cmu + its;

    // Charge de l'employeur : elle s'ajoute au coût du poste et ne diminue
    // jamais la rémunération. La confondre avec la part salariale faisait
    // enregistrer un net supérieur de 14 % au net réellement versé sur les
    // salaires élevés.
    const cotisationsPatronales = brut * TAUX.cnpsPatronal;

    const net = brut - cotisationsSalariales - retenuesDiverses;

    return {
        baseSalary: base,
        bonus: primes,
        overtimeHours: heuresSup,
        overtimeAmount: montantHeuresSup,
        leaveDays: joursAbsence,
        leaveDeduction: retenueAbsence,
        grossSalary: brut,
        cnpsEmployee: cnpsSalarie,
        cmu,
        taxableIncome: netImposable,
        its,
        deductions: retenuesDiverses,
        employeeContributions: cotisationsSalariales,
        employerContributions: cotisationsPatronales,
        netSalary: net,
        // Ce que le poste coûte réellement à l'entreprise.
        employerCost: brut + cotisationsPatronales
    };
}

/**
 * Décomposition d'une fiche de paie déjà enregistrée.
 *
 * Les fiches créées avant l'ajout des colonnes détaillées ne portent que leur
 * salaire de base et leurs totaux. Plutôt que de les recalculer en silence —
 * ce qui afficherait des montants différents de ceux du PDF déjà remis au
 * salarié — on signale explicitement qu'elles sont incomplètes.
 *
 * @returns {object} La décomposition, avec `complet: false` si elle a dû être
 *                   reconstituée à partir des seuls éléments variables.
 */
function decomposer(payroll) {
    if (payroll && payroll.grossSalary != null && payroll.cnpsEmployee != null) {
        return { ...payroll, complet: true };
    }
    return { ...calculerPaie(payroll || {}), complet: false };
}

/**
 * Intervalle couvrant un mois de paie, à partir d'un libellé « AAAA-MM ».
 *
 * `period` est une colonne DateTime. Les filtres qui la comparaient à la chaîne
 * « 2026-08 », ou lui appliquaient `startsWith` — un opérateur de chaîne —,
 * étaient rejetés par Prisma à l'exécution : l'export comptable renvoyait une
 * erreur serveur à chaque appel, quel que soit le mois demandé.
 *
 * @param {string} [libelle] « AAAA-MM » ou « AAAA-MM-JJ ». Mois courant à défaut.
 * @returns {{gte: Date, lt: Date, libelle: string}}
 */
function intervalleMois(libelle) {
    const correspondance = /^(\d{4})-(\d{2})/.exec(String(libelle || ''));
    const maintenant = new Date();
    const annee = correspondance ? parseInt(correspondance[1], 10) : maintenant.getUTCFullYear();
    const mois = correspondance ? parseInt(correspondance[2], 10) - 1 : maintenant.getUTCMonth();

    const debut = new Date(Date.UTC(annee, mois, 1));
    const fin = new Date(Date.UTC(annee, mois + 1, 1));
    return {
        gte: debut,
        lt: fin,
        libelle: `${debut.getUTCFullYear()}-${String(debut.getUTCMonth() + 1).padStart(2, '0')}`
    };
}

module.exports = { calculerPaie, calculerITS, decomposer, intervalleMois, TAUX, TRANCHES_ITS };
