const prisma = require('../prismaClient');
const remuneration = require('./remuneration');

/**
 * Prime de fin d'année, dite treizième mois.
 *
 * Elle n'existait nulle part dans l'application, alors qu'elle se verse en
 * décembre et pèse un mois de masse salariale d'un coup. Deux conséquences :
 * la trésorerie la découvrait tard, et un salarié parti en septembre repartait
 * sans la part qu'il avait acquise.
 *
 * **Aucune règle n'est inventée.** Le treizième mois n'est pas une obligation
 * légale générale en Côte d'Ivoire : il tient à la convention collective, à
 * l'accord d'entreprise ou à l'usage. Tant que `PRIME_FIN_ANNEE_FRACTION`
 * n'est pas posée, le module dit qu'il ne peut rien calculer — il ne suppose
 * pas qu'elle vaut un mois.
 *
 * **La provision se recalcule, la prime s'arrête.** Chaque mois, la provision
 * dit ce qui est acquis à ce jour. L'arrêté de fin d'exercice fige le montant
 * dû par salarié ; c'est lui qui part en paie, et il ne bouge plus ensuite.
 */

const nombre = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };

/** Fraction d'un salaire mensuel versée pour une année pleine. Null si non paramétrée. */
const FRACTION = (() => {
    const brut = String(process.env.PRIME_FIN_ANNEE_FRACTION || '').trim();
    if (!brut) return null;
    const n = parseFloat(brut);
    return Number.isFinite(n) && n > 0 ? n : null;
})();

/** Mois de paie sur lequel la prime est portée par défaut. */
const MOIS_VERSEMENT = Math.min(Math.max(parseInt(process.env.PRIME_FIN_ANNEE_MOIS, 10) || 12, 1), 12);

/** Ancienneté minimale exigée, en mois de présence dans l'exercice. */
const MOIS_MINIMUM = nombre(process.env.PRIME_FIN_ANNEE_MOIS_MINIMUM, 0);

const arrondir = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Mois de présence d'un salarié dans un exercice, entre 0 et 12.
 *
 * Un mois entamé compte pour ce qu'il vaut : arriver le 15 juin donne un demi
 * mois, pas un mois entier ni zéro. Fonction pure.
 */
function moisPresents({ hireDate, exitDate }, annee, auJour = null) {
    const debutAnnee = Date.UTC(annee, 0, 1);
    const finAnnee = Date.UTC(annee, 11, 31);
    const borneHaute = auJour ? Math.min(new Date(auJour).getTime(), finAnnee) : finAnnee;

    const entree = Math.max(hireDate ? new Date(hireDate).getTime() : debutAnnee, debutAnnee);
    const sortie = Math.min(exitDate ? new Date(exitDate).getTime() : borneHaute, borneHaute);
    if (!(sortie >= entree)) return 0;

    // Chaque mois est compté pour la part qu'il couvre, et non par division
    // des jours par une durée moyenne : celle-ci rendait 11,99 pour une année
    // entière, et un salarié présent du 1er janvier au 31 décembre aurait
    // touché une prime amputée d'un millième sans que personne ne sache
    // pourquoi.
    let total = 0;
    for (let m = 0; m < 12; m += 1) {
        const debutMois = Date.UTC(annee, m, 1);
        const finMois = Date.UTC(annee, m + 1, 0);
        const joursDuMois = (finMois - debutMois) / 86400000 + 1;
        const couvertDebut = Math.max(debutMois, entree);
        const couvertFin = Math.min(finMois, sortie);
        if (couvertFin >= couvertDebut) {
            total += ((couvertFin - couvertDebut) / 86400000 + 1) / joursDuMois;
        }
    }
    return Math.min(Math.max(arrondir(total), 0), 12);
}

/** Montant dû pour un salarié. Null si la règle n'est pas paramétrée. */
function montantPour({ base, mois }) {
    if (FRACTION === null) return null;
    if (mois < MOIS_MINIMUM) return 0;
    return arrondir(nombre(base, 0) * FRACTION * (mois / 12));
}

/**
 * Provision à ce jour : ce que l'exercice en cours a déjà engagé.
 * @returns {Promise<object>} totaux et détail, ou l'aveu que la règle manque
 */
async function provision(annee = new Date().getFullYear(), auJour = new Date()) {
    const salaries = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' } },
        select: { id: true, firstName: true, lastName: true, hireDate: true, exitDate: true, contractType: true }
    });

    const lignes = [];
    for (const s of salaries) {
        const reference = await remuneration.salaireA(s.id, auJour);
        const mois = moisPresents(s, annee, auJour);
        lignes.push({
            employeeId: s.id,
            nom: `${s.lastName} ${s.firstName}`.trim(),
            contrat: s.contractType,
            base: reference.montant,
            mois,
            montant: reference.montant == null ? null : montantPour({ base: reference.montant, mois })
        });
    }

    const chiffrables = lignes.filter((l) => l.montant != null);
    return {
        annee,
        auJour,
        parametree: FRACTION !== null,
        fraction: FRACTION,
        moisVersement: MOIS_VERSEMENT,
        moisMinimum: MOIS_MINIMUM,
        salaries: lignes.length,
        // Un salarié sans rémunération de référence n'est pas compté à zéro :
        // il est signalé, sans quoi la provision paraîtrait complète.
        sansReference: lignes.filter((l) => l.base == null).length,
        total: arrondir(chiffrables.reduce((s, l) => s + (l.montant || 0), 0)),
        lignes
    };
}

/**
 * Arrête les primes d'un exercice : fige un montant par salarié.
 * Ré-arrêter un exercice met à jour les lignes non encore versées et laisse
 * les autres intactes — une prime versée ne se réécrit pas.
 */
async function arreter(annee, { creePar = null } = {}) {
    if (FRACTION === null) {
        throw Object.assign(
            new Error("La règle de la prime de fin d'année n'est pas paramétrée (PRIME_FIN_ANNEE_FRACTION)."),
            { statut: 409 }
        );
    }
    const etat = await provision(annee, new Date(Date.UTC(annee, 11, 31)));
    const periodeVersement = new Date(Date.UTC(annee, MOIS_VERSEMENT - 1, 1));

    let crees = 0;
    let majs = 0;
    let figees = 0;
    for (const ligne of etat.lignes) {
        if (ligne.montant == null || ligne.montant <= 0) continue;
        const existante = await prisma.primeAnnuelle.findUnique({
            where: { employeeId_annee: { employeeId: ligne.employeeId, annee } }
        });
        if (existante && existante.statut !== 'A_VERSER') { figees += 1; continue; }
        if (existante) {
            await prisma.primeAnnuelle.update({
                where: { id: existante.id },
                data: { base: ligne.base, moisComptes: ligne.mois, montant: ligne.montant, periodeVersement }
            });
            majs += 1;
        } else {
            await prisma.primeAnnuelle.create({
                data: {
                    employeeId: ligne.employeeId, annee, base: ligne.base,
                    moisComptes: ligne.mois, montant: ligne.montant, periodeVersement, creePar
                }
            });
            crees += 1;
        }
    }
    return { annee, crees, majs, figees, total: etat.total, sansReference: etat.sansReference };
}

/** Primes à porter sur la paie d'une période. */
async function aVerser(employeeId, periode, payrollId = null) {
    const mois = new Date(periode);
    const debut = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth(), 1));
    return prisma.primeAnnuelle.findMany({
        where: {
            employeeId,
            OR: [
                { statut: 'A_VERSER', periodeVersement: debut },
                ...(payrollId ? [{ statut: 'VERSE', payrollId }] : [])
            ]
        }
    });
}

module.exports = { FRACTION, MOIS_VERSEMENT, MOIS_MINIMUM, moisPresents, montantPour, provision, arreter, aVerser };
