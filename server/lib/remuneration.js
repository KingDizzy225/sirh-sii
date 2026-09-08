const prisma = require('../prismaClient');

/**
 * Rémunération de référence.
 *
 * L'application ne savait pas ce que gagnait un salarié. `runPayroll` lisait
 * `baseSalary` dans le corps de la requête, et l'analyse d'équité le déduisait
 * du dernier bulletin : le salaire était la conséquence — ce qui avait été payé
 * — et non une donnée du contrat.
 *
 * Trois choses en découlaient. Il fallait ressaisir chaque montant à chaque
 * paie. Rien ne signalait qu'un salaire avait changé d'un mois sur l'autre, ni
 * pourquoi. Et un salarié sans bulletin n'avait pas de salaire du tout, ce qui
 * l'excluait silencieusement de l'analyse d'équité.
 *
 * Le montant est désormais porté par la fiche, et chaque révision est consignée
 * avec sa date d'effet et son motif.
 */

/** Salaire applicable à une date donnée, d'après l'historique des décisions. */
async function salaireA(employeeId, date = new Date()) {
    const decision = await prisma.salaryChange.findFirst({
        where: { employeeId, effectiveFrom: { lte: new Date(date) } },
        orderBy: { effectiveFrom: 'desc' }
    });
    if (decision) return { montant: decision.amount, depuis: decision.effectiveFrom, source: 'DECISION' };

    // Aucune décision antérieure à cette date : on retombe sur la fiche, dont
    // le montant vaut à défaut d'historique — le cas des dossiers repris.
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { baseSalary: true, salaryEffectiveFrom: true }
    });
    if (salarie && salarie.baseSalary != null) {
        return { montant: salarie.baseSalary, depuis: salarie.salaryEffectiveFrom, source: 'FICHE' };
    }
    return { montant: null, depuis: null, source: 'INCONNU' };
}

/**
 * Enregistre une décision de rémunération et met la fiche à jour.
 *
 * La fiche ne porte que la décision en vigueur : elle est mise à jour si et
 * seulement si la date d'effet est atteinte. Une augmentation signée
 * aujourd'hui pour le mois prochain ne doit pas modifier la paie de ce mois-ci.
 */
async function enregistrerDecision({ employeeId, montant, effectiveFrom, motif, decidePar }) {
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, baseSalary: true }
    });
    if (!salarie) {
        const e = new Error('Salarié introuvable.');
        e.code = 'INTROUVABLE';
        throw e;
    }

    const effet = new Date(effectiveFrom || Date.now());
    if (isNaN(effet.getTime())) {
        const e = new Error("Date d'effet invalide.");
        e.code = 'DATE';
        throw e;
    }

    const decision = await prisma.salaryChange.create({
        data: {
            employeeId,
            amount: montant,
            previousAmount: salarie.baseSalary,
            effectiveFrom: effet,
            motif: motif || null,
            decidePar: decidePar || null
        }
    });

    if (effet <= new Date()) {
        await prisma.employee.update({
            where: { id: employeeId },
            data: { baseSalary: montant, salaryEffectiveFrom: effet }
        });
    }

    return decision;
}

/**
 * Applique les décisions dont la date d'effet est arrivée.
 *
 * Une augmentation datée du mois prochain doit prendre effet toute seule : sans
 * ce rattrapage, elle attendrait qu'une main la reporte, et la paie sortirait
 * avec l'ancien montant.
 */
async function appliquerDecisionsEchues(reference = new Date()) {
    const echues = await prisma.salaryChange.findMany({
        where: { effectiveFrom: { lte: reference } },
        orderBy: { effectiveFrom: 'asc' },
        select: { employeeId: true, amount: true, effectiveFrom: true }
    });

    // La dernière décision échue de chaque salarié fait foi.
    const parSalarie = new Map();
    for (const d of echues) parSalarie.set(d.employeeId, d);

    let appliquees = 0;
    for (const [employeeId, d] of parSalarie) {
        const salarie = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { baseSalary: true, salaryEffectiveFrom: true }
        });
        if (!salarie) continue;
        const dejaAJour = salarie.baseSalary === d.amount &&
            salarie.salaryEffectiveFrom &&
            new Date(salarie.salaryEffectiveFrom).getTime() === new Date(d.effectiveFrom).getTime();
        if (dejaAJour) continue;

        await prisma.employee.update({
            where: { id: employeeId },
            data: { baseSalary: d.amount, salaryEffectiveFrom: d.effectiveFrom }
        });
        appliquees++;
    }
    return appliquees;
}

/** Validation d'un montant de rémunération. */
function montantValide(valeur) {
    const n = Number(valeur);
    if (!Number.isFinite(n)) return "Le montant doit être un nombre.";
    if (n <= 0) return 'Le montant doit être supérieur à zéro.';
    if (n > 100000000) return 'Montant hors limites : vérifier la saisie.';
    return null;
}

module.exports = { salaireA, enregistrerDecision, appliquerDecisionsEchues, montantValide };
