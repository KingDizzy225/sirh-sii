const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const orgChartController = require('../controllers/orgChartController');
const requireRole = require('../middleware/roleMiddleware');
const verifyToken = require('../middleware/authMiddleware');

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
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', requireRole(...HR_ROLES), employeeController.updateEmployee);
router.delete('/:id', requireRole(...HR_ROLES), employeeController.deleteEmployee);
// Onboarding Routes
router.get('/:id/onboarding', employeeController.getOnboardingTasks);
router.put('/onboarding/:taskId', requireRole(...HR_ROLES, 'Manager'), employeeController.updateOnboardingTask);

module.exports = router;
