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
    // Le taux unique ne s'applique plus qu'aux heures saisies sans ventilation.
    majorationHeureSup: nombre(process.env.MAJORATION_HEURE_SUP, 1.15),

    /**
     * Majorations par catégorie d'heure supplémentaire (voir
     * `tempsTravail.ventilerHeuresSup`). Valeurs du décret n° 96-203 du
     * 7 mars 1996 relatif à la durée du travail, à confirmer comme les autres
     * taux : 15 % de la 41e à la 46e heure, 50 % au-delà, 75 % la nuit ou le
     * jour d'un dimanche ou d'un férié, 100 % la nuit d'un dimanche ou d'un férié.
     */
    majorationsHeuresSup: {
        h15: nombre(process.env.MAJORATION_HS_PREMIERES, 1.15),
        h50: nombre(process.env.MAJORATION_HS_SUIVANTES, 1.50),
        h75: nombre(process.env.MAJORATION_HS_NUIT_OU_REPOS, 1.75),
        h100: nombre(process.env.MAJORATION_HS_NUIT_DE_REPOS, 2.00)
    },
    heuresMensuelles: nombre(process.env.HEURES_MENSUELLES, 173.33),

    // Jours ouvrés servant au prorata d'une absence non rémunérée.
    joursOuvres: nombre(process.env.JOURS_OUVRES_MOIS, 26),

    /**
     * Prime d'ancienneté.
     *
     * La convention collective interprofessionnelle la rend due au-delà de
     * deux ans : un pourcentage du salaire de base par année d'ancienneté,
     * plafonné. Elle était absente du calcul, alors que l'application connaît
     * toutes les dates d'embauche — elle était donc soit saisie à la main dans
     * le champ « prime » chaque mois, soit pas versée du tout, la dette
     * s'accumulant en silence jusqu'au départ ou au contrôle.
     */
    primeAncienneteTaux: nombre(process.env.PRIME_ANCIENNETE_TAUX, 0.01),
    primeAncienneteSeuilAnnees: nombre(process.env.PRIME_ANCIENNETE_SEUIL_ANNEES, 2),
    primeAnciennetePlafondAnnees: nombre(process.env.PRIME_ANCIENNETE_PLAFOND_ANNEES, 25)
};

/**
 * La prime d'ancienneté est-elle appliquée ?
 *
 * Elle est **désactivée par défaut**, et ce n'est pas une position sur le
 * droit : `runPayroll` inscrit les bulletins directement comme approuvés,
 * sans étape de relecture. L'activer d'office changerait, dès la prochaine
 * paie, ce que touchent les salariés — sans que personne ne l'ait décidé.
 *
 * Tant qu'elle est inactive, la paie calcule et **annonce** ce qu'elle
 * ajouterait, pour que la décision se prenne sur un montant connu.
 */
const PRIME_ANCIENNETE_ACTIVE = String(process.env.PRIME_ANCIENNETE_ACTIVE || '').toLowerCase() === 'true';

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
/**
 * Ancienneté en années révolues à une date donnée.
 * @returns {number|null} null si la date d'embauche est inconnue ou invalide.
 */
function anneesAnciennete(hireDate, reference = new Date()) {
    if (!hireDate) return null;
    const embauche = new Date(hireDate);
    const a = new Date(reference);
    if (isNaN(embauche.getTime()) || isNaN(a.getTime()) || embauche > a) return null;

    let annees = a.getFullYear() - embauche.getFullYear();
    const anniversairePasse =
        a.getMonth() > embauche.getMonth()
        || (a.getMonth() === embauche.getMonth() && a.getDate() >= embauche.getDate());
    if (!anniversairePasse) annees--;
    return Math.max(annees, 0);
}

/**
 * Prime d'ancienneté due, en années révolues et non prorata temporis : elle
 * s'acquiert au franchissement d'un anniversaire, pas mois par mois.
 *
 * @returns {{montant:number, annees:number|null, anneesRetenues:number, due:boolean, motif:string|null}}
 */
function calculerPrimeAnciennete(baseSalary, hireDate, reference = new Date()) {
    const base = nombre(baseSalary, 0);
    const annees = anneesAnciennete(hireDate, reference);

    if (annees === null) {
        return {
            montant: 0, annees: null, anneesRetenues: 0, due: false,
            motif: "Date d'embauche inconnue : l'ancienneté n'est pas calculable."
        };
    }
    if (annees < TAUX.primeAncienneteSeuilAnnees) {
        return {
            montant: 0, annees, anneesRetenues: 0, due: false,
            motif: `Ancienneté de ${annees} an(s), inférieure au seuil de `
                + `${TAUX.primeAncienneteSeuilAnnees} an(s).`
        };
    }

    const anneesRetenues = Math.min(annees, TAUX.primeAnciennetePlafondAnnees);
    return {
        montant: Math.round(base * TAUX.primeAncienneteTaux * anneesRetenues),
        annees,
        anneesRetenues,
        due: true,
        motif: annees > TAUX.primeAnciennetePlafondAnnees
            ? `Ancienneté plafonnée à ${TAUX.primeAnciennetePlafondAnnees} ans.`
            : null
    };
}

/**
 * Ventilation d'heures supplémentaires, nettoyée.
 * @returns {{h15:number,h50:number,h75:number,h100:number}|null} null si absente ou nulle.
 */
function normaliserVentilation(detail) {
    if (!detail || typeof detail !== 'object') return null;
    const v = {};
    let somme = 0;
    for (const c of Object.keys(TAUX.majorationsHeuresSup)) {
        v[c] = Math.max(nombre(detail[c], 0), 0);
        somme += v[c];
    }
    return somme > 0 ? v : null;
}

function calculerPaie({ baseSalary, bonus, overtimeHours, heuresSupDetail, leaveDays, deductions, hireDate, periode } = {}) {
    const base = nombre(baseSalary, 0);
    const primes = nombre(bonus, 0);
    const ventilation = normaliserVentilation(heuresSupDetail);
    const heuresSup = ventilation
        ? Object.values(ventilation).reduce((s, h) => s + h, 0)
        : nombre(overtimeHours, 0);
    const joursAbsence = nombre(leaveDays, 0);
    const retenuesDiverses = nombre(deductions, 0);

    // Les heures supplémentaires sont une quantité, pas un montant : l'export
    // comptable les additionnait telles quelles au brut, ce qui ajoutait
    // 10 FCFA pour 10 heures effectuées.
    //
    // Ventilées, chaque catégorie porte sa majoration. Saisies en un seul
    // total, elles gardent le taux unique : on ne devine pas la part de nuit.
    const tauxHoraire = base / TAUX.heuresMensuelles;
    const montantHeuresSup = base > 0 && heuresSup > 0
        ? (ventilation
            ? tauxHoraire * Object.entries(ventilation)
                .reduce((s, [c, h]) => s + h * TAUX.majorationsHeuresSup[c], 0)
            : tauxHoraire * TAUX.majorationHeureSup * heuresSup)
        : 0;

    const retenueAbsence = base > 0 && joursAbsence > 0
        ? (base / TAUX.joursOuvres) * joursAbsence
        : 0;

    // Prime d'ancienneté : calculée dans tous les cas, ajoutée au brut
    // seulement si elle est activée. `annoncee` porte ce qu'elle vaudrait, pour
    // que la décision de l'activer se prenne sur un montant connu.
    const anciennete = calculerPrimeAnciennete(base, hireDate, periode ? new Date(periode) : new Date());
    const primeAnciennete = PRIME_ANCIENNETE_ACTIVE ? anciennete.montant : 0;

    const brut = Math.max(base + montantHeuresSup - retenueAbsence + primes + primeAnciennete, 0);

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
        primeAnciennete,
        anciennete: {
            ...anciennete,
            active: PRIME_ANCIENNETE_ACTIVE,
            // Montant non versé faute d'activation : la dette qui s'accumule.
            annoncee: PRIME_ANCIENNETE_ACTIVE ? 0 : anciennete.montant
        },
        overtimeHours: heuresSup,
        // undefined plutôt que null : Prisma refuse null sur une colonne JSON.
        heuresSupDetail: ventilation || undefined,
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
 * Colonnes du bulletin, extraites d'un calcul.
 *
 * `calculerPaie` renvoie aussi ce qui décrit le poste ou explique le calcul —
 * coût employeur, détail de l'ancienneté — qui ne sont pas des colonnes de
 * `Payroll`. Étaler le résultat dans une création Prisma échoue donc, et
 * échouera de nouveau au prochain champ ajouté. Ce filtre existe pour que
 * l'appelant n'ait pas à connaître la liste.
 */
const CHAMPS_BULLETIN = [
    'baseSalary', 'bonus', 'primeAnciennete', 'overtimeHours', 'heuresSupDetail', 'overtimeAmount',
    'leaveDays', 'leaveDeduction', 'grossSalary', 'cnpsEmployee', 'cmu',
    'taxableIncome', 'its', 'deductions', 'employeeContributions',
    'employerContributions', 'netSalary'
];

function colonnesBulletin(calcul) {
    return Object.fromEntries(
        CHAMPS_BULLETIN.filter((c) => calcul[c] !== undefined).map((c) => [c, calcul[c]])
    );
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

module.exports = {
    calculerPaie, calculerITS, decomposer, intervalleMois, normaliserVentilation,
    anneesAnciennete, calculerPrimeAnciennete, colonnesBulletin, CHAMPS_BULLETIN,
    TAUX, TRANCHES_ITS, PRIME_ANCIENNETE_ACTIVE
};
