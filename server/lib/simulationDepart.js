const prisma = require('../prismaClient');
const rupture = require('./rupture');
const { TAUX } = require('./paie');

/**
 * Ce que coûterait un départ, avant qu'il soit décidé.
 *
 * `soldeToutCompte` ne calcule qu'une fois la sortie actée : il lit la date de
 * sortie au dossier et la nature de la rupture dans la procédure close. Or le
 * moment où le chiffre sert à quelque chose est antérieur — quand la RH et la
 * direction hésitent entre laisser un CDD s'éteindre, négocier un départ ou
 * engager un licenciement.
 *
 * Ce module compare les scénarios pour un même salarié, à une même date. Il ne
 * décide rien, n'enregistre rien, et ne remplace pas le décompte définitif :
 * c'est une projection, et chaque montant dit d'où il sort.
 *
 * Ce qu'il ne sait pas : les durées de préavis varient selon la catégorie
 * professionnelle et la convention applicable. La valeur par défaut est d'un
 * mois, réglable par `PREAVIS_MOIS_DEFAUT` — à confirmer par le conseil de
 * l'entreprise avant de s'en servir dans une négociation.
 */

const nombre = (v, defaut) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : defaut;
};

const PREAVIS_MOIS = nombre(process.env.PREAVIS_MOIS_DEFAUT, 1);
/** Prime de fin de contrat éventuelle, en part du salaire de la période. Nulle par défaut. */
const PRIME_PRECARITE = nombre(process.env.CDD_PRIME_PRECARITE_TAUX, 0);

const SCENARIOS = [
    {
        code: 'DEMISSION',
        libelle: 'Démission',
        preavis: true,
        preavisDuPar: 'salarié',
        indemnite: false,
        note: "Le préavis est dû par le salarié : il le travaille, ou l'employeur en est dispensé."
    },
    {
        code: 'LICENCIEMENT',
        libelle: 'Licenciement',
        preavis: true,
        preavisDuPar: 'employeur',
        indemnite: true,
        note: "L'indemnité suppose un motif légitime : une faute lourde en prive le salarié, "
            + "et cette qualification ne relève pas de l'application."
    },
    {
        code: 'RUPTURE_NEGOCIEE',
        libelle: 'Rupture négociée',
        preavis: false,
        preavisDuPar: null,
        indemnite: false,
        note: "Le montant négocié s'ajoute librement : il n'est pas calculable, il se discute. "
            + "Le total ci-dessous est donc un plancher."
    },
    {
        code: 'FIN_CDD',
        libelle: 'Fin de contrat à durée déterminée',
        preavis: false,
        preavisDuPar: null,
        indemnite: false,
        note: 'À son terme, le contrat prend fin sans indemnité de licenciement.'
    }
];

const arrondir = (n) => Math.round(n || 0);

/**
 * @param {string} employeeId
 * @param {{dateSortie?: string|Date}} options
 */
async function simuler(employeeId, { dateSortie } = {}) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            id: true, firstName: true, lastName: true, positionTitle: true, department: true,
            hireDate: true, exitDate: true, contractType: true, contractEndDate: true,
            annualLeaveBalance: true, baseSalary: true, status: true
        }
    });
    if (!employee) return null;

    const sortie = dateSortie ? new Date(dateSortie) : (employee.exitDate ? new Date(employee.exitDate) : new Date());
    const embauche = new Date(employee.hireDate);
    const anneesAnciennete = Math.max((sortie - embauche) / (365.25 * 24 * 3600 * 1000), 0);

    const [bulletins, avances] = await Promise.all([
        prisma.payroll.findMany({
            where: { employeeId }, orderBy: { period: 'desc' }, take: 12,
            select: { baseSalary: true, period: true }
        }),
        prisma.salaryAdvance.findMany({
            where: { employeeId, status: { in: ['Approuvé', 'APPROVED'] }, deductedOnPayrollId: null },
            select: { amount: true }
        })
    ]);

    const moisRetenus = bulletins.filter((b) => (b.baseSalary || 0) > 0);
    const salaireMoyen = moisRetenus.length > 0
        ? moisRetenus.reduce((t, b) => t + (b.baseSalary || 0), 0) / moisRetenus.length
        : (employee.baseSalary || 0);
    const salaireJournalier = salaireMoyen > 0 ? salaireMoyen / 30 : 0;

    const soldeConges = employee.annualLeaveBalance || 0;
    const indemniteConges = arrondir(soldeConges * salaireJournalier);
    const totalAvances = arrondir(avances.reduce((t, a) => t + (a.amount || 0), 0));

    const scenarios = SCENARIOS.map((s) => {
        const lignes = [];

        lignes.push({
            libelle: 'Indemnité compensatrice de congés payés',
            detail: `${soldeConges} jour(s) acquis non pris, à ${arrondir(salaireJournalier)} F par jour`,
            montant: indemniteConges,
            sens: 'credit'
        });

        if (s.preavis && PREAVIS_MOIS > 0) {
            lignes.push({
                libelle: `Préavis (${PREAVIS_MOIS} mois)`,
                detail: s.preavisDuPar === 'employeur'
                    ? "Dû par l'employeur s'il dispense le salarié de l'exécuter."
                    : 'Dû par le salarié : à sa charge s’il ne l’exécute pas.',
                montant: arrondir(salaireMoyen * PREAVIS_MOIS),
                sens: s.preavisDuPar === 'employeur' ? 'credit' : 'information'
            });
        }

        let indemnite = { montant: 0, eligible: false, motifIneligibilite: null, tranches: [] };
        if (s.indemnite) {
            indemnite = rupture.calculerIndemnite(anneesAnciennete, salaireMoyen);
            lignes.push({
                libelle: 'Indemnité de licenciement',
                detail: indemnite.eligible
                    ? `${Math.round(anneesAnciennete * 10) / 10} an(s) d'ancienneté, salaire moyen de `
                      + `${arrondir(salaireMoyen).toLocaleString('fr-FR')} F sur ${moisRetenus.length} mois`
                    : (indemnite.motifIneligibilite || 'Non éligible'),
                montant: indemnite.montant,
                sens: 'credit'
            });
        }

        if (s.code === 'FIN_CDD' && PRIME_PRECARITE > 0) {
            lignes.push({
                libelle: 'Prime de fin de contrat',
                detail: `${Math.round(PRIME_PRECARITE * 100)} % du salaire moyen`,
                montant: arrondir(salaireMoyen * PRIME_PRECARITE),
                sens: 'credit'
            });
        }

        if (totalAvances > 0) {
            lignes.push({
                libelle: 'Avances sur salaire non déduites',
                detail: `${avances.length} avance(s) en cours`,
                montant: totalAvances,
                sens: 'debit'
            });
        }

        const verse = lignes
            .filter((l) => l.sens === 'credit')
            .reduce((t, l) => t + l.montant, 0);
        const retenu = lignes
            .filter((l) => l.sens === 'debit')
            .reduce((t, l) => t + l.montant, 0);

        return {
            ...s,
            lignes,
            aVerser: arrondir(verse - retenu),
            // Le coût pour l'entreprise n'est pas ce que touche le salarié : les
            // sommes soumises à cotisation portent la part patronale.
            coutEmployeur: arrondir((verse - retenu) * (1 + TAUX.cnpsPatronal)),
            applicable: s.code !== 'FIN_CDD' || /^cdd$/i.test(String(employee.contractType || '').trim())
        };
    });

    return {
        salarie: {
            id: employee.id,
            nom: `${employee.lastName} ${employee.firstName}`.trim(),
            poste: employee.positionTitle,
            service: employee.department,
            contrat: employee.contractType || null,
            termeCdd: employee.contractEndDate || null,
            dateEmbauche: employee.hireDate,
            ancienneteAnnees: Math.round(anneesAnciennete * 10) / 10
        },
        hypotheses: {
            dateSortie: sortie,
            salaireMoyenReference: arrondir(salaireMoyen),
            moisRetenus: moisRetenus.length,
            soldeConges,
            preavisMois: PREAVIS_MOIS,
            primePrecarite: PRIME_PRECARITE,
            bareme: rupture.decrireBareme()
        },
        scenarios,
        avertissements: [
            moisRetenus.length === 0
                ? "Aucun bulletin enregistré : le salaire de référence vient de la fiche, ou vaut zéro."
                : null,
            moisRetenus.length > 0 && moisRetenus.length < 12
                ? `Salaire de référence établi sur ${moisRetenus.length} mois au lieu de douze.`
                : null,
            "Les durées de préavis varient selon la catégorie professionnelle et la convention "
            + `applicable : ${PREAVIS_MOIS} mois est une valeur par défaut, à confirmer.`,
            'Projection : rien n’est enregistré, et le décompte définitif reste celui arrêté au départ.'
        ].filter(Boolean)
    };
}

module.exports = { simuler, SCENARIOS, PREAVIS_MOIS, PRIME_PRECARITE };
