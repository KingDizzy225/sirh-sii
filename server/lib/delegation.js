const prisma = require('../prismaClient');

/**
 * Délégation de validation.
 *
 * Rien n'existait : quand le responsable qui valide est lui-même en congé, les
 * demandes s'arrêtent. C'est le reproche le plus courant fait aux SIRH en
 * exploitation — et celui qui coûte le moins cher à corriger.
 *
 * Une délégation n'élargit pas les droits de celui qui la reçoit : elle lui
 * prête ceux du titulaire, pour une portée et une période données. Un suppléant
 * ne peut donc jamais faire plus que celui qui l'a désigné, et ne le peut plus
 * une fois la période close.
 */

const PORTEES = ['CONGES', 'DEPENSES', 'TOUT'];

/** Vrai si la portée demandée est couverte par la portée déléguée. */
const couvre = (porteeDeleguee, porteeDemandee) =>
    porteeDeleguee === 'TOUT' || porteeDeleguee === porteeDemandee;

/** Délégations en vigueur reçues par un salarié. */
async function delegationsRecues(suppleantId, portee = null, date = new Date()) {
    if (!suppleantId) return [];
    const maintenant = new Date(date);

    const brutes = await prisma.delegationValidation.findMany({
        where: {
            suppleantId,
            revoqueeLe: null,
            debut: { lte: maintenant },
            fin: { gte: maintenant }
        },
        include: {
            titulaire: { select: { id: true, firstName: true, lastName: true, role: true, positionTitle: true } }
        },
        orderBy: { fin: 'asc' }
    });

    return portee ? brutes.filter((d) => couvre(d.portee, portee)) : brutes;
}

/** Délégations en vigueur données par un salarié. */
async function delegationsDonnees(titulaireId, date = new Date()) {
    const maintenant = new Date(date);
    return prisma.delegationValidation.findMany({
        where: { titulaireId, revoqueeLe: null, fin: { gte: maintenant } },
        include: {
            suppleant: { select: { id: true, firstName: true, lastName: true, positionTitle: true } }
        },
        orderBy: { debut: 'asc' }
    });
}

/**
 * Rôle effectif d'un utilisateur pour une portée donnée.
 *
 * Renvoie son propre rôle, ou celui du titulaire le plus habilité qui l'a
 * désigné. C'est une élévation empruntée, bornée dans le temps et dans son
 * objet : elle disparaît d'elle-même à la fin de la période.
 *
 * @returns {{role:string|null, empruntee:boolean, titulaire:object|null}}
 */
async function roleEffectif(user, portee = 'TOUT', date = new Date()) {
    const propre = (user && user.role) || null;
    if (!user || !user.email) return { role: propre, empruntee: false, titulaire: null };

    const moi = await prisma.employee.findUnique({
        where: { email: user.email }, select: { id: true }
    });
    if (!moi) return { role: propre, empruntee: false, titulaire: null };

    const recues = await delegationsRecues(moi.id, portee, date);
    if (recues.length === 0) return { role: propre, empruntee: false, titulaire: null };

    // Hiérarchie des rôles : on retient la délégation la plus habilitante, sans
    // jamais dépasser ce que le titulaire lui-même pouvait faire.
    const rang = { EMPLOYEE: 0, Employee: 0, MANAGER: 1, Manager: 1, HR: 2, ADMIN: 3, Administrator: 3 };
    let meilleure = null;
    for (const d of recues) {
        const r = rang[d.titulaire.role] ?? 0;
        if (!meilleure || r > (rang[meilleure.titulaire.role] ?? 0)) meilleure = d;
    }

    const rangPropre = rang[propre] ?? 0;
    const rangDelegue = rang[meilleure.titulaire.role] ?? 0;
    if (rangDelegue <= rangPropre) {
        // La délégation n'apporte rien : inutile de la présenter comme telle.
        return { role: propre, empruntee: false, titulaire: null };
    }

    return {
        role: meilleure.titulaire.role,
        empruntee: true,
        titulaire: {
            id: meilleure.titulaire.id,
            nom: `${meilleure.titulaire.lastName} ${meilleure.titulaire.firstName}`.trim(),
            fin: meilleure.fin
        }
    };
}

/** Contrôles de cohérence d'une délégation. */
function valider({ titulaireId, suppleantId, portee, debut, fin }) {
    if (!titulaireId || !suppleantId) return 'Titulaire et suppléant sont requis.';
    if (titulaireId === suppleantId) {
        return 'Un salarié ne peut pas se déléguer ses propres validations.';
    }
    if (portee && !PORTEES.includes(portee)) {
        return `Portée inconnue : ${portee}.`;
    }
    const d = new Date(debut);
    const f = new Date(fin);
    if (isNaN(d.getTime()) || isNaN(f.getTime())) return 'Dates invalides.';
    if (f < d) return 'La fin précède le début.';
    // Une délégation sans terme ne se referme jamais et finit par être oubliée.
    const jours = (f - d) / 86400000;
    if (jours > 366) return 'Une délégation ne peut excéder un an.';
    return null;
}

module.exports = { PORTEES, couvre, delegationsRecues, delegationsDonnees, roleEffectif, valider };
