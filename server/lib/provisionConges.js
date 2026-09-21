const prisma = require('../prismaClient');
const paie = require('./paie');
const remuneration = require('./remuneration');

/**
 * Provision pour congés payés : la dette sociale.
 *
 * L'application tenait les soldes en jours et ne les a jamais valorisés. Ce
 * que l'entreprise devrait si tout le monde partait demain n'apparaissait donc
 * nulle part : ni au budget, ni au bilan, ni devant le commissaire aux
 * comptes. Un solde de congés est pourtant une dette exigible — elle se paie
 * au départ, en argent, dans le solde de tout compte.
 *
 * **Méthode retenue.** Valeur d'un jour = rémunération brute moyenne des douze
 * derniers bulletins enregistrés, divisée par le nombre de jours ouvrés du
 * mois. À défaut de bulletin, la rémunération de référence de la fiche prend
 * le relais, et la ligne le dit. Les charges patronales s'ajoutent au taux
 * appliqué par la paie : la dette n'est pas seulement le jour de congé, c'est
 * aussi ce qu'il coûte.
 *
 * **Ce que cette méthode n'est pas.** Une convention collective peut retenir
 * une autre assiette — les douze mois précédant la prise, la moyenne des
 * primes incluse ou non. Le chiffre produit est un ordre de grandeur sincère
 * et reproductible, pas un arrêté comptable : il porte sa méthode avec lui,
 * pour qu'un comptable puisse la contester plutôt que la deviner.
 */

const MOIS_MOYENNE = Math.max(parseInt(process.env.PROVISION_CONGES_MOIS_MOYENNE, 10) || 12, 1);
const arrondir = (n) => Math.round((Number(n) || 0) * 100) / 100;

const METHODE = "Brut moyen des douze derniers bulletins ÷ jours ouvrés du mois, "
    + "multiplié par le solde de congés, charges patronales comprises.";

/** Valeur d'une journée de congé. Fonction pure. */
function valeurJour(brutMoyen, joursOuvres = paie.TAUX.joursOuvres) {
    const jours = Number(joursOuvres) > 0 ? Number(joursOuvres) : 26;
    return arrondir(Math.max(Number(brutMoyen) || 0, 0) / jours);
}

/**
 * Dette d'un salarié : jours dus, valeur, charges.
 * Fonction pure, pour être vérifiable sans base.
 */
function detteSalarie({ solde, brutMoyen, tauxPatronal = paie.TAUX.cnpsPatronal }) {
    const jours = Math.max(Number(solde) || 0, 0);
    const jour = valeurJour(brutMoyen);
    const conges = arrondir(jours * jour);
    const charges = arrondir(conges * (Number(tauxPatronal) || 0));
    return { jours, valeurJour: jour, conges, charges, total: arrondir(conges + charges) };
}

/** État de la dette à une date. */
async function etat(auJour = new Date()) {
    const salaries = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' } },
        select: {
            id: true, firstName: true, lastName: true, department: true,
            annualLeaveBalance: true, leaveBalanceSource: true, contractType: true
        }
    });

    const lignes = [];
    for (const s of salaries) {
        const bulletins = await prisma.payroll.findMany({
            where: { employeeId: s.id, period: { lte: new Date(auJour) } },
            orderBy: { period: 'desc' },
            take: MOIS_MOYENNE,
            select: { grossSalary: true, baseSalary: true }
        });
        const montants = bulletins
            .map((b) => (b.grossSalary != null ? b.grossSalary : b.baseSalary))
            .filter((m) => Number.isFinite(m) && m > 0);

        let brutMoyen = null;
        let source = 'BULLETINS';
        if (montants.length > 0) {
            brutMoyen = montants.reduce((a, b) => a + b, 0) / montants.length;
        } else {
            const reference = await remuneration.salaireA(s.id, auJour);
            brutMoyen = reference.montant;
            source = reference.montant == null ? 'INCONNU' : 'FICHE';
        }

        const dette = brutMoyen == null
            ? { jours: Math.max(s.annualLeaveBalance || 0, 0), valeurJour: null, conges: null, charges: null, total: null }
            : detteSalarie({ solde: s.annualLeaveBalance, brutMoyen });

        lignes.push({
            employeeId: s.id,
            nom: `${s.lastName} ${s.firstName}`.trim(),
            departement: s.department,
            contrat: s.contractType,
            soldeSource: s.leaveBalanceSource,
            moisRetenus: montants.length,
            source,
            brutMoyen: brutMoyen == null ? null : arrondir(brutMoyen),
            ...dette
        });
    }

    const chiffrables = lignes.filter((l) => l.total != null);
    return {
        auJour,
        methode: METHODE,
        moisMoyenne: MOIS_MOYENNE,
        joursOuvres: paie.TAUX.joursOuvres,
        tauxPatronal: paie.TAUX.cnpsPatronal,
        salaries: lignes.length,
        // Salariés dont la dette ne peut pas être chiffrée : ni bulletin, ni
        // rémunération de référence. Les compter pour zéro donnerait une
        // provision faussement rassurante.
        sansValorisation: lignes.length - chiffrables.length,
        joursDus: arrondir(lignes.reduce((s, l) => s + l.jours, 0)),
        totalConges: arrondir(chiffrables.reduce((s, l) => s + l.conges, 0)),
        totalCharges: arrondir(chiffrables.reduce((s, l) => s + l.charges, 0)),
        total: arrondir(chiffrables.reduce((s, l) => s + l.total, 0)),
        lignes: lignes.sort((a, b) => (b.total || 0) - (a.total || 0))
    };
}

/** Fige l'état à une date : c'est ce détail qui sera opposé plus tard. */
async function arreter({ arreteAu = new Date(), note = null, creePar = null } = {}) {
    const courant = await etat(arreteAu);
    return prisma.arreteProvision.create({
        data: {
            arreteAu: new Date(arreteAu),
            lignes: courant.lignes,
            totalConges: courant.totalConges,
            totalCharges: courant.totalCharges,
            salaries: courant.salaries,
            note,
            creePar
        }
    });
}

module.exports = { METHODE, MOIS_MOYENNE, valeurJour, detteSalarie, etat, arreter };
