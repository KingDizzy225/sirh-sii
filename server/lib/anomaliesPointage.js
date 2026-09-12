/**
 * Anomalies de pointage que la géolocalisation permet de voir.
 *
 * Le contrôle quotidien existant regarde deux choses : la sortie oubliée et le
 * pointage hors zone. Les coordonnées sont pourtant enregistrées à chaque
 * pointage — latitude, longitude, précision, distance au site — et personne ne
 * les recoupe. Trois situations leur échappent :
 *
 *  - le **trajet impossible** : deux pointages qui supposeraient de rouler à
 *    200 km/h entre eux ;
 *  - les **pointages jumelés** : deux salariés qui pointent au même endroit à
 *    quelques secondes d'intervalle, au mètre près — deux téléphones distincts
 *    ne donnent jamais exactement la même position ;
 *  - la **position figée** : des coordonnées rigoureusement identiques jour
 *    après jour, signe d'une position simulée ou d'un appareil laissé sur place.
 *
 * Ce module ne conclut rien : il calcule, et laisse la RH juger. Un constat
 * s'explique souvent — un GPS imprécis, un site unique, un collègue qui prête
 * son téléphone en toute bonne foi. Les seuils sont volontairement stricts pour
 * que ce qui est signalé mérite de l'être.
 */

const nombre = (v, defaut) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : defaut;
};

/** Au-delà, le déplacement n'est pas crédible entre deux pointages. */
const VITESSE_MAX_KMH = nombre(process.env.POINTAGE_VITESSE_MAX_KMH, 120);
/** En deçà, l'écart relève du bruit GPS, pas d'un déplacement. */
const DISTANCE_MIN_M = nombre(process.env.POINTAGE_DISTANCE_MIN_M, 500);
/** Deux appareils distincts ne donnent pas la même position à ce point. */
const JUMEAUX_DISTANCE_M = nombre(process.env.POINTAGE_JUMEAUX_DISTANCE_M, 3);
const JUMEAUX_SECONDES = nombre(process.env.POINTAGE_JUMEAUX_SECONDES, 30);
/** Répétitions d'une position rigoureusement identique avant de le signaler. */
const FIGEE_OCCURRENCES = nombre(process.env.POINTAGE_FIGEE_OCCURRENCES, 4);
const FIGEE_JOURS = nombre(process.env.POINTAGE_FIGEE_JOURS, 2);

const RAYON_TERRE_M = 6371000;
const rad = (d) => (d * Math.PI) / 180;

/** Distance en mètres entre deux points, ou null si l'un n'est pas localisé. */
function distanceMetres(a, b) {
    if (!a || !b) return null;
    if (![a.latitude, a.longitude, b.latitude, b.longitude].every((v) => Number.isFinite(v))) return null;
    const dLat = rad(b.latitude - a.latitude);
    const dLon = rad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2
        + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return 2 * RAYON_TERRE_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

const instant = (p) => new Date(p.timestamp).getTime();

/**
 * Trajets impossibles entre deux pointages successifs d'un même salarié.
 * @param {Array} pointages pointages localisés d'un salarié, triés ou non
 */
function trajetsImpossibles(pointages) {
    const localises = [...pointages]
        .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
        .sort((a, b) => instant(a) - instant(b));

    const trouves = [];
    for (let i = 1; i < localises.length; i++) {
        const avant = localises[i - 1];
        const apres = localises[i];
        const metres = distanceMetres(avant, apres);
        const secondes = (instant(apres) - instant(avant)) / 1000;
        if (metres == null || metres < DISTANCE_MIN_M || secondes <= 0) continue;

        // La précision annoncée est retranchée : un point à 200 m près ne doit
        // pas fabriquer un déplacement qui n'a pas eu lieu.
        const margeM = (avant.accuracy || 0) + (apres.accuracy || 0);
        const parcourus = metres - margeM;
        if (parcourus < DISTANCE_MIN_M) continue;

        const vitesse = (parcourus / 1000) / (secondes / 3600);
        if (vitesse > VITESSE_MAX_KMH) {
            trouves.push({
                code: 'TRAJET_IMPOSSIBLE',
                de: avant.timestamp,
                a: apres.timestamp,
                metres: Math.round(parcourus),
                minutes: Math.round(secondes / 60),
                vitesseKmh: Math.round(vitesse)
            });
        }
    }
    return trouves;
}

/**
 * Pointages de deux salariés différents au même endroit, au même instant.
 * @param {Array} pointages pointages localisés de plusieurs salariés
 */
function pointagesJumeles(pointages) {
    const localises = [...pointages]
        .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
        .sort((a, b) => instant(a) - instant(b));

    const paires = [];
    for (let i = 0; i < localises.length; i++) {
        for (let j = i + 1; j < localises.length; j++) {
            const secondes = (instant(localises[j]) - instant(localises[i])) / 1000;
            if (secondes > JUMEAUX_SECONDES) break;
            if (localises[i].employeeId === localises[j].employeeId) continue;
            const metres = distanceMetres(localises[i], localises[j]);
            if (metres == null || metres > JUMEAUX_DISTANCE_M) continue;
            paires.push({
                code: 'POINTAGES_JUMELES',
                employes: [localises[i].employeeId, localises[j].employeeId],
                le: localises[i].timestamp,
                metres: Math.round(metres * 10) / 10,
                secondes: Math.round(secondes)
            });
        }
    }
    return paires;
}

/** Clé d'une position au dix-millionième de degré : l'égalité stricte. */
const clePosition = (p) => `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}`;
const cleJour = (p) => new Date(p.timestamp).toISOString().slice(0, 10);

/**
 * Positions rigoureusement identiques, répétées sur plusieurs jours.
 * @param {Array} pointages pointages localisés d'un salarié
 */
function positionsFigees(pointages) {
    const groupes = new Map();
    for (const p of pointages) {
        if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) continue;
        const cle = clePosition(p);
        if (!groupes.has(cle)) groupes.set(cle, { occurrences: 0, jours: new Set(), position: cle });
        const g = groupes.get(cle);
        g.occurrences++;
        g.jours.add(cleJour(p));
    }

    return [...groupes.values()]
        .filter((g) => g.occurrences >= FIGEE_OCCURRENCES && g.jours.size >= FIGEE_JOURS)
        .map((g) => ({
            code: 'POSITION_FIGEE',
            position: g.position,
            occurrences: g.occurrences,
            jours: g.jours.size
        }));
}

module.exports = {
    VITESSE_MAX_KMH, DISTANCE_MIN_M, JUMEAUX_DISTANCE_M, JUMEAUX_SECONDES,
    FIGEE_OCCURRENCES, FIGEE_JOURS,
    distanceMetres, trajetsImpossibles, pointagesJumeles, positionsFigees
};
