/**
 * Règles d'accès aux données rattachées à un employé.
 *
 * Une donnée personnelle (documents, dossier médical, fiche de paie…) n'est
 * lisible que par la RH/l'administration ou par l'employé concerné lui-même.
 */

const prisma = require('../prismaClient');
const { hasRole } = require('../middleware/roleMiddleware');

/** Fiche employé rattachée au compte connecté (via l'email du jeton). */
const getRequesterEmployee = async (user) => {
    if (!user || !user.email) return null;
    return prisma.employee.findUnique({ where: { email: user.email } });
};

/**
 * Vrai si l'utilisateur peut consulter les données de l'employé visé :
 * profil RH/administrateur, ou son propre dossier.
 */
const canAccessEmployeeData = async (user, employeeId) => {
    if (hasRole(user, ['ADMIN', 'HR'])) return true;
    if (!employeeId) return false;
    const employee = await getRequesterEmployee(user);
    return Boolean(employee && employee.id === employeeId);
};

module.exports = { getRequesterEmployee, canAccessEmployeeData };
