/**
 * Indemnité de licenciement.
 *
 * Le décompte de départ l'excluait volontairement : son éligibilité dépend du
 * motif de rupture, que l'application ne connaissait pas. Elle le connaît
 * désormais — c'est la nature de la procédure ouverte à l'égard du salarié — et
 * ce montant est le plus important d'un départ, jusqu'ici calculé à la main.
 *
 * Le barème par défaut est celui couramment appliqué en Côte d'Ivoire :
 * un pourcentage du salaire mensuel moyen par année de présence, croissant par
 * tranches d'ancienneté. Comme partout ailleurs dans cette application, il est
 * donné comme valeur par défaut et non comme certitude : une convention de
 * branche peut être plus favorable, et le barème se règle sans redéploiement.
 *
 * Ce que ce module ne décide pas : l'éligibilité. Une faute lourde en prive le
 * salarié, une démission n'y ouvre pas droit, et ces qualifications relèvent de
 * la RH. Le calcul est donc rendu avec la mention de ce qui le conditionne.
 */

/**
 * Barème : "borneAnnees:taux,..." — le taux s'applique aux années comprises
 * dans la tranche, non à la totalité de l'ancienneté.
 * Défaut : 30 % jusqu'à 5 ans, 35 % de 6 à 10 ans, 40 % au-delà.
 */
const BAREME = lireBareme(process.env.RUPTURE_BAREME_INDEMNITE || '5:0.30,10:0.35,999:0.40');

// Ancienneté minimale ouvrant droit à l'indemnité, en années.
const ANCIENNETE_MINIMALE = parseFloat(process.env.RUPTURE_ANCIENNETE_MINIMALE || '1');

// Natures de rupture ouvrant droit à l'indemnité, sous réserve d'éligibilité.
const NATURES_INDEMNISABLES = ['LICENCIEMENT'];

function lireBareme(texte) {
    return String(texte)
        .split(',')
        .map((t) => {
            const [borne, taux] = t.split(':');
            return { jusqua: parseFloat(borne), taux: parseFloat(taux) };
        })
        .filter((t) => Number.isFinite(t.jusqua) && Number.isFinite(t.taux))
        .sort((a, b) => a.jusqua - b.jusqua);
}

/**
 * Indemnité de licenciement pour une ancienneté et un salaire de référence.
 *
 * @param {number} anneesAnciennete  ancienneté en années, décimales comprises
 * @param {number} salaireMoyenMensuel  salaire mensuel moyen de référence
 * @returns {{montant:number, eligible:boolean, motifIneligibilite:string|null, tranches:object[]}}
 */
function calculerIndemnite(anneesAnciennete, salaireMoyenMensuel) {
    const annees = Math.max(Number(anneesAnciennete) || 0, 0);
    const salaire = Math.max(Number(salaireMoyenMensuel) || 0, 0);

    if (annees < ANCIENNETE_MINIMALE) {
        return {
            montant: 0,
            eligible: false,
            motifIneligibilite:
                `Ancienneté de ${arrondir1(annees)} an(s), inférieure au minimum de ${ANCIENNETE_MINIMALE} an(s).`,
            tranches: []
        };
    }
    if (salaire <= 0) {
        return {
            montant: 0,
            eligible: false,
            // Rendre zéro sans le dire ferait passer une donnée manquante pour
            // un droit inexistant.
            motifIneligibilite: 'Salaire de référence inconnu : aucun bulletin de paie enregistré.',
            tranches: []
        };
    }

    const tranches = [];
    let precedente = 0;
    let montant = 0;

    for (const t of BAREME) {
        if (annees <= precedente) break;
        const anneesDansTranche = Math.min(annees, t.jusqua) - precedente;
        if (anneesDansTranche > 0) {
            const part = salaire * t.taux * anneesDansTranche;
            montant += part;
            tranches.push({
                de: precedente,
                a: Math.min(annees, t.jusqua),
                annees: arrondir1(anneesDansTranche),
                taux: t.taux,
                montant: Math.round(part)
            });
        }
        precedente = t.jusqua;
    }

    return { montant: Math.round(montant), eligible: true, motifIneligibilite: null, tranches };
}

const arrondir1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

/** Description lisible du barème, pour l'afficher avec le résultat. */
function decrireBareme() {
    let precedente = 0;
    return BAREME.map((t) => {
        const libelle = t.jusqua >= 900
            ? `au-delà de ${precedente} ans`
            : `de ${precedente} à ${t.jusqua} ans`;
        precedente = t.jusqua;
        return { libelle, taux: t.taux };
    });
}

module.exports = {
    BAREME, ANCIENNETE_MINIMALE, NATURES_INDEMNISABLES,
    calculerIndemnite, decrireBareme
};
