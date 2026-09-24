/**
 * Indicateurs RH calculés sur l'effectif chargé par l'écran.
 *
 * Fonctions pures : elles prennent une liste de salariés et rendent des
 * nombres. Aucune n'interroge le réseau, aucune ne garde d'état — elles se
 * vérifient donc à la lecture, et se réutilisent partout où l'effectif est
 * déjà en mémoire.
 *
 * Une donnée absente n'est jamais comptée pour zéro : les fiches sans genre,
 * sans date de naissance ou sans date d'embauche sont dénombrées à part, et
 * l'écran le dit. Un taux calculé sur la moitié des fiches n'a pas le même
 * sens qu'un taux calculé sur toutes.
 */

export const TRANCHES_AGE = [
    { libelle: '< 25 ans', min: 0, max: 25 },
    { libelle: '25-34 ans', min: 25, max: 35 },
    { libelle: '35-44 ans', min: 35, max: 45 },
    { libelle: '45-54 ans', min: 45, max: 55 },
    { libelle: '55 ans +', min: 55, max: 200 }
];

const MS_PAR_AN = 365.25 * 24 * 3600 * 1000;

export const arrondir = (n, d = 1) => {
    const f = Math.pow(10, d);
    return Math.round((Number(n) || 0) * f) / f;
};

export const annees = (de, a = new Date()) => {
    if (!de) return null;
    const ecart = new Date(a) - new Date(de);
    return Number.isFinite(ecart) ? ecart / MS_PAR_AN : null;
};

/** Médiane d'une série. Moins sensible qu'une moyenne à quelques vétérans. */
export function mediane(valeurs) {
    const triees = valeurs.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (triees.length === 0) return null;
    const milieu = Math.floor(triees.length / 2);
    return triees.length % 2 ? triees[milieu] : (triees[milieu - 1] + triees[milieu]) / 2;
}

/** Actifs : tout ce qui n'est pas explicitement terminé. */
export const actifsDe = (salaries) =>
    (Array.isArray(salaries) ? salaries : []).filter((s) => (s?.status || 'ACTIVE') !== 'TERMINATED');

/** Répartition par clé, du plus nombreux au moins nombreux. */
export function repartition(liste, cle, libelleVide = 'Non renseigné') {
    const compte = new Map();
    for (const item of liste) {
        const brut = item?.[cle];
        const valeur = (brut === null || brut === undefined || brut === '') ? libelleVide : String(brut).trim();
        compte.set(valeur, (compte.get(valeur) || 0) + 1);
    }
    return [...compte.entries()]
        .map(([libelle, nombre]) => ({ libelle, nombre }))
        .sort((a, b) => b.nombre - a.nombre);
}

export function trancheAge(naissance, reference = new Date()) {
    const age = annees(naissance, reference);
    if (age === null || age < 0) return null;
    return TRANCHES_AGE.find((t) => age >= t.min && age < t.max)?.libelle || null;
}

/** Arrivées par mois sur les douze derniers, pour la courbe. */
export function arriveesParMois(salaries, reference = new Date(), mois = 12) {
    const fin = new Date(reference);
    const series = [];
    for (let i = mois - 1; i >= 0; i -= 1) {
        const d = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth() - i, 1));
        const cle = d.toISOString().slice(0, 7);
        series.push({
            mois: cle,
            libelle: d.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }),
            arrivees: salaries.filter((s) => s?.hireDate
                && new Date(s.hireDate).toISOString().slice(0, 7) === cle).length
        });
    }
    return series;
}

/** Effectif présent à la fin de chaque mois, sur douze mois. */
export function courbeEffectif(salaries, reference = new Date(), mois = 12) {
    const series = [];
    for (let i = mois - 1; i >= 0; i -= 1) {
        const finMois = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - i + 1, 0));
        series.push({
            mois: finMois.toISOString().slice(0, 7),
            libelle: finMois.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }),
            effectif: salaries.filter((s) => {
                const entre = s?.hireDate ? new Date(s.hireDate) <= finMois : true;
                const sorti = s?.exitDate ? new Date(s.exitDate) < finMois : false;
                return entre && !sorti;
            }).length
        });
    }
    return series;
}

/** Compétences enregistrées : volume, experts, et les plus répandues. */
export function competences(salaries, combien = 6) {
    const parNom = new Map();
    let total = 0;
    for (const s of salaries) {
        for (const c of (s?.skills || [])) {
            if (!c?.skillName) continue;
            total += 1;
            if (!parNom.has(c.skillName)) parNom.set(c.skillName, { nombre: 0, experts: 0 });
            const e = parNom.get(c.skillName);
            e.nombre += 1;
            if (c.proficiencyLevel === 'Expert') e.experts += 1;
        }
    }
    return {
        relevees: total,
        distinctes: parNom.size,
        couverture: salaries.filter((s) => (s?.skills || []).length > 0).length,
        experts: [...parNom.values()].reduce((s, e) => s + e.experts, 0),
        // Une compétence tenue par un seul expert est un point de rupture :
        // c'est ce que cette liste sert à voir.
        fragiles: [...parNom.entries()]
            .filter(([, e]) => e.experts <= 1)
            .map(([libelle, e]) => ({ libelle, nombre: e.nombre, experts: e.experts }))
            .sort((a, b) => b.nombre - a.nombre)
            .slice(0, combien),
        repandues: [...parNom.entries()]
            .map(([libelle, e]) => ({ libelle, nombre: e.nombre, experts: e.experts }))
            .sort((a, b) => b.nombre - a.nombre)
            .slice(0, combien)
    };
}

/** Indicateurs complets d'un effectif. */
export function calculer(salaries, reference = new Date()) {
    const tous = Array.isArray(salaries) ? salaries : [];
    const actifs = actifsDe(tous);
    const maintenant = new Date(reference);
    const ilYaUnAn = new Date(maintenant);
    ilYaUnAn.setUTCFullYear(ilYaUnAn.getUTCFullYear() - 1);
    const ilYaUnMois = new Date(maintenant);
    ilYaUnMois.setUTCMonth(ilYaUnMois.getUTCMonth() - 1);

    const anciennetes = actifs.map((s) => annees(s?.hireDate, maintenant)).filter((a) => a !== null && a >= 0);
    const femmes = actifs.filter((s) => /^f/i.test(s?.gender || '')).length;
    const hommes = actifs.filter((s) => /^[mh]/i.test(s?.gender || '')).length;

    const arrivees12 = actifs.filter((s) => s?.hireDate && new Date(s.hireDate) >= ilYaUnAn).length;
    const arriveesMois = actifs.filter((s) => s?.hireDate && new Date(s.hireDate) >= ilYaUnMois).length;
    const departs12 = tous.filter((s) => s?.exitDate && new Date(s.exitDate) >= ilYaUnAn).length;

    const soldes = actifs.map((s) => Number(s?.annualLeaveBalance)).filter((n) => Number.isFinite(n));
    const risques = actifs.filter((s) => /élev|eleve|high/i.test(s?.flightRisk || ''));
    const prets = actifs.filter((s) => /pr[êe]t|ready|imm[ée]diat/i.test(s?.readiness || ''));
    const encadrants = new Set(actifs.map((s) => s?.manager).filter(Boolean));
    const integrationEnCours = actifs.filter((s) => Number.isFinite(Number(s?.onboardingProgress))
        && Number(s.onboardingProgress) < 100);

    return {
        effectif: actifs.length,
        arriveesMois,
        arrivees12,
        departs12,
        // Rotation rapportée à l'effectif : sans départ enregistré, elle vaut
        // zéro et ne prétend rien de plus.
        rotationPct: actifs.length > 0 ? arrondir((departs12 / actifs.length) * 100) : null,
        ancienneteMediane: anciennetes.length > 0 ? arrondir(mediane(anciennetes)) : null,
        sansDateEmbauche: actifs.length - anciennetes.length,
        parite: {
            femmes,
            hommes,
            nonRenseigne: actifs.length - femmes - hommes,
            partFemmesPct: femmes + hommes > 0 ? arrondir((femmes / (femmes + hommes)) * 100) : null
        },
        pyramide: TRANCHES_AGE.map((t) => ({
            libelle: t.libelle,
            nombre: actifs.filter((s) => trancheAge(s?.birthDate, maintenant) === t.libelle).length
        })),
        sansDateNaissance: actifs.filter((s) => !s?.birthDate).length,
        parDepartement: repartition(actifs, 'department', 'Sans département'),
        parPoste: repartition(actifs, 'positionTitle', 'Poste non renseigné'),
        conges: {
            joursDus: soldes.length > 0 ? arrondir(soldes.reduce((a, b) => a + b, 0)) : null,
            moyenne: soldes.length > 0 ? arrondir(soldes.reduce((a, b) => a + b, 0) / soldes.length) : null,
            sansSolde: actifs.length - soldes.length
        },
        talents: {
            risqueEleve: risques.length,
            risquePct: actifs.length > 0 ? arrondir((risques.length / actifs.length) * 100) : null,
            releveImmediate: prets.length,
            encadrants: encadrants.size,
            integrationEnCours: integrationEnCours.length
        },
        competences: competences(actifs),
        courbeArrivees: arriveesParMois(actifs, maintenant),
        courbeEffectif: courbeEffectif(tous, maintenant)
    };
}
