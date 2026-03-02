// server/middleware/auditTrail.js

/**
 * Audit Trail Middleware
 * Intercepte les requêtes PUT, PATCH, DELETE sur les tables sensibles 
 * (Payroll, Employees, Settings) et enregistre les modifications dans 'Audit_Logs'.
 */

// Import the real Prisma client
const prisma = require('../prismaClient');

// We no longer need the mock db object

/**
 * Fonction asynchrone pour intercepter et journaliser les changements.
 * @param {Object} req - Objet de la requête Express
 * @param {Object} res - Objet de la réponse Express
 * @param {Function} next - Fonction next() d'Express
 */
const auditTrailMiddleware = async (req, res, next) => {
    // Ne suivre que les méthodes de modification
    if (!['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Extraire la table/ressource à partir de l'URL (ex: /api/employees/123 -> 'employees')
    const urlParts = req.originalUrl.split('/').filter(Boolean);

    // Simplification: supposons que la structure de l'URL est /api/{resource}/{id}
    const resourceIndex = urlParts.indexOf('api') + 1;
    if (resourceIndex === 0 || resourceIndex >= urlParts.length) {
        return next();
    }

    const resource = urlParts[resourceIndex].toLowerCase();
    const sensitiveResources = ['payroll', 'employees', 'settings'];

    if (!sensitiveResources.includes(resource)) {
        return next();
    }

    // Récupérer l'ID de la ressource ciblée
    const targetId = urlParts[resourceIndex + 1];

    // L'ID de l'utilisateur est généralement attaché à req.user par le middleware d'authentification (ex: JWT)
    const userId = req.user?.id || 'SYSTEM';

    // Capturer la nouvelle donnée (payload de la requête)
    const newData = req.method !== 'DELETE' ? req.body : null;

    // Pour comparer, il faut récupérer l'ancienne donnée AVANT l'exécution de la requête.
    // Dans une vraie API, on interroge la base de données pour "targetId" sur "resource"
    let oldData = null;
    try {
        // MOCK: Remplacer par `await db[resource].findById(targetId)`
        oldData = { id: targetId, _info: "Donnée récupérée avant modification" };
    } catch (error) {
        console.error("Erreur lors de la récupération de l'ancienne donnée:", error);
    }

    // Intercepter la réponse pour s'assurer que l'opération a réussi avant de loguer
    const originalSend = res.send;
    res.send = function (data) {
        // Vérifier si le statut HTTP indique un succès (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {

            // Enregistrer asynchrone après le succès
            const auditPayload = {
                data: {
                    user_id: userId,
                    action: req.method, // PUT, PATCH, DELETE
                    table_name: resource,
                    record_id: targetId,
                    old_data: oldData ? JSON.stringify(oldData) : null,
                    new_data: newData ? JSON.stringify(newData) : null,
                    ip_address: req.ip,
                    created_at: new Date().toISOString()
                }
            };

            // Ne pas bloquer la réponse client, exécuter en tâche de fond
            prisma.auditLog.create(auditPayload).then(() => {
                console.log(`[AUDIT TRAIL] Trace enregistrée pour ${resource}/${targetId}`);
            }).catch(err => {
                console.error("[AUDIT ERROR] Échec de l'enregistrement de l'audit:", err);
            });
        }

        // Appeler la fonction originale
        return originalSend.apply(res, arguments);
    };

    next();
};

module.exports = auditTrailMiddleware;
