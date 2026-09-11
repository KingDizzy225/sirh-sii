const prisma = require('../prismaClient');
const joursFeries = require('./joursFeries');

/**
 * Calendrier de l'entreprise : jours ouvrables et fériés chômés enregistrés.
 *
 * `joursFeries` calcule sans rien lire ; ce module lit les fériés saisis en
 * base — dont les fêtes religieuses fixées chaque année par décret — et les
 * applique. Il servait aux seuls congés ; la préparation de la paie en a
 * besoin aussi, pour décompter un congé sans solde dans la même unité que
 * celle où il a été posé.
 */

/** Index « AAAA-MM-JJ » → libellé des fériés chômés entre deux dates. */
async function indexFeries(debut, fin) {
    const enBase = await prisma.jourFerie.findMany({
        where: { date: { gte: new Date(debut), lte: new Date(fin) }, chome: true },
        select: { date: true, libelle: true }
    }).catch((e) => {
        // Le calendrier indisponible ne doit pas empêcher de poser un congé ;
        // le décompte reste alors celui des jours ouvrables hors fériés.
        console.error('[CALENDRIER] Fériés illisibles :', e.message);
        return [];
    });
    return joursFeries.indexer(enBase);
}

/**
 * Durée d'une période en jours ouvrables, fériés enregistrés déduits.
 * @returns {Promise<{jours:number, feriesTraverses:Array, calendaires:number}>}
 */
async function dureeEnJoursOuvrables(debut, fin) {
    const calcul = joursFeries.joursOuvrables(debut, fin, await indexFeries(debut, fin));
    return {
        jours: calcul.jours,
        feriesTraverses: calcul.feriesTraverses,
        calendaires: joursFeries.joursCalendaires(debut, fin)
    };
}

module.exports = { indexFeries, dureeEnJoursOuvrables };
