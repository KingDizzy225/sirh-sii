const prisma = require('../prismaClient');

/**
 * Middleware d'Audit (Piste d'audit / Audit Trail)
 * Intercepte les méthodes modifiant l'état pour les archiver dans AuditLog.
 */
const auditLog = (req, res, next) => {
    // On ne loggue que les requêtes de modification
    const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isAuthRoute = req.originalUrl.includes('/api/auth');
    const isDocUpload = req.originalUrl.includes('/upload') || req.originalUrl.includes('/generate');

    if (!isModifying || isAuthRoute || isDocUpload) {
        return next();
    }

    // Intercepter la fin de la réponse pour s'assurer que req.user a été injecté par verifyToken
    res.on('finish', () => {
        // Ne logguer que si la requête a réussi (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const userId = req.user?.id || 'SYSTEM';
                const email = req.user?.email || 'unknown';
                
                let tableName = 'Multiple / API';
                if (req.originalUrl.includes('/api/employees')) tableName = 'Employee';
                else if (req.originalUrl.includes('/api/attendance')) tableName = 'Attendance';
                else if (req.originalUrl.includes('/api/leaves')) tableName = 'Leave';
                else if (req.originalUrl.includes('/api/performance')) tableName = 'Performance';
                else if (req.originalUrl.includes('/api/payroll')) tableName = 'Payroll';
                else if (req.originalUrl.includes('/api/recruitment')) tableName = 'Recruitment';
                else tableName = req.originalUrl.split('/')[2] || 'Autre';

                // Récupération manuelle de l'ID depuis l'URL car req.params est vide au niveau global
                const urlParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
                const lastPart = urlParts[urlParts.length - 1];
                let recordId = req.body?.employeeId || req.body?.id || 'N/A';
                
                // Si la dernière partie n'est pas le nom du module (ex: pas 'employees'), c'est probablement un ID
                if (!['employees', 'leaves', 'payroll', 'performance', 'recruitment', 'bulk'].includes(lastPart)) {
                    recordId = lastPart;
                }
                
                const newData = req.body ? { ...req.body } : {};
                if (newData.password) delete newData.password;

                prisma.auditLog.create({
                    data: {
                        userId: userId,
                        action: req.method,
                        tableName: tableName,
                        recordId: recordId,
                        newData: JSON.stringify(newData),
                        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                    }
                }).catch(err => console.error("Erreur AuditLog (non bloquante):", err));
            } catch (e) {
                console.error("Erreur critique AuditLog post-finish:", e);
            }
        }
    });

    next();
};

module.exports = auditLog;
