/**
 * Droits à congés payés — source unique de vérité.
 *
 * Le solde de congés était jusqu'ici un forfait : le schéma posait 30 jours par
 * défaut, et rien, ni la création manuelle ni l'import en masse, ne renseignait
 * ce champ. Tout salarié démarrait donc avec une année entière de congés
 * acquis, quelle que soit sa date d'embauche — un salarié embauché il y a trois
 * mois comme un ancien de dix ans, qui perdait au passage tout son report.
 *
 * Ce n'est pas un compteur d'affichage : il est valorisé en francs au départ du
 * salarié (offboardingController, indemnité compensatrice de congés payés) et
 * il est désormais énoncé au salarié par l'assistant RH et par WhatsApp.
 *
 * Les barèmes ci-dessous sont ceux du Code du travail ivoirien et de la
 * convention collective interprofessionnelle. Ils sont donnés comme valeurs par
 * défaut et non comme certitudes : une convention de branche peut être plus
 * favorable. Chacun est réglable par variable d'environnement, sans
 * redéploiement, et le solde proposé au moment de la reprise reste modifiable
 * par la RH — l'application propose, la RH décide.
 */

// Acquisition de base : 2,2 jours ouvrables par mois de travail effectif
// (art. 25.1), soit 26,4 jours par an.
const JOURS_PAR_MOIS = parseFloat(process.env.LEAVE_ACCRUAL_DAYS_PER_MONTH || '2.2');

// Plafond de cumul. Évite qu'un compte inactif accumule indéfiniment, et borne
// ce qui serait payé au départ.
const SOLDE_MAX = parseFloat(process.env.LEAVE_MAX_BALANCE || '60');

/**
 * Congé supplémentaire d'ancienneté, en jours ouvrables par an.
 * Format de la variable : "5:1,10:2,15:3" — années révolues : jours ajoutés.
 * Le barème s'applique par tranche atteinte, pas par cumul.
 */
const BAREME_ANCIENNETE = lireBareme(
    process.env.LEAVE_SENIORITY_SCALE || '5:1,10:2,15:3,20:4,25:5,30:6'
);

// Congé supplémentaire pour enfant à charge de moins de 14 ans.
// La règle usuelle vise les mères ; LEAVE_CHILD_BONUS_GENDER accepte "F", "M"
// ou "TOUS" pour les conventions qui l'étendent aux deux parents.
const JOURS_PAR_ENFANT = parseFloat(process.env.LEAVE_DAYS_PER_CHILD || '2');

// Période de référence des congés : "ANNIVERSAIRE" (défaut) ou une date fixe au
// format MM-JJ pour les entreprises qui retiennent une période commune.
const PERIODE_REFERENCE = (process.env.LEAVE_REFERENCE_YEAR_START || 'ANNIVERSAIRE')
    .trim().toUpperCase();
const GENRE_MAJORATION_ENFANT = (process.env.LEAVE_CHILD_BONUS_GENDER || 'F').toUpperCase();

function lireBareme(texte) {
    return String(texte)
        .split(',')
        .map((tranche) => {
            const [annees, jours] = tranche.split(':');
            return { annees: parseFloat(annees), jours: parseFloat(jours) };
        })
        .filter((t) => Number.isFinite(t.annees) && Number.isFinite(t.jours))
        // Décroissant : la première tranche atteinte est la plus favorable.
        .sort((a, b) => b.annees - a.annees);
}

const enDate = (valeur) => {
    if (!valeur) return null;
    const d = valeur instanceof Date ? valeur : new Date(valeur);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Nombre de mois entiers écoulés entre deux dates.
 *
 * Un mois n'est compté que s'il est révolu : un salarié embauché le 20 août
 * n'a pas acquis son mois de septembre le 5 septembre. Compter les mois
 * calendaires aurait crédité un jour d'embauche en fin de mois comme un mois
 * complet.
 */
function moisRevolus(debut, fin) {
    const d = enDate(debut);
    const f = enDate(fin) || new Date();
    if (!d || f < d) return 0;

    let mois = (f.getFullYear() - d.getFullYear()) * 12 + (f.getMonth() - d.getMonth());
    if (f.getDate() < d.getDate()) mois -= 1;
    return Math.max(mois, 0);
}

/** Ancienneté en années révolues. */
function anciennete(hireDate, reference = new Date()) {
    return Math.floor(moisRevolus(hireDate, reference) / 12);
}

/**
 * Début de l'année de référence en cours pour un salarié.
 *
 * Les congés s'acquièrent sur une période de référence de douze mois, non
 * depuis l'embauche : compter depuis l'embauche donnerait 303 jours à un ancien
 * de dix ans, un chiffre que le plafond ramènerait à 60 — un nombre inventé,
 * présenté avec l'autorité d'un calcul.
 *
 * Par défaut la période court d'anniversaire d'embauche à anniversaire
 * d'embauche. Les entreprises qui retiennent une période fixe la déclarent dans
 * LEAVE_REFERENCE_YEAR_START au format MM-JJ (par exemple "01-01").
 */
function debutAnneeReference(hireDate, reference = new Date()) {
    const embauche = enDate(hireDate);
    const ref = enDate(reference) || new Date();
    if (!embauche) return null;

    let debut;
    if (PERIODE_REFERENCE === 'ANNIVERSAIRE') {
        debut = new Date(ref.getFullYear(), embauche.getMonth(), embauche.getDate());
        if (debut > ref) debut.setFullYear(debut.getFullYear() - 1);
    } else {
        const [mois, jour] = PERIODE_REFERENCE.split('-').map(Number);
        debut = new Date(ref.getFullYear(), (mois || 1) - 1, jour || 1);
        if (debut > ref) debut.setFullYear(debut.getFullYear() - 1);
    }

    // Un salarié embauché en cours de période n'acquiert qu'à compter de son
    // embauche, jamais depuis un début de période antérieur à son arrivée.
    return debut < embauche ? embauche : debut;
}

/**
 * Jours acquis sur l'année de référence en cours, hors majorations et hors
 * congés pris.
 */
function acquisitionAnneeReference(hireDate, reference = new Date()) {
    const debut = debutAnneeReference(hireDate, reference);
    if (!debut) return 0;
    return arrondir(moisRevolus(debut, reference) * JOURS_PAR_MOIS);
}

/** Congé supplémentaire d'ancienneté pour l'année en cours. */
function majorationAnciennete(hireDate, reference = new Date()) {
    const annees = anciennete(hireDate, reference);
    const tranche = BAREME_ANCIENNETE.find((t) => annees >= t.annees);
    return tranche ? tranche.jours : 0;
}

/** Congé supplémentaire pour enfants à charge, pour l'année en cours. */
function majorationEnfants({ gender, childrenCount } = {}) {
    const enfants = Number(childrenCount) || 0;
    if (enfants <= 0) return 0;

    if (GENRE_MAJORATION_ENFANT !== 'TOUS') {
        const g = String(gender || '').trim().toUpperCase();
        // Le genre est saisi librement ("F", "Femme", "Féminin", ou rien) :
        // on ne majore que sur une correspondance explicite, faute de quoi on
        // attribuerait des jours sur une supposition.
        const correspond = g.startsWith(GENRE_MAJORATION_ENFANT) ||
            (GENRE_MAJORATION_ENFANT === 'F' && (g.startsWith('FEMME') || g.startsWith('FÉM') || g.startsWith('FEM')));
        if (!correspond) return 0;
    }
    return arrondir(enfants * JOURS_PAR_ENFANT);
}

/** Total des congés supplémentaires annuels d'un salarié. */
function congesSupplementaires(salarie, reference = new Date()) {
    return arrondir(
        majorationAnciennete(salarie && salarie.hireDate, reference) +
        majorationEnfants(salarie || {})
    );
}

const arrondir = (n) => Math.round((Number(n) || 0) * 10) / 10;

/**
 * Solde d'ouverture d'un salarié — à la création, à l'import, ou lors d'une
 * reprise de données.
 *
 * Deux origines possibles, et le résultat dit toujours laquelle :
 *  - REPRISE : la RH fournit le solde que reconnaissait le système précédent ou
 *    le registre papier. Il fait foi, parce qu'il engage l'entreprise vis-à-vis
 *    du salarié — un calcul, si juste soit-il, ne peut pas le contredire.
 *  - CALCUL  : à défaut, acquisition depuis l'embauche, majorations de l'année
 *    en cours ajoutées, congés déjà pris déduits.
 *
 * @returns {{solde:number, source:'REPRISE'|'CALCUL', detail:object, plafonne:boolean}}
 */
function soldeOuverture({
    hireDate,
    gender,
    childrenCount,
    joursPris = 0,
    soldeRepris = null,
    reference = new Date()
} = {}) {
    const repris = soldeRepris === null || soldeRepris === undefined || soldeRepris === ''
        ? null
        : Number(soldeRepris);

    if (repris !== null && Number.isFinite(repris)) {
        const solde = Math.min(Math.max(arrondir(repris), 0), SOLDE_MAX);
        return {
            solde,
            source: 'REPRISE',
            plafonne: solde < arrondir(repris),
            detail: { soldeRepris: arrondir(repris), plafond: SOLDE_MAX }
        };
    }

    const acquis = acquisitionAnneeReference(hireDate, reference);
    const ancien = majorationAnciennete(hireDate, reference);
    const enfants = majorationEnfants({ gender, childrenCount });
    const pris = Math.max(arrondir(joursPris), 0);

    const brut = arrondir(acquis + ancien + enfants - pris);
    const solde = Math.min(Math.max(brut, 0), SOLDE_MAX);

    return {
        solde,
        source: 'CALCUL',
        plafonne: solde < brut,
        detail: {
            debutAnneeReference: debutAnneeReference(hireDate, reference),
            moisAcquis: moisRevolus(debutAnneeReference(hireDate, reference), reference),
            joursParMois: JOURS_PAR_MOIS,
            acquis,
            majorationAnciennete: ancien,
            majorationEnfants: enfants,
            joursPris: pris,
            plafond: SOLDE_MAX
        }
    };
}

module.exports = {
    JOURS_PAR_MOIS,
    SOLDE_MAX,
    BAREME_ANCIENNETE,
    JOURS_PAR_ENFANT,
    PERIODE_REFERENCE,
    moisRevolus,
    anciennete,
    debutAnneeReference,
    acquisitionAnneeReference,
    majorationAnciennete,
    majorationEnfants,
    congesSupplementaires,
    soldeOuverture
};
