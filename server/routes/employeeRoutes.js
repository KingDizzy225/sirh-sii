const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const orgChartController = require('../controllers/orgChartController');
const auditTrail = require('../middleware/auditTrail');

// Apply Audit Trail to all methods (it automatically filters for PUT/PATCH/DELETE)
router.use(auditTrail);

// Org Chart AI Integration
router.post('/generate-org-chart', orgChartController.generateOrgChartWithAI);
router.get('/org-chart', orgChartController.getOrgChart);

// Employee Routes
router.get('/', employeeController.getAllEmployees);
// Note: /bulk must be BEFORE /:id to prevent "bulk" being treated as an id
router.post('/bulk', employeeController.importBulkEmployees);
router.get('/profile', employeeController.getProfile);
router.post('/', employeeController.createEmployee);
router.delete('/bulk', employeeController.deleteMultipleEmployees);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
