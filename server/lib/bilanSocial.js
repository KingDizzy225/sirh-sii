const prisma = require('../prismaClient');

/**
 * Bilan social annuel.
 *
 * Toutes les données étaient là — effectifs, mouvements, absences, formation,
 * accidents, rémunérations — et aucune n'était rassemblée. Chaque chiffre
 * demandé par l'inspection ou par la direction se reconstituait à la main,
 * différemment selon qui le reconstituait.
 *
 * **Ce document n'est pas un formulaire.** Le bilan social a, dans certaines
 * branches, un modèle imposé. L'application produit l'état des chiffres que
 * l'entreprise détient, avec la définition de chacun ; elle ne prétend pas
 * remplir un gabarit qu'elle ne connaît pas.
 *
 * **Chaque indicateur porte sa définition.** Un effectif « à fin d'exercice »
 * et un effectif « moyen » ne donnent pas le même nombre, et un taux
 * d'absentéisme change du simple au double selon qu'on compte les congés
 * payés. Les définitions retenues sont écrites dans le résultat, pour que le
 * lecteur sache ce qu'il compare.
 */

const AVERTISSEMENT = "État des données détenues par l'entreprise, accompagné de la définition de "
    + "chaque indicateur. Ce n'est pas le formulaire réglementaire d'une branche : aucun gabarit "
    + "officiel n'est reproduit.";

const DEFINITIONS = {
    effectifFin: "Salariés dont le contrat n'est pas terminé au 31 décembre de l'exercice.",
    effectifMoyen: "Moyenne des effectifs présents au dernier jour de chaque mois de l'exercice.",
    entrees: "Salariés dont la date d'embauche tombe dans l'exercice.",
    sorties: "Salariés dont la date de sortie tombe dans l'exercice.",
    rotation: "Moyenne des entrées et des sorties, rapportée à l'effectif moyen.",
    absenteisme: "Jours de congés maladie et d'absences non justifiées, rapportés aux jours "
        + "théoriquement travaillés (effectif moyen × jours ouvrés). Les congés payés en sont exclus.",
    formation: "Heures de formation suivies dans l'exercice, comptées par participation.",
    accidents: "Accidents du travail survenus dans l'exercice, hors presque-accidents.",
    masseSalariale: "Somme des bruts des bulletins enregistrés de l'exercice.",
    ecartRemuneration: "Écart entre le salaire de base moyen des hommes et celui des femmes, "
        + "rapporté au salaire moyen des hommes. Un écart positif est en faveur des hommes."
};

const JOURS_OUVRES_AN = Math.max(parseInt(process.env.BILAN_JOURS_OUVRES_AN, 10) || 260, 1);
const arrondir = (n, d = 2) => {
    const f = Math.pow(10, d);
    return Math.round((Number(n) || 0) * f) / f;
};
const pourcent = (part, total) => (total > 0 ? arrondir((part / total) * 100, 1) : null);

/** Effectif présent à une date. Fonction pure. */
function presentsA(salaries, date) {
    const t = new Date(date).getTime();
    return salaries.filter((s) => {
        const entre = s.hireDate ? new Date(s.hireDate).getTime() <= t : true;
        const sorti = s.exitDate ? new Date(s.exitDate).getTime() < t : false;
        return entre && !sorti;
    }).length;
}

/** Effectif moyen sur douze fins de mois. Fonction pure. */
function effectifMoyen(salaries, annee) {
    const mesures = [];
    for (let m = 0; m < 12; m += 1) {
        mesures.push(presentsA(salaries, new Date(Date.UTC(annee, m + 1, 0))));
    }
    return arrondir(mesures.reduce((a, b) => a + b, 0) / 12, 1);
}

/** Répartition par clé, triée du plus nombreux au moins nombreux. Fonction pure. */
function repartition(liste, cle) {
    const compte = new Map();
    for (const item of liste) {
        const valeur = item[cle] || 'Non renseigné';
        compte.set(valeur, (compte.get(valeur) || 0) + 1);
    }
    return [...compte.entries()]
        .map(([libelle, nombre]) => ({ libelle, nombre }))
        .sort((a, b) => b.nombre - a.nombre);
}

async function produire(annee = new Date().getFullYear() - 1) {
    const debut = new Date(Date.UTC(annee, 0, 1));
    const fin = new Date(Date.UTC(annee, 11, 31, 23, 59, 59));

    const salaries = await prisma.employee.findMany({
        select: {
            id: true, gender: true, birthDate: true, hireDate: true, exitDate: true,
            contractType: true, department: true, status: true, baseSalary: true
        }
    });

    const presentsFin = salaries.filter((s) => {
        const entre = s.hireDate ? new Date(s.hireDate) <= fin : true;
        const sorti = s.exitDate ? new Date(s.exitDate) <= fin : false;
        return entre && !sorti;
    });
    const moyen = effectifMoyen(salaries, annee);

    const entrees = salaries.filter((s) => s.hireDate && new Date(s.hireDate) >= debut && new Date(s.hireDate) <= fin);
    const sorties = salaries.filter((s) => s.exitDate && new Date(s.exitDate) >= debut && new Date(s.exitDate) <= fin);

    const conges = await prisma.leave.findMany({
        where: { status: 'Approved', startDate: { gte: debut, lte: fin } },
        select: { type: true, durationDays: true }
    });
    const joursMaladie = conges.filter((c) => c.type === 'Sick').reduce((s, c) => s + (c.durationDays || 0), 0);
    const joursConges = conges.filter((c) => c.type === 'Annual').reduce((s, c) => s + (c.durationDays || 0), 0);

    const absences = await prisma.absence.count({
        where: { date: { gte: debut, lte: fin }, type: 'Absence non justifiée' }
    });

    const participations = await prisma.trainingParticipation.findMany({
        where: { session: { date: { gte: debut, lte: fin } } },
        select: { employeeId: true, session: { select: { durationHours: true } } }
    });
    const heuresFormation = participations.reduce((s, p) => s + (p.session?.durationHours || 0), 0);

    const accidents = await prisma.workAccident.findMany({
        where: { occurredAt: { gte: debut, lte: fin }, type: { not: 'Presque-accident' } },
        select: { severity: true, daysOff: true, declaredToCnps: true }
    });

    const bulletins = await prisma.payroll.findMany({
        where: { period: { gte: debut, lte: fin } },
        select: { grossSalary: true, baseSalary: true, employerContributions: true }
    });
    const masse = bulletins.reduce((s, b) => s + (b.grossSalary != null ? b.grossSalary : b.baseSalary || 0), 0);

    // Écart de rémunération : calculé sur les salaires de base connus, et
    // annoncé comme tel. Le déduire des bulletins ferait varier l'écart avec
    // les heures supplémentaires du mois.
    const hommes = presentsFin.filter((s) => s.gender === 'M' && s.baseSalary > 0);
    const femmes = presentsFin.filter((s) => s.gender === 'F' && s.baseSalary > 0);
    const moyenne = (liste) => (liste.length ? liste.reduce((s, e) => s + e.baseSalary, 0) / liste.length : null);
    const moyenneH = moyenne(hommes);
    const moyenneF = moyenne(femmes);

    const joursTheoriques = moyen * JOURS_OUVRES_AN;

    return {
        annee,
        avertissement: AVERTISSEMENT,
        definitions: DEFINITIONS,
        effectifs: {
            finExercice: presentsFin.length,
            moyen,
            femmes: presentsFin.filter((s) => s.gender === 'F').length,
            hommes: presentsFin.filter((s) => s.gender === 'M').length,
            partFemmes: pourcent(presentsFin.filter((s) => s.gender === 'F').length, presentsFin.length),
            parContrat: repartition(presentsFin, 'contractType'),
            parDepartement: repartition(presentsFin, 'department')
        },
        mouvements: {
            entrees: entrees.length,
            sorties: sorties.length,
            rotationPct: moyen > 0 ? arrondir(((entrees.length + sorties.length) / 2 / moyen) * 100, 1) : null
        },
        absenteisme: {
            joursMaladie: arrondir(joursMaladie, 1),
            joursCongesPayes: arrondir(joursConges, 1),
            absencesNonJustifiees: absences,
            joursTheoriques: arrondir(joursTheoriques, 0),
            tauxPct: joursTheoriques > 0 ? arrondir(((joursMaladie + absences) / joursTheoriques) * 100, 2) : null
        },
        formation: {
            participations: participations.length,
            salariesFormes: new Set(participations.map((p) => p.employeeId)).size,
            heures: arrondir(heuresFormation, 1),
            heuresParSalarie: moyen > 0 ? arrondir(heuresFormation / moyen, 1) : null
        },
        securite: {
            accidents: accidents.length,
            graves: accidents.filter((a) => a.severity === 'Grave').length,
            joursArret: accidents.reduce((s, a) => s + (a.daysOff || 0), 0),
            nonDeclares: accidents.filter((a) => !a.declaredToCnps).length
        },
        remuneration: {
            masseSalarialeBrute: arrondir(masse, 0),
            chargesPatronales: arrondir(bulletins.reduce((s, b) => s + (b.employerContributions || 0), 0), 0),
            bulletins: bulletins.length,
            salaireMoyenHommes: moyenneH == null ? null : arrondir(moyenneH, 0),
            salaireMoyenFemmes: moyenneF == null ? null : arrondir(moyenneF, 0),
            // Null plutôt que zéro quand un des deux groupes est vide : un
            // écart inconnu n'est pas un écart nul.
            ecartPct: moyenneH && moyenneF ? arrondir(((moyenneH - moyenneF) / moyenneH) * 100, 1) : null
        },
        // Ce qui empêche de lire certains chiffres, dit ici plutôt que masqué
        // par une valeur par défaut.
        reserves: [
            ...(bulletins.length === 0 ? ["Aucun bulletin enregistré sur l'exercice : la masse salariale est vide."] : []),
            ...(moyenneH == null || moyenneF == null
                ? ["L'écart de rémunération demande des salaires connus dans les deux groupes."] : []),
            ...(presentsFin.some((s) => !s.gender)
                ? ['Des salariés sans genre renseigné ne sont comptés dans aucune répartition par sexe.'] : [])
        ]
    };
}

module.exports = { AVERTISSEMENT, DEFINITIONS, JOURS_OUVRES_AN, presentsA, effectifMoyen, repartition, produire };
