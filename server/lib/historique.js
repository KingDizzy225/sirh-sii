const prisma = require('../prismaClient');
const remuneration = require('./remuneration');

/**
 * Historisation datée des situations.
 *
 * L'application ne connaissait que le présent. Elle savait qui occupe quel
 * poste aujourd'hui, jamais qui l'occupait au 1er janvier — ni dans quel
 * service, ni sous quel responsable. Trois questions ordinaires restaient sans
 * réponse : quel était l'organigramme à l'ouverture de l'exercice, quel poste
 * occupait ce salarié le jour de l'accident, et l'effectif a-t-il crû ou
 * décru depuis.
 *
 * Le choix retenu est additif. La fiche du salarié demeure la situation
 * courante, et la cinquantaine de requêtes qui la lisent n'ont pas changé :
 * rendre chaque lecture temporelle aurait signifié les reprendre toutes, et une
 * seule oubliée aurait rendu l'application incohérente avec elle-même.
 *
 * Cette table ajoute la profondeur de temps à côté, en segments fermés les uns
 * après les autres.
 */

const CHAMPS = ['positionTitle', 'department', 'managerId', 'contractType', 'status'];

/** Vrai si la situation a changé sur au moins un champ suivi. */
function aChange(avant, apres) {
    return CHAMPS.some((c) => (avant[c] ?? null) !== (apres[c] ?? null));
}

const extraire = (salarie) =>
    Object.fromEntries(CHAMPS.map((c) => [c, salarie[c] ?? null]));

/**
 * Enregistre une nouvelle situation, en fermant la précédente.
 *
 * Les segments ne se chevauchent pas : la situation en cours est close la
 * veille du jour où la nouvelle prend effet. Sans cela, une date donnée
 * renverrait deux situations, et il faudrait deviner laquelle vaut.
 */
async function enregistrer(employeeId, situation, { effectiveFrom, motif, source } = {}) {
    const debut = effectiveFrom ? new Date(effectiveFrom) : new Date();
    if (isNaN(debut.getTime())) {
        const e = new Error("Date d'effet invalide.");
        e.code = 'DATE';
        throw e;
    }

    const enCours = await prisma.situationEmployee.findFirst({
        where: { employeeId, effectiveTo: null },
        orderBy: { effectiveFrom: 'desc' }
    });

    if (enCours) {
        if (new Date(enCours.effectiveFrom) > debut) {
            // Une situation antérieure à la précédente rendrait la chronologie
            // illisible : mieux vaut refuser que produire un historique faux.
            const e = new Error(
                `Une situation court déjà depuis le ${new Date(enCours.effectiveFrom).toLocaleDateString('fr-FR')}.`
            );
            e.code = 'ANTERIEURE';
            throw e;
        }
        await prisma.situationEmployee.update({
            where: { id: enCours.id },
            data: { effectiveTo: debut }
        });
    }

    return prisma.situationEmployee.create({
        data: {
            employeeId,
            effectiveFrom: debut,
            ...extraire(situation),
            motif: motif || null,
            source: source || 'OBSERVEE'
        }
    });
}

/**
 * Enregistre le changement s'il y en a un.
 * Appelé après chaque modification de fiche : une mise à jour qui ne touche ni
 * le poste ni le rattachement n'a pas à produire de segment.
 */
async function suivreChangement(avant, apres, { motif, effectiveFrom } = {}) {
    if (!avant || !apres || !aChange(avant, apres)) return null;
    return enregistrer(apres.id, apres, {
        effectiveFrom,
        motif: motif || 'Modification de la fiche',
        source: 'OBSERVEE'
    });
}

/**
 * Situation d'un salarié à une date donnée, rémunération comprise.
 * @returns {Promise<object|null>} null si le salarié n'était pas encore entré.
 */
async function situationA(employeeId, date = new Date()) {
    const quand = new Date(date);

    const segment = await prisma.situationEmployee.findFirst({
        where: {
            employeeId,
            effectiveFrom: { lte: quand },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: quand } }]
        },
        orderBy: { effectiveFrom: 'desc' }
    });

    const salaire = await remuneration.salaireA(employeeId, quand);

    if (!segment) {
        // Aucun segment : soit le salarié n'était pas encore entré, soit son
        // historique n'a jamais été repris. Les deux se distinguent, et il ne
        // faut pas les confondre.
        const salarie = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { hireDate: true }
        });
        if (salarie && new Date(salarie.hireDate) > quand) {
            return { connue: false, motif: "Le salarié n'était pas encore entré à cette date." };
        }
        return { connue: false, motif: "Aucune situation enregistrée pour cette date : historique non repris." };
    }

    return {
        connue: true,
        depuis: segment.effectiveFrom,
        jusqua: segment.effectiveTo,
        poste: segment.positionTitle,
        departement: segment.department,
        managerId: segment.managerId,
        contrat: segment.contractType,
        statut: segment.status,
        motif: segment.motif,
        reconstituee: segment.source === 'REPRISE',
        remuneration: salaire.montant,
        remunerationConnue: salaire.source !== 'INCONNU'
    };
}

/** Parcours complet d'un salarié, du plus récent au plus ancien. */
async function parcours(employeeId) {
    const [segments, decisions] = await Promise.all([
        prisma.situationEmployee.findMany({
            where: { employeeId }, orderBy: { effectiveFrom: 'desc' }
        }),
        prisma.salaryChange.findMany({
            where: { employeeId }, orderBy: { effectiveFrom: 'desc' }
        })
    ]);

    // Les deux séries sont fondues en une seule frise : c'est ainsi qu'on lit
    // une carrière, non en deux tableaux séparés.
    const evenements = [
        ...segments.map((s) => ({
            type: 'SITUATION', date: s.effectiveFrom, jusqua: s.effectiveTo,
            poste: s.positionTitle, departement: s.department,
            contrat: s.contractType, statut: s.status,
            motif: s.motif, reconstituee: s.source === 'REPRISE'
        })),
        ...decisions.map((d) => ({
            type: 'REMUNERATION', date: d.effectiveFrom,
            montant: d.amount, precedent: d.previousAmount,
            motif: d.motif, decidePar: d.decidePar
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return { segments, decisions, evenements };
}

/**
 * Effectif à une date : qui était présent, à quel poste, sous quel responsable.
 *
 * C'est la question qui n'avait aucune réponse, et dont dépendent l'analyse
 * d'un exercice passé comme la reconstitution d'un organigramme.
 */
async function effectifA(date = new Date()) {
    const quand = new Date(date);

    const segments = await prisma.situationEmployee.findMany({
        where: {
            effectiveFrom: { lte: quand },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: quand } }]
        },
        include: {
            employee: { select: { id: true, firstName: true, lastName: true, hireDate: true, exitDate: true } }
        },
        orderBy: { effectiveFrom: 'desc' }
    });

    // Un seul segment par salarié : le plus récent qui couvre la date.
    const parSalarie = new Map();
    for (const s of segments) {
        if (!parSalarie.has(s.employeeId)) parSalarie.set(s.employeeId, s);
    }

    const presents = [];
    for (const s of parSalarie.values()) {
        if (!s.employee) continue;
        if (s.employee.exitDate && new Date(s.employee.exitDate) <= quand) continue;
        if (s.status === 'TERMINATED') continue;
        presents.push({
            employeeId: s.employeeId,
            nom: `${s.employee.lastName} ${s.employee.firstName}`.trim(),
            poste: s.positionTitle,
            departement: s.department,
            managerId: s.managerId,
            contrat: s.contractType,
            reconstituee: s.source === 'REPRISE'
        });
    }

    presents.sort((a, b) => a.nom.localeCompare(b.nom));

    const parDepartement = {};
    for (const p of presents) {
        const cle = p.departement || 'Non affecté';
        parDepartement[cle] = (parDepartement[cle] || 0) + 1;
    }

    // Salariés dont l'historique n'a pas été repris : ils sont absents de ce
    // décompte, et le taire ferait passer une lacune pour une baisse d'effectif.
    const total = await prisma.employee.count({
        where: {
            hireDate: { lte: quand },
            OR: [{ exitDate: null }, { exitDate: { gt: quand } }]
        }
    });

    return {
        date: quand,
        effectif: presents.length,
        effectifAttendu: total,
        sansHistorique: Math.max(total - presents.length, 0),
        parDepartement,
        reconstitues: presents.filter((p) => p.reconstituee).length,
        salaries: presents
    };
}

module.exports = { CHAMPS, aChange, extraire, enregistrer, suivreChangement, situationA, parcours, effectifA };
