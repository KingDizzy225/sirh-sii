const prisma = require('../prismaClient');

/**
 * Grille de la convention collective : le salaire minimum opposable.
 *
 * Le salaire était un nombre libre. Rien ne disait qu'un salarié était payé
 * sous le minimum de sa catégorie ou sous le salaire minimum légal — cela ne
 * se découvrait qu'au contrôle de l'inspection du travail, avec les rappels.
 *
 * Deux planchers, et le plus élevé l'emporte :
 *  - le **minimum légal** (`SMIG_MENSUEL`), qui vaut pour tout le monde ;
 *  - le **minimum conventionnel** de la catégorie et de l'échelon, quand la
 *    grille de l'entreprise est saisie.
 *
 * **Aucun montant n'est inscrit en dur.** Le SMIG se déclare par variable
 * d'environnement, la grille se saisit dans l'application : les valeurs
 * changent par arrêté ou par accord, et une valeur périmée dans le code vaut
 * pire qu'aucune valeur.
 */

const SMIG_MENSUEL = Number.isFinite(parseFloat(process.env.SMIG_MENSUEL))
    ? parseFloat(process.env.SMIG_MENSUEL)
    : null;

const ECHELON_PAR_DEFAUT = '—';

const cle = (categorie, echelon) => `${String(categorie || '').trim()}|${String(echelon || ECHELON_PAR_DEFAUT).trim() || ECHELON_PAR_DEFAUT}`;

/** Grille active, indexée par catégorie et échelon. */
async function indexer(convention) {
    const lignes = await prisma.grilleConvention.findMany({
        where: { actif: true, ...(convention ? { convention } : {}) },
        orderBy: [{ ordre: 'asc' }, { categorie: 'asc' }, { echelon: 'asc' }]
    });
    return new Map(lignes.map((l) => [cle(l.categorie, l.echelon), l]));
}

/**
 * Minimum applicable à un salarié. Fonction pure.
 * @returns {{minimum: number|null, origine: 'CONVENTION'|'SMIG'|null, motif: string|null}}
 */
function minimumPour(salarie, grille, smig = SMIG_MENSUEL) {
    const ligne = salarie?.categorieConvention
        ? grille.get(cle(salarie.categorieConvention, salarie.echelonConvention))
        : null;

    if (!ligne && salarie?.categorieConvention) {
        return {
            minimum: smig,
            origine: smig === null ? null : 'SMIG',
            motif: `La catégorie « ${salarie.categorieConvention} » ne figure pas dans la grille saisie.`
        };
    }
    if (!ligne) {
        return {
            minimum: smig,
            origine: smig === null ? null : 'SMIG',
            motif: smig === null
                ? "Aucune catégorie au dossier et SMIG_MENSUEL non déclaré : aucun minimum opposable connu."
                : 'Aucune catégorie au dossier : seul le minimum légal s\'applique.'
        };
    }
    if (smig !== null && smig > ligne.salaireMinimum) {
        return {
            minimum: smig,
            origine: 'SMIG',
            motif: `Le minimum légal (${smig}) dépasse celui de la catégorie « ${ligne.categorie} » (${ligne.salaireMinimum}).`
        };
    }
    return { minimum: ligne.salaireMinimum, origine: 'CONVENTION', motif: null };
}

/**
 * Le salaire respecte-t-il le minimum ? Fonction pure.
 * @returns {{conforme: boolean, minimum: number|null, ecart: number|null, origine: string|null, motif: string|null}}
 */
function controler(salarie, salaire, grille, smig = SMIG_MENSUEL) {
    const { minimum, origine, motif } = minimumPour(salarie, grille, smig);
    const montant = Number(salaire);

    // Sans minimum connu, on ne prétend pas que tout va bien : on le dit.
    if (minimum === null) return { conforme: true, minimum: null, ecart: null, origine: null, motif };
    if (!Number.isFinite(montant)) {
        return { conforme: false, minimum, ecart: null, origine, motif: 'Aucun salaire de référence à comparer.' };
    }
    const ecart = Math.round((montant - minimum) * 100) / 100;
    return {
        conforme: ecart >= 0,
        minimum,
        ecart,
        origine,
        motif: ecart >= 0 ? motif : `Salaire inférieur de ${Math.abs(ecart)} au minimum applicable (${minimum}).`
    };
}

/** Contrôle de tout l'effectif : ce que la RH doit corriger. */
async function controlerEffectif(convention) {
    const [grille, salaries] = await Promise.all([
        indexer(convention),
        prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            orderBy: [{ lastName: 'asc' }],
            select: {
                id: true, firstName: true, lastName: true, positionTitle: true, contractType: true,
                baseSalary: true, categorieConvention: true, echelonConvention: true
            }
        })
    ]);

    const lignes = salaries.map((s) => ({
        employeeId: s.id,
        nom: `${s.lastName} ${s.firstName}`.trim(),
        fonction: s.positionTitle,
        typeContrat: s.contractType,
        categorie: s.categorieConvention,
        echelon: s.echelonConvention,
        salaire: s.baseSalary,
        ...controler(s, s.baseSalary, grille)
    }));

    return {
        smig: SMIG_MENSUEL,
        lignesGrille: grille.size,
        effectif: lignes.length,
        sousMinimum: lignes.filter((l) => !l.conforme).length,
        sansCategorie: lignes.filter((l) => !l.categorie).length,
        lignes
    };
}

module.exports = { SMIG_MENSUEL, ECHELON_PAR_DEFAUT, cle, indexer, minimumPour, controler, controlerEffectif };
