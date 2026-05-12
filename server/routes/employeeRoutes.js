const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const orgChartController = require('../controllers/orgChartController');
const auditTrail = require('../middleware/auditTrail');
const requireRole = require('../middleware/roleMiddleware');

// Apply Audit Trail to all methods (it automatically filters for PUT/PATCH/DELETE)
router.use(auditTrail);

// Org Chart AI Integration
router.post('/generate-org-chart', requireRole('Administrator', 'HR'), orgChartController.generateOrgChartWithAI);
router.get('/org-chart', orgChartController.getOrgChart);

// Employee Routes
router.get('/', employeeController.getAllEmployees);
// Note: /bulk must be BEFORE /:id to prevent "bulk" being treated as an id
router.post('/bulk', requireRole('Administrator', 'HR'), employeeController.importBulkEmployees);
router.get('/profile', employeeController.getProfile);
router.post('/', requireRole('Administrator', 'HR'), employeeController.createEmployee);
router.delete('/bulk', requireRole('Administrator', 'HR'), employeeController.deleteMultipleEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', requireRole('Administrator', 'HR'), employeeController.updateEmployee);
router.delete('/:id', requireRole('Administrator', 'HR'), employeeController.deleteEmployee);

module.exports = router;
