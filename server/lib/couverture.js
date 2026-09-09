/**
 * Couverture d'une équipe pendant une absence.
 *
 * La validation d'un congé regardait le solde, jamais la présence des autres.
 * Deux personnes de la même équipe pouvaient être approuvées sur les mêmes
 * jours sans que rien ne le signale : le responsable le découvrait le matin
 * venu.
 *
 * Ce module **avertit, il ne bloque pas**. Un chevauchement peut être voulu —
 * fermeture annuelle, période creuse, deux personnes sans lien fonctionnel —
 * et une règle qui refuserait serait contournée en une semaine. Ce qui manquait
 * n'était pas une interdiction, c'était l'information au moment de décider.
 */

/** Deux périodes se recouvrent-elles, bornes incluses ? */
function chevauchent(debutA, finA, debutB, finB) {
    return new Date(debutA) <= new Date(finB) && new Date(debutB) <= new Date(finA);
}

/**
 * Équipe d'un salarié.
 *
 * Le responsable direct d'abord : c'est l'équipe réelle, celle dont l'absence
 * simultanée pose problème. Le service à défaut, pour les salariés sans
 * responsable renseigné — sans quoi ils n'auraient jamais d'alerte.
 */
function definirEquipe(salarie) {
    return salarie.managerId
        ? { critere: 'RESPONSABLE', where: { managerId: salarie.managerId } }
        : { critere: 'SERVICE', where: { department: salarie.department } };
}

/**
 * Absences déjà validées qui recouvrent la période, dans l'équipe.
 *
 * @param {object} client        client Prisma
 * @param {object} salarie       celui qui demande
 * @param {Date|string} debut
 * @param {Date|string} fin
 * @param {string} [congeIgnore] identifiant du congé en cours d'examen
 */
async function conflits(client, salarie, debut, fin, congeIgnore) {
    const equipe = definirEquipe(salarie);

    const collegues = await client.employee.findMany({
        where: {
            ...equipe.where,
            id: { not: salarie.id },
            status: { not: 'TERMINATED' }
        },
        select: { id: true, firstName: true, lastName: true, positionTitle: true }
    });

    if (collegues.length === 0) {
        return {
            critere: equipe.critere,
            tailleEquipe: 1,
            conflits: [],
            // Seul dans son équipe : son absence ne chevauche celle de personne,
            // ce qui ne veut pas dire que le poste est couvert.
            motif: "Aucun collègue rattaché : l'application ne peut rien dire de la couverture du poste."
        };
    }

    const congesEquipe = await client.leave.findMany({
        where: {
            employeeId: { in: collegues.map((c) => c.id) },
            status: { in: ['APPROVED', 'PENDING_HR'] },
            startDate: { lte: new Date(fin) },
            endDate: { gte: new Date(debut) },
            ...(congeIgnore ? { id: { not: congeIgnore } } : {})
        },
        include: {
            employee: { select: { id: true, firstName: true, lastName: true, positionTitle: true } }
        },
        orderBy: { startDate: 'asc' }
    });

    return {
        critere: equipe.critere,
        tailleEquipe: collegues.length + 1,
        conflits: congesEquipe.map((c) => ({
            id: c.id,
            salarie: `${c.employee.firstName} ${c.employee.lastName}`,
            poste: c.employee.positionTitle,
            du: c.startDate,
            au: c.endDate,
            type: c.type,
            // Une demande encore en cours de validation n'est pas une absence
            // acquise : la distinguer évite d'alerter pour un congé qui sera
            // lui-même refusé.
            acquis: c.status === 'APPROVED'
        })),
        motif: null
    };
}

/**
 * Avertissement en clair, ou null s'il n'y a rien à dire.
 *
 * Le ton compte : l'application signale, elle ne juge pas. C'est au responsable
 * de savoir si l'équipe peut tourner sans ces personnes.
 */
function avertissement(resultat) {
    if (!resultat || resultat.conflits.length === 0) return null;

    const acquis = resultat.conflits.filter((c) => c.acquis);
    const enCours = resultat.conflits.filter((c) => !c.acquis);
    const par = resultat.critere === 'RESPONSABLE' ? 'la même équipe' : 'le même service';

    const morceaux = [];
    if (acquis.length > 0) {
        morceaux.push(
            `${acquis.length} personne(s) de ${par} sont déjà en congé validé sur ces dates `
            + `(${acquis.map((c) => c.salarie).join(', ')})`
        );
    }
    if (enCours.length > 0) {
        morceaux.push(
            `${enCours.length} demande(s) en cours de validation portent sur la même période `
            + `(${enCours.map((c) => c.salarie).join(', ')})`
        );
    }

    const absents = resultat.conflits.length + 1;
    const part = Math.round((absents / resultat.tailleEquipe) * 100);

    return `${morceaux.join('. ')}. Ce congé porterait à ${absents} sur ${resultat.tailleEquipe} `
        + `(${part} %) le nombre d'absents. La décision reste la vôtre.`;
}

module.exports = { chevauchent, definirEquipe, conflits, avertissement };
