const paie = require('./paie');

/**
 * Mesure de l'absentéisme.
 *
 * Les absences étaient enregistrées, les congés aussi, les pointages depuis le
 * 8 septembre. Rien n'en tirait un taux. Le seul calcul existant était une
 * heuristique enfouie dans les analyses prédictives — « forte absence pour
 * maladie » — qui servait à estimer un risque de départ, pas à piloter. C'est
 * pourtant l'indicateur social le plus regardé, et le seul que l'entreprise ne
 * pouvait pas produire.
 *
 * Trois décisions font la validité du chiffre. Les manquer donne un nombre qui
 * s'affiche et ne veut rien dire.
 *
 *  1. **Un congé payé n'est pas de l'absentéisme.** C'est un droit, il se
 *     planifie, et l'inclure ferait culminer le taux en août pour la meilleure
 *     des raisons. Sont retenus les arrêts maladie, les congés sans solde et
 *     les absences non justifiées. La maternité est exclue : la compter
 *     pénaliserait les services qui emploient des femmes.
 *
 *  2. **Les absences courtes répétées et les arrêts longs ne se mélangent
 *     pas.** Un service à 4 % fait de trois arrêts longs et un service à 4 %
 *     fait de vingt absences d'un jour n'appellent pas la même conversation :
 *     le premier relève de la santé au travail, le second de l'encadrement.
 *     Les additionner en un taux unique fait manquer les deux.
 *
 *  3. **Un arrêt à cheval sur deux mois compte dans les deux.** Un arrêt du
 *     28 janvier au 4 février n'est pas un arrêt de janvier : l'imputer
 *     entièrement à son mois de début produit des pics là où il n'y en a pas.
 *     C'est le même défaut que celui corrigé ce matin sur le flux des entrées
 *     et sorties.
 */

const nombre = (variable, defaut) => {
    const v = parseFloat(process.env[variable]);
    return Number.isFinite(v) ? v : defaut;
};

/**
 * Natures de congé retenues comme absentéisme.
 *
 * Le champ `type` est libre au schéma ; les valeurs ci-dessous sont celles que
 * l'application écrit. Une valeur inconnue est comptée à part plutôt qu'ignorée
 * en silence : un type ajouté demain ne doit pas disparaître du calcul sans que
 * personne s'en aperçoive.
 */
const TYPES_RETENUS = new Set(['Sick', 'Unpaid', 'Maladie', 'Sans solde']);
const TYPES_ECARTES = new Set(['Annual', 'Maternity', 'Congé annuel', 'Maternité']);

/** Durée, en jours, au-delà de laquelle un arrêt cesse d'être « court ». */
const SEUIL_ARRET_COURT = nombre('ABSENTEISME_SEUIL_COURT_JOURS', 3);

/** Nombre d'absences courtes à partir duquel la répétition fait signal. */
const SEUIL_REPETITION = nombre('ABSENTEISME_SEUIL_REPETITION', 3);

/** Mois d'historique en deçà desquels aucune tendance n'est affichée. */
const MOIS_MIN_TENDANCE = nombre('ABSENTEISME_MOIS_MIN_TENDANCE', 3);

const JOUR = 24 * 3600 * 1000;

const cleMois = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};

const libelleMois = (cle) => {
    const [annee, mois] = cle.split('-').map(Number);
    return new Date(annee, mois - 1, 1)
        .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

/**
 * Répartit un arrêt sur les mois qu'il traverse.
 *
 * `durationDays` porte la durée retenue par la RH, qui peut différer du nombre
 * de jours calendaires — jours fériés, demi-journées. On conserve cette durée
 * comme référence et on la répartit au prorata des jours passés dans chaque
 * mois, plutôt que de la recompter : le total doit rester celui que la RH a
 * validé.
 *
 * @returns {Map<string, number>} mois « AAAA-MM » → jours imputés
 */
function repartirParMois(debut, fin, dureeJours) {
    const d = new Date(debut);
    const f = new Date(fin);
    const parMois = new Map();

    if (isNaN(d.getTime()) || isNaN(f.getTime()) || f < d) {
        // Dates incohérentes : l'arrêt est imputé à son mois de début plutôt
        // que perdu, et le signalement se fait au niveau du bilan.
        parMois.set(cleMois(debut), dureeJours);
        return parMois;
    }

    const joursCalendaires = Math.round((f - d) / JOUR) + 1;
    const parJour = dureeJours / joursCalendaires;

    for (let i = 0; i < joursCalendaires; i++) {
        const jour = new Date(d.getTime() + i * JOUR);
        const cle = cleMois(jour);
        parMois.set(cle, (parMois.get(cle) || 0) + parJour);
    }
    return parMois;
}

/** Vrai si ce congé relève de l'absentéisme. */
function retenu(conge) {
    if (conge.status !== 'Approved' && conge.status !== 'Approuvé') return false;
    return TYPES_RETENUS.has(conge.type);
}

/**
 * Bilan d'absentéisme sur une période.
 *
 * @param {object} donnees
 * @param {Array}  donnees.conges      congés bruts (avec employé et service)
 * @param {Array}  donnees.absences    absences ponctuelles
 * @param {Array}  donnees.effectifs   [{ department, actifs }]
 * @param {Array}  donnees.mois        clés « AAAA-MM » couvertes, du plus ancien au plus récent
 */
function bilan({ conges = [], absences = [], effectifs = [], mois = [] } = {}) {
    const joursOuvres = paie.TAUX.joursOuvres;
    const effectifTotal = effectifs.reduce((t, e) => t + e.actifs, 0);

    const parService = new Map(
        effectifs.map((e) => [e.department, {
            service: e.department, actifs: e.actifs,
            jours: 0, arretsCourts: 0, arretsLongs: 0, joursArretsLongs: 0
        }])
    );
    const parMois = new Map(mois.map((m) => [m, { mois: m, libelle: libelleMois(m), jours: 0 }]));

    let joursTotal = 0;
    let arretsCourts = 0;
    let arretsLongs = 0;
    let joursArretsLongs = 0;
    const typesInconnus = new Set();
    const datesIncoherentes = [];
    const repetitions = new Map(); // employeeId → nombre d'arrêts courts

    for (const conge of conges) {
        if (!TYPES_RETENUS.has(conge.type) && !TYPES_ECARTES.has(conge.type)) {
            // Ni retenu ni écarté sciemment : on le signale plutôt que de
            // laisser un type nouveau disparaître du calcul.
            typesInconnus.add(conge.type);
        }
        if (!retenu(conge)) continue;

        const duree = Number(conge.durationDays) || 0;
        if (duree <= 0) continue;

        const court = duree <= SEUIL_ARRET_COURT;
        if (court) {
            arretsCourts++;
            repetitions.set(conge.employeeId, (repetitions.get(conge.employeeId) || 0) + 1);
        } else {
            arretsLongs++;
            joursArretsLongs += duree;
        }

        if (new Date(conge.endDate) < new Date(conge.startDate)) {
            datesIncoherentes.push(conge.id);
        }

        const service = conge.employee?.department || 'Non renseigné';
        const ligneService = parService.get(service);
        if (ligneService) {
            ligneService.jours += duree;
            if (court) ligneService.arretsCourts++;
            else { ligneService.arretsLongs++; ligneService.joursArretsLongs += duree; }
        }

        for (const [cle, part] of repartirParMois(conge.startDate, conge.endDate, duree)) {
            const ligneMois = parMois.get(cle);
            if (ligneMois) ligneMois.jours += part;
        }
        joursTotal += duree;
    }

    // Absences ponctuelles non justifiées : une journée chacune, sauf durée
    // renseignée. Les retards sont comptés à part — arriver en retard n'est pas
    // s'absenter, et les confondre gonflerait le taux sans rien mesurer.
    let retards = 0;
    for (const absence of absences) {
        if (absence.type === 'Retard') { retards++; continue; }
        const jours = absence.durationMinutes
            ? absence.durationMinutes / (60 * 8)
            : 1;

        joursTotal += jours;
        arretsCourts++;
        repetitions.set(absence.employeeId, (repetitions.get(absence.employeeId) || 0) + 1);

        const service = absence.employee?.department || 'Non renseigné';
        const ligneService = parService.get(service);
        if (ligneService) { ligneService.jours += jours; ligneService.arretsCourts++; }

        const ligneMois = parMois.get(cleMois(absence.date));
        if (ligneMois) ligneMois.jours += jours;
    }

    const taux = (jours, actifs, nbMois) => {
        const theoriques = actifs * joursOuvres * nbMois;
        return theoriques > 0 ? Math.round((jours / theoriques) * 1000) / 10 : null;
    };

    const nbMois = Math.max(mois.length, 1);

    return {
        taux: taux(joursTotal, effectifTotal, nbMois),
        joursAbsence: Math.round(joursTotal * 10) / 10,
        joursTheoriques: effectifTotal * joursOuvres * nbMois,
        effectif: effectifTotal,

        // La ventilation qui fait la différence entre deux services au même taux.
        arretsCourts,
        arretsLongs,
        joursArretsLongs: Math.round(joursArretsLongs * 10) / 10,
        retards,
        salariesEnRepetition: [...repetitions.values()]
            .filter((n) => n >= SEUIL_REPETITION).length,

        parService: [...parService.values()]
            .map((s) => ({ ...s, jours: Math.round(s.jours * 10) / 10, taux: taux(s.jours, s.actifs, nbMois) }))
            .sort((a, b) => (b.taux ?? -1) - (a.taux ?? -1)),

        parMois: [...parMois.values()]
            .map((m) => ({ ...m, jours: Math.round(m.jours * 10) / 10, taux: taux(m.jours, effectifTotal, 1) })),

        // Le lecteur doit pouvoir défendre le chiffre : sans son dénominateur,
        // un taux ne se discute pas en réunion.
        formule: `Jours d'absence retenus ÷ (effectif × ${joursOuvres} jours ouvrés × ${nbMois} mois)`,
        perimetre: {
            retenus: 'arrêts maladie, congés sans solde, absences non justifiées',
            ecartes: 'congés annuels et maternité',
            pourquoi: "Un congé payé est un droit qui se planifie : l'inclure ferait culminer "
                + "le taux en août pour la meilleure des raisons. La maternité est écartée "
                + 'pour ne pas pénaliser les services qui emploient des femmes.',
            seuilArretCourt: SEUIL_ARRET_COURT,
            seuilRepetition: SEUIL_REPETITION
        },
        fiabilite: {
            moisCouverts: mois.length,
            tendanceAffichable: mois.length >= MOIS_MIN_TENDANCE,
            motif: mois.length < MOIS_MIN_TENDANCE
                ? `Moins de ${MOIS_MIN_TENDANCE} mois d'historique : aucune tendance n'est affichée.`
                : null,
            typesInconnus: [...typesInconnus],
            datesIncoherentes: datesIncoherentes.length
        }
    };
}

module.exports = {
    bilan, repartirParMois, retenu, cleMois, libelleMois,
    TYPES_RETENUS, TYPES_ECARTES, SEUIL_ARRET_COURT, SEUIL_REPETITION, MOIS_MIN_TENDANCE
};
