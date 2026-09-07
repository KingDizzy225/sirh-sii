const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');

// Doit rester cohérent avec employeeController : c'est la durée annoncée à la
// RH dans l'écran de la corbeille.
const RETENTION_JOURS = parseInt(process.env.DELETED_EMPLOYEE_RETENTION_DAYS, 10) || 30;

/**
 * Purge des dossiers supprimés au-delà du délai de restauration.
 *
 * La corbeille conserve le dossier complet d'un salarié — paies, dossier
 * médical, accidents du travail. C'est ce qui rend la restauration possible, et
 * c'est aussi ce qui interdit de le garder indéfiniment : passé le délai
 * pendant lequel une suppression accidentelle peut encore être rattrapée, la
 * conservation n'a plus d'objet.
 */
async function purgerCorbeille(referenceDate = new Date()) {
    return runOnce('DELETED_EMPLOYEE_PURGE', dayPeriod(referenceDate), async () => {
        const limite = new Date(referenceDate.getTime() - RETENTION_JOURS * 86400000);

        const { count } = await prisma.deletedEmployee.deleteMany({
            where: { deletedAt: { lt: limite } }
        });

        return count > 0
            ? `${count} dossier(s) supprimé(s) définitivement (au-delà de ${RETENTION_JOURS} jours)`
            : 'aucun dossier à purger';
    });
}

module.exports = { purgerCorbeille, RETENTION_JOURS };
