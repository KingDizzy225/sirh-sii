/**
 * Corbeille — instantané et restauration d'un dossier salarié.
 *
 * Supprimer un salarié efface en cascade une trentaine de tables : paies,
 * congés, pointages, dossier médical, accidents du travail, entretien de
 * départ. Le geste tient en un clic depuis la liste de l'effectif, et il est
 * définitif.
 *
 * La sauvegarde quotidienne de l'hébergeur ne répond pas à ce cas : ce n'est
 * pas une panne de la base, et restaurer la base entière pour rattraper une
 * suppression annulerait tout le travail de la journée. L'instantané est donc
 * pris côté application, juste avant la suppression, et permet de reconstituer
 * le dossier seul.
 *
 * Choix assumé : on ne passe pas la suppression en logique (un simple drapeau
 * « supprimé »). Il aurait fallu reprendre la cinquantaine de requêtes qui
 * lisent la table Employee, et une seule oubliée ferait réapparaître un salarié
 * supprimé dans une paie. La copie avant suppression atteint la même garantie
 * sans toucher au reste de l'application.
 */

// Les mêmes relations que celles qu'efface la suppression, dans le même ordre.
// Toute relation ajoutée au schéma doit être ajoutée ici, sans quoi elle sera
// perdue sans que personne ne le voie : le contrôle server/scripts/check-*.cjs
// ne peut pas le deviner.
const RELATIONS = [
    { cle: 'kudo', ou: (id) => ({ OR: [{ senderId: id }, { receiverId: id }] }) },
    { cle: 'payroll' },
    { cle: 'leave' },
    { cle: 'absence' },
    { cle: 'expense' },
    { cle: 'salaryAdvance' },
    { cle: 'notification' },
    { cle: 'employeeDocument' },
    { cle: 'employeeSkill' },
    { cle: 'assetAssignment' },
    { cle: 'trainingParticipation' },
    { cle: 'performanceGoal' },
    { cle: 'performanceReview' },
    { cle: 'performanceFeedback' },
    { cle: 'medicalVisit' },
    { cle: 'medicalRecord' },
    { cle: 'workAccident' },
    { cle: 'pointEvent' },
    { cle: 'employeePoints' },
    { cle: 'talentProfile' },
    { cle: 'offboardingTask' },
    { cle: 'onboardingTask' },
    { cle: 'shiftSchedule' },
    { cle: 'employeeBenefit' },
    { cle: 'timeLog' },
    { cle: 'careerHistory' },
    { cle: 'disciplinaryRecord' },
    { cle: 'orgSimulationNode' },
    { cle: 'successor' },
    { cle: 'retentionAction' },
    { cle: 'referral', ou: (id) => ({ referrerId: id }) },
    { cle: 'mentorshipRelation', ou: (id) => ({ OR: [{ mentorId: id }, { menteeId: id }] }) },
    { cle: 'issuedDocument' },
    { cle: 'exitInterview' },
    { cle: 'supportTicket', ou: (id) => ({ requesterId: id }) },
    // Ajoutées après coup, à mesure que le dossier s'est enrichi. Une relation
    // oubliée ici ne fait pas échouer la suppression : elle disparaît sans
    // laisser de trace dans l'instantané, ce qui est précisément le défaut que
    // la corbeille devait corriger.
    { cle: 'procedure' },
    { cle: 'jobDescription' },
    { cle: 'situationEmployee' },
    { cle: 'salaryChange' },
    { cle: 'soldeToutCompte' }
];

const filtre = (relation, id) =>
    relation.ou ? relation.ou(id) : { employeeId: id };

/**
 * Copie intégrale d'un dossier, à prendre avant la suppression.
 * @returns {{version:number, employee:object, subordonnes:string[], relations:object, lignes:number}}
 */
async function capturer(prisma, id) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return null;

    const relations = {};
    let lignes = 0;

    for (const relation of RELATIONS) {
        // Une relation absente du client Prisma ne doit pas faire échouer la
        // suppression : on la signale et on continue, plutôt que de bloquer la
        // RH sur une table renommée.
        const modele = prisma[relation.cle];
        if (!modele || typeof modele.findMany !== 'function') {
            console.warn(`[CORBEILLE] Relation inconnue, non sauvegardée : ${relation.cle}`);
            continue;
        }
        const rows = await modele.findMany({ where: filtre(relation, id) });
        if (rows.length > 0) {
            relations[relation.cle] = rows;
            lignes += rows.length;
        }
    }

    // Les subordonnés sont détachés, pas supprimés : on retient qui, pour
    // rendre la hiérarchie telle qu'elle était.
    const subordonnes = await prisma.employee.findMany({
        where: { managerId: id },
        select: { id: true }
    });

    return {
        version: 1,
        employee,
        subordonnes: subordonnes.map((s) => s.id),
        relations,
        lignes
    };
}

/**
 * Reconstitue un dossier à partir d'un instantané.
 *
 * Les lignes sont réinsérées une à une, et non en masse : une ligne qui
 * référence une entité disparue depuis (une offre d'emploi supprimée, un
 * collègue parti) échoue seule, sans emporter le reste du dossier. Ce qui n'a
 * pas pu être restauré est rendu à l'appelant, jamais tu.
 */
async function restaurer(prisma, instantane) {
    const { employee, relations = {}, subordonnes = [] } = instantane;

    const existe = await prisma.employee.findUnique({ where: { id: employee.id } });
    if (existe) {
        const erreur = new Error('Ce salarié figure déjà dans l\'effectif.');
        erreur.code = 'DEJA_PRESENT';
        throw erreur;
    }

    const conflitEmail = await prisma.employee.findUnique({ where: { email: employee.email } });
    if (conflitEmail) {
        const erreur = new Error(
            `L'adresse ${employee.email} a été réattribuée à un autre salarié. ` +
            'La modifier avant de restaurer ce dossier.'
        );
        erreur.code = 'EMAIL_REPRIS';
        throw erreur;
    }

    // Le manager a pu être supprimé entre-temps : on restaure le salarié sans
    // rattachement plutôt que d'échouer, et on le signale.
    const avertissements = [];
    let managerId = employee.managerId;
    if (managerId) {
        const manager = await prisma.employee.findUnique({ where: { id: managerId } });
        if (!manager) {
            avertissements.push("Le responsable hiérarchique n'existe plus : le salarié est restauré sans rattachement.");
            managerId = null;
        }
    }

    await prisma.employee.create({ data: { ...employee, managerId } });

    let restaurees = 0;
    const echecs = [];
    for (const relation of RELATIONS) {
        const rows = relations[relation.cle];
        if (!rows || rows.length === 0) continue;
        const modele = prisma[relation.cle];
        if (!modele || typeof modele.create !== 'function') {
            echecs.push({ table: relation.cle, lignes: rows.length, motif: 'Table inconnue du schéma actuel.' });
            continue;
        }
        for (const row of rows) {
            try {
                await modele.create({ data: row });
                restaurees++;
            } catch (e) {
                echecs.push({ table: relation.cle, id: row.id || null, motif: e.message.split('\n')[0] });
            }
        }
    }

    // Rattachement des subordonnés encore présents.
    let rattaches = 0;
    if (subordonnes.length > 0) {
        const r = await prisma.employee.updateMany({
            where: { id: { in: subordonnes }, managerId: null },
            data: { managerId: employee.id }
        });
        rattaches = r.count;
    }

    return { restaurees, echecs, rattaches, avertissements };
}

module.exports = { RELATIONS, capturer, restaurer };
