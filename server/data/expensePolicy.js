/**
 * Politique de plafonds des notes de frais.
 *
 * Le module acceptait jusqu'ici n'importe quel montant sans contrôle : le
 * valideur devait examiner chaque ligne pour repérer l'anormal. Avec des
 * plafonds, il ne regarde plus que ce qui en sort.
 *
 * Ces montants sont en FCFA et volontairement conservés en fichier plutôt
 * qu'en base : ils changent rarement, et les modifier ici laisse une trace
 * dans l'historique du dépôt. Les déplacer vers un écran d'administration
 * reste possible si le besoin de les ajuster souvent apparaît.
 */

const PLAFONDS = {
    'Repas': { plafond: 15000, justificationAuDela: 10000 },
    'Déplacement': { plafond: 100000, justificationAuDela: 50000 },
    'Hébergement': { plafond: 80000, justificationAuDela: 60000 },
    'Équipement': { plafond: 500000, justificationAuDela: 200000 },
    'Autre': { plafond: 50000, justificationAuDela: 25000 }
};

// Catégorie inconnue : on n'invente pas de plafond, on laisse passer sans
// signalement plutôt que de bloquer une dépense légitime sur une règle absente.
const DEFAUT = { plafond: null, justificationAuDela: null };

/**
 * Évalue une dépense au regard de la politique.
 * @returns {{plafond: number|null, depassement: boolean,
 *            justificationRequise: boolean, message: string|null}}
 */
function evaluerDepense(categorie, montant, justification) {
    const regle = PLAFONDS[categorie] || DEFAUT;
    const somme = Number(montant) || 0;

    if (regle.plafond === null) {
        return { plafond: null, depassement: false, justificationRequise: false, message: null };
    }

    const depassement = somme > regle.plafond;
    const justificationRequise =
        somme > regle.justificationAuDela && !String(justification || '').trim();

    let message = null;
    if (depassement) {
        message = `Montant supérieur au plafond de ${regle.plafond.toLocaleString('fr-FR')} FCFA ` +
                  `pour la catégorie « ${categorie} ». La dépense est enregistrée et signalée au valideur.`;
    } else if (justificationRequise) {
        message = `Au-delà de ${regle.justificationAuDela.toLocaleString('fr-FR')} FCFA, ` +
                  `une justification est requise pour la catégorie « ${categorie} ».`;
    }

    return { plafond: regle.plafond, depassement, justificationRequise, message };
}

module.exports = { PLAFONDS, evaluerDepense };
