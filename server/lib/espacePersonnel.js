const prisma = require('../prismaClient');
const conges = require('./conges');
const paie = require('./paie');
const explication = require('./explication');
const primeAnnuelle = require('./primeAnnuelle');
const provisionConges = require('./provisionConges');

/**
 * Ce que le salarié peut voir de son propre dossier.
 *
 * Le portail lui permettait de demander — une absence, une avance, une
 * attestation — sans rien lui montrer. Il remplissait donc une demande de
 * congés sans connaître son solde, recevait un bulletin sans explication, et
 * découvrait un rappel sur une ligne qu'il n'avait jamais vue.
 *
 * **Le périmètre est strict.** Ces fonctions ne rendent que les données du
 * porteur du badge, et seulement celles qui le concernent : ni l'avis du
 * médecin du travail — qui ne regarde que lui et le médecin —, ni les
 * appréciations de ses responsables, ni ce que l'entreprise provisionne à son
 * sujet. Un droit acquis lui appartient ; une note interne, non.
 */

const arrondir = (n) => Math.round((Number(n) || 0) * 100) / 100;
const jours = (de, a) => Math.round((new Date(a) - new Date(de)) / 86400000);

/**
 * Droits acquis : congés, ancienneté, prime de fin d'année.
 *
 * Le solde qui fait foi est celui porté par la fiche — c'est lui qu'on
 * décompte. La décomposition l'accompagne pour expliquer d'où il vient, et
 * n'est pas présentée comme un second solde qui le contredirait.
 */
async function droits(employeeId, reference = new Date()) {
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            id: true, firstName: true, hireDate: true, gender: true, childrenCount: true,
            annualLeaveBalance: true, leaveBalanceSource: true, baseSalary: true,
            contractType: true, exitDate: true
        }
    });
    if (!salarie) return null;

    const prisEnCours = await prisma.leave.aggregate({
        _sum: { durationDays: true },
        where: {
            employeeId, status: 'Approved', type: 'Annual',
            startDate: { gte: conges.debutAnneeReference(salarie.hireDate, reference) }
        }
    });

    const detail = conges.soldeOuverture({
        hireDate: salarie.hireDate,
        gender: salarie.gender,
        childrenCount: salarie.childrenCount,
        joursPris: prisEnCours._sum.durationDays || 0,
        reference
    });

    const anciennete = paie.calculerPrimeAnciennete(salarie.baseSalary, salarie.hireDate, reference);

    // Valeur d'une journée : la même méthode que la provision comptable, pour
    // que le salarié et l'entreprise parlent du même chiffre.
    const bulletins = await prisma.payroll.findMany({
        where: { employeeId, period: { lte: reference } },
        orderBy: { period: 'desc' }, take: provisionConges.MOIS_MOYENNE,
        select: { grossSalary: true, baseSalary: true }
    });
    const montants = bulletins
        .map((b) => (b.grossSalary != null ? b.grossSalary : b.baseSalary))
        .filter((m) => Number.isFinite(m) && m > 0);
    const brutMoyen = montants.length
        ? montants.reduce((a, b) => a + b, 0) / montants.length
        : salarie.baseSalary;

    const annee = new Date(reference).getUTCFullYear();
    const moisPresents = primeAnnuelle.moisPresents(salarie, annee, reference);
    const primeAcquise = primeAnnuelle.montantPour({ base: salarie.baseSalary, mois: moisPresents });

    const rappels = await prisma.rappelSalaire.findMany({
        where: { employeeId, statut: 'A_VERSER' },
        select: { id: true, motif: true, total: true, periodeDebut: true, periodeFin: true }
    });

    return {
        prenom: salarie.firstName,
        conges: {
            // Le solde opposable, celui que la paie décompte.
            solde: arrondir(salarie.annualLeaveBalance),
            source: salarie.leaveBalanceSource,
            valeurJour: brutMoyen ? provisionConges.valeurJour(brutMoyen) : null,
            detail: detail.detail || null,
            joursPris: arrondir(prisEnCours._sum.durationDays || 0)
        },
        anciennete: {
            annees: anciennete.annees,
            montantMensuel: anciennete.montant,
            active: paie.PRIME_ANCIENNETE_ACTIVE
        },
        primeFinAnnee: {
            parametree: primeAnnuelle.FRACTION !== null,
            annee,
            moisComptes: moisPresents,
            acquis: primeAcquise
        },
        rappels: rappels.map((r) => ({
            id: r.id, motif: r.motif, total: r.total,
            du: r.periodeDebut, au: r.periodeFin
        }))
    };
}

/**
 * Derniers bulletins, expliqués ligne par ligne.
 *
 * L'explication existait déjà, réservée aux comptes RH : le salarié recevait
 * le PDF, et l'explication de ce PDF restait de l'autre côté du guichet.
 */
async function bulletins(employeeId, combien = 3) {
    const fiches = await prisma.payroll.findMany({
        where: { employeeId },
        orderBy: { period: 'desc' },
        take: Math.min(Math.max(parseInt(combien, 10) || 3, 1), 12)
    });
    return fiches.map((fiche) => {
        const explique = explication.expliquer(fiche, null);
        return {
            id: fiche.id,
            periode: fiche.period,
            net: fiche.netSalary,
            brut: fiche.grossSalary,
            statut: fiche.status,
            lignes: explique.composition?.lignes || [],
            complet: explique.composition?.complet !== false
        };
    });
}

/**
 * Échéances qui concernent le salarié lui-même.
 *
 * Les alertes partaient aux ressources humaines ; l'intéressé, lui, découvrait
 * la fin de son CDD ou l'expiration de sa visite médicale le jour où elle lui
 * était opposée.
 */
async function echeances(employeeId, reference = new Date()) {
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, contractType: true, contractEndDate: true, hireDate: true }
    });
    if (!salarie) return [];

    const liste = [];

    if (salarie.contractEndDate) {
        liste.push({
            code: 'FIN_CONTRAT',
            libelle: salarie.contractType === 'STAGE' ? 'Fin de votre stage' : 'Terme de votre contrat',
            date: salarie.contractEndDate,
            dans: jours(reference, salarie.contractEndDate)
        });
    }

    const visite = await prisma.medicalVisit.findFirst({
        where: { employeeId },
        orderBy: { expiryDate: 'desc' },
        // L'avis du médecin ne sort pas d'ici : seule la date de validité est
        // une information du salarié au sens de ce portail.
        select: { expiryDate: true }
    });
    if (visite) {
        liste.push({
            code: 'VISITE_MEDICALE',
            libelle: 'Validité de votre visite médicale',
            date: visite.expiryDate,
            dans: jours(reference, visite.expiryDate)
        });
    }

    const echeancesPret = await prisma.echeancePret.findMany({
        where: { statut: 'A_RETENIR', pret: { employeeId, statut: 'EN_COURS' } },
        orderBy: { periode: 'asc' },
        select: { periode: true, montant: true }
    });
    if (echeancesPret.length > 0) {
        liste.push({
            code: 'PRET',
            libelle: `Remboursement de votre prêt — ${echeancesPret.length} échéance(s)`,
            date: new Date(`${echeancesPret[echeancesPret.length - 1].periode}-01T00:00:00.000Z`),
            dans: null,
            precision: `${Math.round(echeancesPret.reduce((s, e) => s + e.montant, 0))} FCFA restant à retenir`
        });
    }

    return liste.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Astreintes à venir du salarié. */
async function astreintes(employeeId, reference = new Date()) {
    const periodes = await prisma.astreinte.findMany({
        where: { employeeId, fin: { gte: reference }, statut: { in: ['PLANIFIEE', 'EFFECTUEE'] } },
        orderBy: { debut: 'asc' },
        take: 20,
        select: { id: true, debut: true, fin: true, type: true, site: true, compensation: true, statut: true }
    });
    return periodes;
}

module.exports = { droits, bulletins, echeances, astreintes };
