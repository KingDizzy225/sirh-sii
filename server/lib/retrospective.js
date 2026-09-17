const crypto = require('crypto');
const prisma = require('../prismaClient');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * « Mon année chez SII » : le bilan d'une année, rendu au salarié.
 *
 * Le système accumule toute l'année ce que le salarié a fait — pointages,
 * congés, formations, remerciements reçus — et ne le lui rend jamais. Ce bilan
 * le lui rend, une fois l'an, sous une forme qu'il a envie d'ouvrir.
 *
 * **Aucun chiffre décoratif.** Chaque rubrique vaut `null` quand la base ne sait
 * rien : un salarié qui ne pointe pas n'a pas « 0 jour travaillé », il n'a pas
 * de pointage, et la page n'en parle pas. Un bilan qui inventerait pour faire
 * joli serait pire qu'une absence de bilan.
 *
 * **La rémunération est à part.** Elle figure dans la réponse, mais la page la
 * masque tant que le salarié ne l'a pas demandée : on montre un bilan à ses
 * proches, pas toujours sa fiche de paie.
 */

const STATUTS_APPROUVES = ['APPROVED', 'Approved', 'Approuvé'];

const nouveauJeton = () => crypto.randomBytes(32).toString('hex');
const lienDe = (token) => `${getPublicAppUrl()}/mon-annee/${token}`;

/** Un lien de l'année N vaut jusqu'au 30 juin de N+1. */
const echeance = (annee) => new Date(Date.UTC(annee + 1, 5, 30, 23, 59, 59));

function bornes(annee, reference = new Date()) {
    const debut = new Date(Date.UTC(annee, 0, 1));
    const finAnnee = new Date(Date.UTC(annee, 11, 31, 23, 59, 59, 999));
    return { debut, fin: reference < finAnnee ? reference : finAnnee, complete: reference >= finAnnee };
}

/** Années d'ancienneté révolues à une date. */
function anciennete(embauche, date) {
    const e = new Date(embauche);
    let ans = date.getUTCFullYear() - e.getUTCFullYear();
    const anniversairePasse = date.getUTCMonth() > e.getUTCMonth()
        || (date.getUTCMonth() === e.getUTCMonth() && date.getUTCDate() >= e.getUTCDate());
    if (!anniversairePasse) ans -= 1;
    return Math.max(0, ans);
}

/**
 * Assemble le bilan à partir des lignes lues. Fonction pure.
 */
function assembler({ salarie, annee, periode, pointages, conges, formations, kudosRecus, kudosEnvoyes, points, augmentations, reference }) {
    const joursPointes = new Set(
        pointages.filter((p) => p.type === 'CLOCK_IN').map((p) => new Date(p.timestamp).toISOString().slice(0, 10))
    ).size;

    const congesPris = conges.reduce((total, c) => total + (Number(c.durationDays) || 0), 0);
    const plusLong = conges.reduce((max, c) => Math.max(max, Number(c.durationDays) || 0), 0);

    const categories = {};
    const expediteurs = {};
    for (const k of kudosRecus) {
        categories[k.category] = (categories[k.category] || 0) + 1;
        const prenom = k.sender?.firstName;
        if (prenom) expediteurs[prenom] = (expediteurs[prenom] || 0) + 1;
    }
    const dernierMot = kudosRecus[0];

    const embauche = new Date(salarie.hireDate);
    const ansFin = anciennete(embauche, periode.fin);
    const anniversaire = new Date(Date.UTC(annee, embauche.getUTCMonth(), embauche.getUTCDate()));
    const jalon = ansFin >= 1 && anniversaire >= periode.debut && anniversaire <= periode.fin ? ansFin : null;

    let remuneration = null;
    if (augmentations.length > 0) {
        const premiere = augmentations[0];
        const derniere = augmentations[augmentations.length - 1];
        const depart = premiere.previousAmount;
        remuneration = {
            decisions: augmentations.length,
            depuis: depart ?? null,
            vers: derniere.amount,
            evolutionPct: depart ? Math.round(((derniere.amount - depart) / depart) * 1000) / 10 : null
        };
    }

    const totalPoints = points.reduce((t, p) => t + (p.points || 0), 0);
    const anneeEnCours = reference.getUTCFullYear() === annee;

    return {
        annee,
        anneeComplete: periode.complete,
        arreteAu: periode.fin.toISOString().slice(0, 10),
        organisation: process.env.ORGANISATION_NAME || 'SIRH-SII',
        salarie: { prenom: salarie.firstName, fonction: salarie.positionTitle || null },
        arriveeCetteAnnee: embauche >= periode.debut && embauche <= periode.fin
            ? embauche.toISOString().slice(0, 10) : null,
        anciennete: { annees: ansFin, jalonFranchi: jalon },
        presence: joursPointes > 0 ? { joursPointes } : null,
        conges: conges.length > 0
            ? {
                demandesAccordees: conges.length,
                joursPris: Math.round(congesPris * 10) / 10,
                plusLongueAbsence: plusLong,
                // Le solde du jour n'a de sens que pour l'année en cours.
                soldeActuel: anneeEnCours ? salarie.annualLeaveBalance : null
            }
            : null,
        formations: formations.length > 0
            ? {
                nombre: formations.length,
                heures: Math.round(formations.reduce((t, f) => t + (f.session?.durationHours || 0), 0) * 10) / 10,
                intitules: formations.map((f) => f.session?.title).filter(Boolean).slice(0, 8)
            }
            : null,
        reconnaissance: kudosRecus.length > 0 || kudosEnvoyes.length > 0
            ? {
                recus: kudosRecus.length,
                envoyes: kudosEnvoyes.length,
                colleguesRemercies: new Set(kudosEnvoyes.map((k) => k.receiverId)).size,
                categories,
                principauxExpediteurs: Object.entries(expediteurs)
                    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([prenom, nombre]) => ({ prenom, nombre })),
                dernierMot: dernierMot
                    ? { de: dernierMot.sender?.firstName || null, message: dernierMot.message, categorie: dernierMot.category }
                    : null
            }
            : null,
        points: totalPoints > 0 ? { total: totalPoints } : null,
        remuneration
    };
}

/** Lit la base et assemble le bilan d'un salarié. */
async function bilan(employeeId, annee, reference = new Date()) {
    if (!Number.isInteger(annee) || annee > reference.getUTCFullYear()) {
        throw new Error('Année invalide : le bilan ne porte que sur une année commencée.');
    }
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            firstName: true, positionTitle: true, hireDate: true, annualLeaveBalance: true
        }
    });
    if (!salarie) return null;

    const periode = bornes(annee, reference);
    const dans = { gte: periode.debut, lte: periode.fin };

    const [pointages, conges, formations, kudosRecus, kudosEnvoyes, points, augmentations] = await Promise.all([
        prisma.timeLog.findMany({ where: { employeeId, type: 'CLOCK_IN', timestamp: dans }, select: { type: true, timestamp: true } }),
        // Un congé compte pour l'année où il commence.
        prisma.leave.findMany({
            where: { employeeId, status: { in: STATUTS_APPROUVES }, startDate: dans },
            select: { durationDays: true }
        }),
        prisma.trainingParticipation.findMany({
            where: { employeeId, completionStatus: 'Completed', session: { date: dans } },
            select: { session: { select: { title: true, durationHours: true } } }
        }),
        prisma.kudo.findMany({
            where: { receiverId: employeeId, createdAt: dans },
            orderBy: { createdAt: 'desc' },
            select: { category: true, message: true, sender: { select: { firstName: true } } }
        }),
        prisma.kudo.findMany({ where: { senderId: employeeId, createdAt: dans }, select: { receiverId: true } }),
        prisma.pointEvent.findMany({ where: { employeeId, createdAt: dans }, select: { points: true } }),
        prisma.salaryChange.findMany({
            where: { employeeId, effectiveFrom: dans },
            orderBy: { effectiveFrom: 'asc' },
            select: { amount: true, previousAmount: true }
        })
    ]);

    return assembler({
        salarie, annee, periode, pointages, conges, formations,
        kudosRecus, kudosEnvoyes, points, augmentations, reference
    });
}

module.exports = { STATUTS_APPROUVES, nouveauJeton, lienDe, echeance, bornes, anciennete, assembler, bilan };
