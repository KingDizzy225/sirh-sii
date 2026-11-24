const prisma = require('../prismaClient');
const rupture = require('./rupture');

/**
 * Départs à la retraite.
 *
 * L'application connaissait la date de naissance de chacun et n'en tirait
 * rien : aucune prévision, aucun préavis, et surtout — un salarié partant à la
 * retraite ressortait du décompte de départ avec **zéro** indemnité, puisque
 * seul le licenciement en ouvrait une. L'allocation de fin de carrière n'était
 * donc jamais calculée par l'application ; elle l'était à la main, ou pas.
 *
 * **Ce qui n'est pas inventé.** L'âge de départ et le régime de l'allocation
 * tiennent au régime CNPS et à la convention collective. `RETRAITE_AGE` porte
 * l'âge retenu ; `RETRAITE_BAREME_ALLOCATION` le barème, dans la même forme que
 * celui de l'indemnité de licenciement. Sans barème déclaré, le module dit
 * qu'il ne peut pas chiffrer l'allocation — il ne recopie pas celui du
 * licenciement, qui n'a ni la même cause ni le même régime fiscal.
 */

/** Âge de départ retenu, en années. */
const AGE_DEPART = parseFloat(process.env.RETRAITE_AGE || '60');

/** Préavis d'anticipation : à partir de quand un départ est annoncé. */
const PREAVIS_MOIS = Math.max(parseInt(process.env.RETRAITE_PREAVIS_MOIS, 10) || 12, 1);

/**
 * Barème de l'allocation de fin de carrière, s'il a été déclaré.
 *
 * Lu à chaque appel, et non figé au chargement : le décompte de départ garde
 * ce module en mémoire, et un barème figé au premier `require` resterait vide
 * pour toute la vie du processus alors que la variable est bien posée.
 */
function baremeAllocation() {
    const brut = String(process.env.RETRAITE_BAREME_ALLOCATION || '').trim();
    if (!brut) return null;
    const lu = brut.split(',').map((t) => {
        const [borne, taux] = t.split(':');
        return { jusqua: parseFloat(borne), taux: parseFloat(taux) };
    }).filter((t) => Number.isFinite(t.jusqua) && Number.isFinite(t.taux))
      .sort((a, b) => a.jusqua - b.jusqua);
    return lu.length ? lu : null;
}

const MOTIF_SANS_BAREME = "Le barème de l'allocation de fin de carrière n'est pas déclaré "
    + '(RETRAITE_BAREME_ALLOCATION). Aucun montant n\'est avancé : le régime de cette allocation '
    + "n'est pas celui de l'indemnité de licenciement, et le recopier tromperait.";

const arrondir1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

/** Âge à une date. Fonction pure. */
function ageA(naissance, date = new Date()) {
    if (!naissance) return null;
    const ms = new Date(date) - new Date(naissance);
    return ms > 0 ? ms / (365.25 * 24 * 3600 * 1000) : null;
}

/** Date à laquelle l'âge de départ est atteint. Fonction pure. */
function dateDeDepart(naissance, age = AGE_DEPART) {
    if (!naissance) return null;
    const d = new Date(naissance);
    const annees = Math.floor(age);
    const moisEnPlus = Math.round((age - annees) * 12);
    return new Date(Date.UTC(
        d.getUTCFullYear() + annees,
        d.getUTCMonth() + moisEnPlus,
        d.getUTCDate()
    ));
}

/**
 * Allocation de fin de carrière. Fonction pure.
 * @returns {{montant:number|null, chiffrable:boolean, motif:string|null, tranches:object[]}}
 */
function allocation(anneesAnciennete, salaireMoyenMensuel, bareme = baremeAllocation()) {
    if (!bareme) {
        return { montant: null, chiffrable: false, motif: MOTIF_SANS_BAREME, tranches: [] };
    }
    const anciennete = Math.max(Number(anneesAnciennete) || 0, 0);
    const salaire = Math.max(Number(salaireMoyenMensuel) || 0, 0);
    if (anciennete === 0 || salaire === 0) {
        return { montant: 0, chiffrable: true, motif: null, tranches: [] };
    }

    let montant = 0;
    let precedent = 0;
    const tranches = [];
    for (const tranche of bareme) {
        if (anciennete <= precedent) break;
        const annees = Math.min(anciennete, tranche.jusqua) - precedent;
        if (annees > 0) {
            const part = salaire * tranche.taux * annees;
            montant += part;
            tranches.push({
                de: precedent, a: Math.min(anciennete, tranche.jusqua),
                annees: arrondir1(annees), taux: tranche.taux, montant: Math.round(part)
            });
        }
        precedent = tranche.jusqua;
    }
    return { montant: Math.round(montant), chiffrable: true, motif: null, tranches };
}

/**
 * Salariés atteignant l'âge de départ dans l'horizon annoncé.
 *
 * Les dossiers sans date de naissance ne sont pas écartés en silence : ils
 * sont comptés à part, puisqu'un départ qu'on ne voit pas venir est
 * exactement ce que cette page existe pour éviter.
 */
async function prevision(horizonMois = PREAVIS_MOIS, reference = new Date()) {
    const salaries = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' } },
        select: {
            id: true, firstName: true, lastName: true, birthDate: true, hireDate: true,
            positionTitle: true, department: true, baseSalary: true, contractType: true
        }
    });

    const limite = new Date(reference);
    limite.setUTCMonth(limite.getUTCMonth() + Math.max(parseInt(horizonMois, 10) || PREAVIS_MOIS, 1));

    const lignes = [];
    let sansDateDeNaissance = 0;

    for (const s of salaries) {
        if (!s.birthDate) { sansDateDeNaissance += 1; continue; }
        const depart = dateDeDepart(s.birthDate);
        if (!depart || depart > limite) continue;

        const anciennete = s.hireDate
            ? Math.max((depart - new Date(s.hireDate)) / (365.25 * 24 * 3600 * 1000), 0)
            : 0;
        const chiffre = allocation(anciennete, s.baseSalary);

        lignes.push({
            employeeId: s.id,
            nom: `${s.lastName} ${s.firstName}`.trim(),
            fonction: s.positionTitle,
            departement: s.department,
            naissance: s.birthDate,
            age: arrondir1(ageA(s.birthDate, reference)),
            dateDepart: depart,
            dansJours: Math.round((depart - reference) / 86400000),
            // Un âge déjà dépassé n'est pas une erreur de saisie : c'est un
            // départ qui aurait dû être préparé.
            depasse: depart < reference,
            ancienneteAuDepart: arrondir1(anciennete),
            allocation: chiffre.montant,
            allocationChiffrable: chiffre.chiffrable
        });
    }

    return {
        age: AGE_DEPART,
        horizonMois: parseInt(horizonMois, 10) || PREAVIS_MOIS,
        baremeDeclare: baremeAllocation() !== null,
        motifSansBareme: baremeAllocation() ? null : MOTIF_SANS_BAREME,
        sansDateDeNaissance,
        lignes: lignes.sort((a, b) => new Date(a.dateDepart) - new Date(b.dateDepart)),
        total: lignes.reduce((s, l) => s + (l.allocation || 0), 0)
    };
}

module.exports = {
    AGE_DEPART, PREAVIS_MOIS, baremeAllocation, MOTIF_SANS_BAREME,
    ageA, dateDeDepart, allocation, prevision,
    // Le barème du licenciement reste distinct : il est exposé ici pour que
    // l'écran puisse montrer les deux sans les confondre.
    baremeLicenciement: rupture.BAREME
};
