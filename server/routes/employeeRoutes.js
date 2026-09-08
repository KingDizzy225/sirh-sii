const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const orgChartController = require('../controllers/orgChartController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const registerController = require('../controllers/registerController');

// Apply auth to all methods
router.use(verifyToken);

// Allowed HR/Admin roles (covers both naming conventions)
const HR_ROLES = ['ADMIN', 'HR', 'Administrator', 'HR_MANAGER'];

// Org Chart AI Integration
router.post('/generate-org-chart', requireRole(...HR_ROLES), orgChartController.generateOrgChartWithAI);
router.get('/org-chart', orgChartController.getOrgChart);

// Employee Routes
router.get('/', employeeController.getAllEmployees);
// Note: /bulk must be BEFORE /:id to prevent "bulk" being treated as an id
router.post('/bulk', requireRole(...HR_ROLES), employeeController.importBulkEmployees);
router.get('/profile', employeeController.getProfile);
router.post('/', requireRole(...HR_ROLES), employeeController.createEmployee);
router.delete('/bulk', requireRole(...HR_ROLES), employeeController.deleteMultipleEmployees);
// Registre unique du personnel : placé avant les routes paramétrées,
// qu'une future route /:id/... ne doit pas pouvoir capter.
router.get('/register/pdf', requireRole(...HR_ROLES), registerController.generateStaffRegister);
// Contrôle de complétude des dossiers, placé avec les routes nommées pour la
// même raison : « conformite » ne doit pas être pris pour un identifiant.
router.get('/conformite', requireRole(...HR_ROLES), employeeController.getConformite);

// Historique daté. « effectif-a » est une route nommée : placée ici pour ne pas
// être prise pour un identifiant de salarié.
router.get('/effectif-a', requireRole(...HR_ROLES), employeeController.getEffectifA);

// Corbeille. Routes nommées, elles aussi placées avant `/:id`.
router.get('/corbeille', requireRole(...HR_ROLES), employeeController.getCorbeille);
router.post('/corbeille/:id/restaurer', requireRole(...HR_ROLES), employeeController.restoreEmployee);
router.delete('/corbeille/:id', requireRole(...HR_ROLES), employeeController.purgerCorbeille);

router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', requireRole(...HR_ROLES), employeeController.updateEmployee);
router.delete('/:id', requireRole(...HR_ROLES), employeeController.deleteEmployee);
// Onboarding Routes
// Rémunération : lecture et décision. Réservée à la RH et à l'administration,
// comme la paie dont elle est la source.
router.get('/:id/historique', requireRole(...HR_ROLES), employeeController.getHistorique);
router.get('/:id/situation', requireRole(...HR_ROLES), employeeController.getSituationA);
router.get('/:id/remuneration', requireRole(...HR_ROLES), employeeController.getRemuneration);
router.post('/:id/remuneration', requireRole(...HR_ROLES), employeeController.setRemuneration);

router.get('/:id/onboarding', employeeController.getOnboardingTasks);
router.post('/:id/onboarding', requireRole(...HR_ROLES), employeeController.initOnboardingTasks);
router.put('/onboarding/:taskId', requireRole(...HR_ROLES, 'Manager'), employeeController.updateOnboardingTask);

module.exports = router;
