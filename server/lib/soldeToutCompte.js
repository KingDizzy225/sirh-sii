const prisma = require('../prismaClient');
const rupture = require('./rupture');

/**
 * Décompte de fin de contrat.
 *
 * Ce calcul vivait dans le contrôleur, et n'alimentait qu'un écran. Le
 * document remis au salarié devant porter exactement les mêmes montants, il
 * fallait le sortir de là : un décompte recalculé au moment d'imprimer, à
 * partir de données qui ont pu bouger entre-temps, produirait deux papiers
 * différents pour un même départ — et c'est le salarié qui découvrirait
 * l'écart.
 *
 * D'où la séparation qui suit :
 *
 *  - `calculer` établit un **projet**, révisable, qui suit l'état de la base ;
 *  - `arreter` en fige une version, datée et nominative, qui ne bouge plus ;
 *  - le reçu remis au salarié n'est produit que depuis cette version figée.
 */

const arrondir1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

/**
 * Projet de décompte pour un salarié.
 * @returns {Promise<object|null>} null si le salarié est introuvable.
 */
async function calculer(employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return null;

    // Dernier bulletin connu : base du salaire de référence
    const dernierBulletin = await prisma.payroll.findFirst({
        where: { employeeId },
        orderBy: { period: 'desc' }
    });

    // Le salaire brut n'est pas stocké tel quel : le bulletin conserve le
    // salaire de base, sur lequel se calcule l'indemnité de congés payés.
    const salaireMensuel = dernierBulletin ? (dernierBulletin.baseSalary || 0) : 0;
    const salaireJournalier = salaireMensuel > 0 ? salaireMensuel / 30 : 0;

    // Congés acquis non pris
    const soldeConges = employee.annualLeaveBalance || 0;
    const indemniteConges = Math.round(soldeConges * salaireJournalier);

    // Avances accordées mais non encore déduites d'une paie
    const avances = await prisma.salaryAdvance.findMany({
        where: {
            employeeId,
            status: { in: ['Approuvé', 'APPROVED'] },
            deductedOnPayrollId: null
        },
        select: { id: true, amount: true, requestedAt: true, reason: true }
    });
    const totalAvances = avances.reduce((s, a) => s + (a.amount || 0), 0);

    // Ancienneté au jour du départ (ou à ce jour si non renseigné)
    const dateSortie = employee.exitDate ? new Date(employee.exitDate) : new Date();
    const embauche = new Date(employee.hireDate);
    const anneesAnciennete = Math.max(
        (dateSortie - embauche) / (365.25 * 24 * 3600 * 1000),
        0
    );

    /**
     * Nature de la rupture. Elle conditionne l'indemnité de licenciement,
     * et l'application l'ignorait : elle la lit désormais dans la procédure
     * ouverte à l'égard du salarié, plutôt que de la demander à nouveau.
     */
    const procedure = await prisma.procedure.findFirst({
        where: { employeeId, statut: 'CLOTUREE' },
        orderBy: { clotureeLe: 'desc' },
        select: { type: true, motif: true, issue: true, clotureeLe: true }
    });

    /**
     * Salaire de référence de l'indemnité : moyenne des bulletins connus,
     * dans la limite de douze mois. Retenir le seul dernier bulletin
     * exposerait le calcul à un mois atypique — une prime exceptionnelle
     * gonflerait l'indemnité, un mois d'absence la réduirait.
     */
    const douzeDerniers = await prisma.payroll.findMany({
        where: { employeeId },
        orderBy: { period: 'desc' },
        take: 12,
        select: { baseSalary: true, period: true }
    });
    const moisRetenus = douzeDerniers.filter((b) => (b.baseSalary || 0) > 0);
    const salaireMoyen = moisRetenus.length > 0
        ? moisRetenus.reduce((t, b) => t + (b.baseSalary || 0), 0) / moisRetenus.length
        : 0;

    const indemnisable = procedure
        ? rupture.NATURES_INDEMNISABLES.includes(procedure.type)
        : false;

    const indemnite = indemnisable
        ? rupture.calculerIndemnite(anneesAnciennete, salaireMoyen)
        : { montant: 0, eligible: false, tranches: [], motifIneligibilite: null };

    const net = indemniteConges + indemnite.montant - totalAvances;

    return {
        salarie: {
            nom: `${employee.firstName} ${employee.lastName}`,
            poste: employee.positionTitle,
            dateEmbauche: employee.hireDate,
            dateSortie: employee.exitDate || null,
            ancienneteAnnees: arrondir1(anneesAnciennete)
        },
        base: {
            salaireMensuelReference: Math.round(salaireMensuel),
            sourceReference: dernierBulletin
                ? `Salaire de base du bulletin de ${new Date(dernierBulletin.period).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                : 'Aucun bulletin de paie enregistré',
            salaireJournalier: Math.round(salaireJournalier)
        },
        rupture: procedure ? {
            nature: procedure.type,
            motif: procedure.motif,
            issue: procedure.issue,
            clotureeLe: procedure.clotureeLe
        } : null,
        indemniteLicenciement: {
            ...indemnite,
            salaireMoyenReference: Math.round(salaireMoyen),
            moisRetenus: moisRetenus.length,
            bareme: rupture.decrireBareme(),
            ancienneteMinimale: rupture.ANCIENNETE_MINIMALE
        },
        lignes: [
            {
                libelle: 'Indemnité compensatrice de congés payés',
                detail: `${soldeConges} jour(s) acquis non pris`,
                montant: indemniteConges,
                sens: 'credit'
            },
            ...(indemnisable && indemnite.eligible ? [{
                libelle: 'Indemnité de licenciement',
                detail: `${arrondir1(anneesAnciennete)} an(s) d'ancienneté, ` +
                        `salaire moyen de ${Math.round(salaireMoyen).toLocaleString('fr-FR')} F ` +
                        `sur ${moisRetenus.length} mois`,
                montant: indemnite.montant,
                sens: 'credit'
            }] : []),
            {
                libelle: 'Avances sur salaire non déduites',
                detail: `${avances.length} avance(s) en cours`,
                montant: totalAvances,
                sens: 'debit'
            }
        ],
        avances,
        netEstime: net,
        avertissements: [
            !dernierBulletin
                ? "Aucun bulletin de paie n'a été trouvé : le salaire de référence est à saisir manuellement."
                : null,
            !employee.exitDate
                ? "La date de sortie n'est pas renseignée : l'ancienneté est calculée à ce jour."
                : null,
            !procedure
                ? "Aucune procédure close n'a été trouvée pour ce salarié : la nature de la rupture est inconnue, et l'indemnité de licenciement n'est donc pas calculée."
                : null,
            procedure && !indemnisable
                ? `Rupture de nature « ${procedure.type} » : elle n'ouvre pas droit à l'indemnité de licenciement.`
                : null,
            indemnisable && !indemnite.eligible && indemnite.motifIneligibilite
                ? `Indemnité de licenciement non calculée. ${indemnite.motifIneligibilite}`
                : null,
            indemnisable && indemnite.eligible
                ? "L'indemnité de licenciement est calculée d'après le barème paramétré. Elle reste soumise à l'appréciation de la RH : une faute lourde en prive le salarié, et cette qualification ne relève pas de l'application."
                : null,
            moisRetenus.length > 0 && moisRetenus.length < 12
                ? `Salaire de référence établi sur ${moisRetenus.length} mois au lieu de douze : l'historique de paie est incomplet.`
                : null,
            'Ce décompte est un projet à vérifier avant établissement du solde de tout compte définitif.'
        ].filter(Boolean)
    };
}

/**
 * Ce qui empêche d'établir un reçu, par opposition à ce qui mérite seulement
 * un avertissement à l'écran.
 *
 * La distinction est celle-ci : un reçu pour solde de tout compte est un
 * document que le salarié signe et qui vaut décharge. Le produire sur une base
 * incomplète ne rend service à personne — ni au salarié, qui signerait un
 * montant faux, ni à l'entreprise, qui perdrait le bénéfice de la décharge.
 */
function obstacles(projet) {
    const empechements = [];
    if (!projet.salarie.dateSortie) {
        empechements.push(
            "La date de sortie n'est pas renseignée : un reçu pour solde de tout compte " +
            "sans date de fin de contrat ne se rattache à rien."
        );
    }
    if (projet.base.salaireMensuelReference <= 0) {
        empechements.push(
            "Aucun bulletin de paie n'est enregistré pour ce salarié : l'indemnité " +
            "compensatrice de congés payés serait calculée sur un salaire nul."
        );
    }
    return empechements;
}

/**
 * Fige le décompte.
 *
 * Le détail est conservé tel quel, dans sa version du jour de l'arrêté :
 * c'est lui, et non un nouveau calcul, qui sera imprimé sur le reçu. Un
 * décompte déjà arrêté peut être repris — une erreur se corrige — mais les
 * reçus déjà émis sont alors révoqués : deux reçus valides portant des
 * montants différents seraient pires qu'un reçu faux.
 */
async function arreter(employeeId, { par, observations } = {}) {
    const projet = await calculer(employeeId);
    if (!projet) {
        const e = new Error('Employé introuvable.');
        e.code = 'INTROUVABLE';
        throw e;
    }

    const empechements = obstacles(projet);
    if (empechements.length > 0) {
        const e = new Error(empechements.join(' '));
        e.code = 'INCOMPLET';
        e.empechements = empechements;
        throw e;
    }

    const existant = await prisma.soldeToutCompte.findUnique({ where: { employeeId } });

    const donnees = {
        arreteLe: new Date(),
        arretePar: par || null,
        dateSortie: new Date(projet.salarie.dateSortie),
        netArrete: projet.netEstime,
        detail: JSON.stringify(projet),
        observations: observations || null,
        remisLe: null
    };

    const arrete = existant
        ? await prisma.soldeToutCompte.update({ where: { employeeId }, data: donnees })
        : await prisma.soldeToutCompte.create({ data: { employeeId, ...donnees } });

    // Les reçus émis sur l'ancien arrêté cessent d'être valides à la
    // vérification. Le QR déjà remis au salarié le dira.
    let revoques = 0;
    if (existant) {
        const r = await prisma.issuedDocument.updateMany({
            where: { employeeId, type: 'RECU_SOLDE_TOUT_COMPTE', revokedAt: null },
            data: {
                revokedAt: new Date(),
                revokedReason: `Décompte repris le ${new Date().toLocaleDateString('fr-FR')}.`
            }
        });
        revoques = r.count;
    }

    return { arrete, projet, revoques };
}

/** Décompte arrêté d'un salarié, détail déjà relu. */
async function lireArrete(employeeId) {
    const arrete = await prisma.soldeToutCompte.findUnique({ where: { employeeId } });
    if (!arrete) return null;
    let detail = null;
    try {
        detail = JSON.parse(arrete.detail);
    } catch (e) {
        console.error('[SOLDE] Détail illisible pour', employeeId, ':', e.message);
    }
    return { ...arrete, detail };
}

module.exports = { calculer, arreter, lireArrete, obstacles };
