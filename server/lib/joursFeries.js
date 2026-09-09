/**
 * Jours fériés et décompte en jours ouvrables.
 *
 * L'application créditait les congés en **jours ouvrables** — 2,2 par mois de
 * travail effectif, la règle applicable — et les débitait en **jours
 * calendaires**. Un congé du vendredi au lundi retirait quatre jours au lieu
 * de deux ; deux semaines en coûtaient quatorze au lieu de douze. Le solde
 * ainsi surconsommé alimentait ensuite le solde de tout compte, si bien que le
 * salarié partait avec moins d'indemnité compensatrice qu'il ne lui était dû.
 *
 * Aucun jour férié n'était par ailleurs connu : le 7 août se décomptait comme
 * un jour de congé ordinaire.
 *
 * **Ce qui se calcule et ce qui se décrète.** Les fêtes fixes et les fêtes
 * chrétiennes mobiles se déduisent du calendrier. Les fêtes musulmanes suivent
 * le calendrier lunaire et sont, en Côte d'Ivoire, **fixées par décret** peu de
 * temps avant : aucune formule ne les donne de façon fiable. Elles doivent donc
 * être saisies, et l'application dit lesquelles manquent plutôt que d'avancer
 * une date approximative — un jour férié inventé fausserait chaque congé qui le
 * traverse.
 */

/**
 * Convention de décompte.
 *
 * « LUNDI_SAMEDI » correspond aux jours ouvrables : c'est la base des 2,2 jours
 * acquis par mois (26,4 par an). « LUNDI_VENDREDI » correspond aux jours
 * ouvrés, pour une entreprise qui ne travaille pas le samedi. Le choix doit
 * suivre celui qui a servi à fixer l'acquisition, faute de quoi le compteur
 * redeviendrait incohérent avec lui-même.
 */
const CONVENTION = (process.env.CONGES_CONVENTION || 'LUNDI_SAMEDI').toUpperCase();
const SAMEDI_OUVRABLE = CONVENTION !== 'LUNDI_VENDREDI';

const JOUR = 24 * 3600 * 1000;

/** Clé « AAAA-MM-JJ » en temps local, pour comparer des dates sans leur heure. */
const cleJour = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

/**
 * Dimanche de Pâques, par l'algorithme de Meeus/Jones/Butcher (grégorien).
 * Il fonde le lundi de Pâques, l'Ascension et le lundi de Pentecôte.
 */
function paques(annee) {
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois - 1, jour);
}

const ajouter = (date, jours) => new Date(date.getTime() + jours * JOUR);

/** Fêtes légales à date fixe. */
function feriesFixes(annee) {
    return [
        { date: new Date(annee, 0, 1), libelle: "Jour de l'An" },
        { date: new Date(annee, 4, 1), libelle: 'Fête du Travail' },
        { date: new Date(annee, 7, 7), libelle: "Fête de l'Indépendance" },
        { date: new Date(annee, 7, 15), libelle: 'Assomption' },
        { date: new Date(annee, 10, 1), libelle: 'Toussaint' },
        { date: new Date(annee, 10, 15), libelle: 'Journée nationale de la Paix' },
        { date: new Date(annee, 11, 25), libelle: 'Noël' }
    ].map((f) => ({ ...f, source: 'LEGAL_FIXE' }));
}

/** Fêtes chrétiennes mobiles, déduites de Pâques. */
function feriesMobilesChretiennes(annee) {
    const p = paques(annee);
    return [
        { date: ajouter(p, 1), libelle: 'Lundi de Pâques' },
        { date: ajouter(p, 39), libelle: 'Ascension' },
        { date: ajouter(p, 50), libelle: 'Lundi de Pentecôte' }
    ].map((f) => ({ ...f, source: 'LEGAL_MOBILE' }));
}

/**
 * Fêtes musulmanes attendues dans l'année.
 *
 * Leurs dates ne sont pas calculées : elles dépendent de l'observation lunaire
 * et sont arrêtées par décret. On énumère ce qui est attendu pour que
 * l'application puisse signaler ce qui n'a pas été saisi — c'est la seule
 * chose honnête qu'elle puisse en dire.
 */
const FETES_A_DECRETER = [
    { code: 'AID_EL_FITR', libelle: 'Fête de fin du Ramadan (Aïd el-Fitr)' },
    { code: 'AID_EL_KEBIR', libelle: 'Fête de la Tabaski (Aïd el-Kébir)' },
    { code: 'MAOULOUD', libelle: 'Anniversaire de la naissance du Prophète (Maouloud)' },
    { code: 'LAYLAT_AL_QADR', libelle: 'Nuit du Destin (Laylat al-Qadr)' }
];

/** Fériés calculables d'une année, triés. */
function feriesCalculables(annee) {
    return [...feriesFixes(annee), ...feriesMobilesChretiennes(annee)]
        .sort((a, b) => a.date - b.date);
}

/** Index « AAAA-MM-JJ » → libellé, à partir d'une liste de fériés. */
function indexer(feries = []) {
    const index = new Map();
    for (const f of feries) {
        const d = f.date ? new Date(f.date) : null;
        if (d && !isNaN(d.getTime())) index.set(cleJour(d), f.libelle || 'Jour férié');
    }
    return index;
}

/** Vrai si la date tombe un jour habituellement travaillé. */
function estJourTravaille(date) {
    const j = new Date(date).getDay(); // 0 = dimanche
    if (j === 0) return false;
    if (j === 6) return SAMEDI_OUVRABLE;
    return true;
}

/**
 * Jours ouvrables entre deux dates incluses, fériés déduits.
 *
 * @param {Date|string} debut
 * @param {Date|string} fin
 * @param {Map|Array} feries  index produit par `indexer`, ou liste brute
 * @returns {{jours:number, detail:Array, feriesTraverses:Array}}
 */
function joursOuvrables(debut, fin, feries = new Map()) {
    const index = feries instanceof Map ? feries : indexer(feries);
    const d = new Date(debut);
    const f = new Date(fin);

    if (isNaN(d.getTime()) || isNaN(f.getTime()) || f < d) {
        return { jours: 0, detail: [], feriesTraverses: [], invalide: true };
    }

    // Les heures sont écartées : un congé se compte en jours, et une demande
    // saisie à 14 h ne doit pas valoir une demi-journée de moins.
    const debutJour = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const finJour = new Date(f.getFullYear(), f.getMonth(), f.getDate());

    const detail = [];
    const feriesTraverses = [];
    let jours = 0;

    for (let t = debutJour.getTime(); t <= finJour.getTime(); t += JOUR) {
        const jour = new Date(t);
        const cle = cleJour(jour);
        const ferie = index.get(cle) || null;
        const travaille = estJourTravaille(jour);

        if (ferie && travaille) feriesTraverses.push({ date: cle, libelle: ferie });

        const compte = travaille && !ferie;
        if (compte) jours++;
        detail.push({ date: cle, compte, ferie, jourDeSemaine: jour.getDay() });
    }

    return { jours, detail, feriesTraverses, invalide: false };
}

/** Nombre de jours calendaires, tel que le comptait l'ancien calcul. */
function joursCalendaires(debut, fin) {
    const d = new Date(debut);
    const f = new Date(fin);
    if (isNaN(d.getTime()) || isNaN(f.getTime())) return 0;
    return Math.ceil(Math.abs(f - d) / JOUR) + 1;
}

/**
 * Fêtes à décréter qui n'ont pas été saisies pour une année.
 *
 * L'application ne les invente pas ; elle dit lesquelles manquent, pour que la
 * RH les saisisse dès parution du décret.
 */
function fetesManquantes(annee, feriesEnregistres = []) {
    const libelles = feriesEnregistres
        .filter((f) => new Date(f.date).getFullYear() === annee)
        .map((f) => (f.libelle || '').toLowerCase());

    return FETES_A_DECRETER.filter((fete) => {
        const mots = fete.libelle.toLowerCase().split(/[\s()']+/).filter((m) => m.length > 4);
        return !libelles.some((l) => mots.some((mot) => l.includes(mot)));
    });
}

module.exports = {
    CONVENTION, SAMEDI_OUVRABLE, FETES_A_DECRETER,
    paques, feriesFixes, feriesMobilesChretiennes, feriesCalculables,
    indexer, estJourTravaille, joursOuvrables, joursCalendaires,
    fetesManquantes, cleJour
};
