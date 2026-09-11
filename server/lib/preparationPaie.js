const prisma = require('../prismaClient');
const { intervalleMois } = require('./paie');
const remuneration = require('./remuneration');
const tempsTravail = require('./tempsTravail');
const joursFeries = require('./joursFeries');
const cloture = require('./cloture');

/**
 * Préparation de la paie d'un mois : ce que l'application sait déjà.
 *
 * Les éléments variables se ressaisissaient à la main chaque mois, alors que
 * l'application les connaissait :
 *
 *  - les **congés sans solde** validés, décomptés en jours ouvrables par le
 *    module des congés, étaient retapés dans la colonne « jours d'absence » ;
 *  - les **heures supplémentaires** reconstituées à partir des pointages
 *    étaient recopiées depuis le relevé, en un seul total, sans distinguer la
 *    nuit ni le dimanche ;
 *  - l'**échéance de prêt**, ajoutée d'office par le serveur, n'était pas
 *    montrée : la RH qui la saisissait aussi dans les retenues la prélevait
 *    deux fois.
 *
 * Tout est **proposé**, rien n'est imposé : chaque montant dit d'où il vient,
 * et la RH le corrige si le relevé est faux. Un relevé de pointage comportant
 * des anomalies est signalé comme tel, jamais repris en silence.
 */

/** Types de congé qui suspendent la rémunération. */
const TYPES_SANS_SOLDE = ['Unpaid', 'UNPAID', 'Sans solde'];

const STATUTS_VALIDES = ['APPROVED', 'Approved'];

async function preparer(periode) {
    const mois = intervalleMois(periode);
    const dernierJour = new Date(mois.lt.getTime() - 1);

    const [salaries, bulletins, conges, pointages, feries, echeances, absences, situation] = await Promise.all([
        prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' }, hireDate: { lt: mois.lt } },
            select: { id: true, firstName: true, lastName: true, positionTitle: true, department: true },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
        }),
        prisma.payroll.findMany({
            where: { period: { gte: mois.gte, lt: mois.lt } },
            select: {
                id: true, employeeId: true, status: true, signedAt: true,
                baseSalary: true, overtimeHours: true, heuresSupDetail: true,
                leaveDays: true, bonus: true, deductions: true
            }
        }),
        prisma.leave.findMany({
            where: {
                status: { in: STATUTS_VALIDES },
                type: { in: TYPES_SANS_SOLDE },
                startDate: { lt: mois.lt },
                endDate: { gte: mois.gte }
            },
            select: { employeeId: true, startDate: true, endDate: true }
        }),
        prisma.timeLog.findMany({
            where: { timestamp: { gte: mois.gte, lt: mois.lt } },
            orderBy: { timestamp: 'asc' }
        }),
        prisma.jourFerie.findMany({
            where: { date: { gte: mois.gte, lt: mois.lt }, chome: true },
            select: { date: true, libelle: true }
        }).catch(() => []),
        // Même sélection que la paie : une échéance retenue reste attachée à son
        // bulletin même quand elle a soldé le prêt.
        prisma.echeancePret.findMany({
            where: {
                periode: mois.libelle,
                OR: [
                    { statut: 'A_RETENIR', pret: { statut: 'EN_COURS' } },
                    { statut: 'RETENUE' }
                ]
            },
            include: { pret: { select: { employeeId: true } } }
        }),
        prisma.absence.findMany({
            where: { date: { gte: mois.gte, lt: mois.lt }, type: 'Absence non justifiée' },
            select: { employeeId: true }
        }),
        cloture.etat(mois.libelle)
    ]);

    const index = joursFeries.indexer(feries);
    const grouper = (liste, cle = 'employeeId') => liste.reduce((m, x) => {
        if (!m.has(x[cle])) m.set(x[cle], []);
        m.get(x[cle]).push(x);
        return m;
    }, new Map());

    const bulletinDe = new Map(bulletins.map((b) => [b.employeeId, b]));
    const congesDe = grouper(conges);
    const pointagesDe = grouper(pointages);
    const echeanceDe = new Map(echeances.map((e) => [e.pret.employeeId, e]));
    const absencesDe = grouper(absences);

    const lignes = await Promise.all(salaries.map(async (s) => {
        const salaire = await remuneration.salaireA(s.id, mois.gte);

        // Congés sans solde, bornés au mois : un congé du 25 au 5 ne compte
        // ici que ses jours du mois traité.
        const periodes = (congesDe.get(s.id) || []).map((c) => {
            const du = new Date(Math.max(new Date(c.startDate).getTime(), mois.gte.getTime()));
            const au = new Date(Math.min(new Date(c.endDate).getTime(), dernierJour.getTime()));
            return { du, au, jours: joursFeries.joursOuvrables(du, au, index).jours };
        });

        let heuresSup = null;
        const siens = pointagesDe.get(s.id);
        if (siens && siens.length > 0) {
            const { journees, anomalies } = tempsTravail.apparier(siens);
            heuresSup = {
                ...tempsTravail.ventilerHeuresSup(journees, index),
                journees: journees.length,
                anomalies: anomalies.length,
                exploitable: anomalies.length === 0
            };
        }

        const echeance = echeanceDe.get(s.id) || null;
        const existant = bulletinDe.get(s.id) || null;

        return {
            employeeId: s.id,
            nom: `${s.lastName} ${s.firstName}`.trim(),
            poste: s.positionTitle,
            departement: s.department,
            salaire,
            bulletin: existant && {
                id: existant.id,
                statut: existant.status,
                signe: Boolean(existant.signedAt),
                variables: {
                    overtimeHours: existant.overtimeHours || 0,
                    heuresSupDetail: existant.heuresSupDetail || null,
                    leaveDays: existant.leaveDays || 0,
                    bonus: existant.bonus || 0,
                    // Les retenues enregistrées incluent l'échéance de prêt que
                    // le serveur ajoute lui-même. La reproposer telle quelle la
                    // ferait prélever une seconde fois à la relance.
                    deductions: Math.max((existant.deductions || 0)
                        - (echeance && echeance.payrollId === existant.id ? echeance.montant : 0), 0)
                }
            },
            proposition: {
                joursSansSolde: {
                    jours: periodes.reduce((t, p) => t + p.jours, 0),
                    conges: periodes
                },
                heuresSup,
                absencesNonJustifiees: (absencesDe.get(s.id) || []).length,
                echeancePret: echeance ? echeance.montant : 0
            }
        };
    }));

    return {
        periode: mois.libelle,
        cloture: { cloturee: situation.cloturee, derniere: situation.derniere },
        regles: {
            heuresHebdomadaires: tempsTravail.HEURES_HEBDO,
            nuit: `${tempsTravail.NUIT_DEBUT} h – ${tempsTravail.NUIT_FIN} h`,
            seuilPremieresHeures: tempsTravail.SEUIL_PREMIERES_HEURES_SUP
        },
        lacunes: {
            sansSalaire: lignes.filter((l) => l.salaire.montant == null).length,
            pointagesAnomalies: lignes.filter((l) => l.proposition.heuresSup && !l.proposition.heuresSup.exploitable).length
        },
        lignes
    };
}

module.exports = { preparer, TYPES_SANS_SOLDE };
