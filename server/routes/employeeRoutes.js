const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auditTrail = require('../middleware/auditTrail');

// Apply Audit Trail to all methods (it automatically filters for PUT/PATCH/DELETE)
router.use(auditTrail);

// Employee Routes
router.get('/', employeeController.getAllEmployees);
// Note: /bulk must be BEFORE /:id to prevent "bulk" being treated as an id
router.post('/bulk', employeeController.importBulkEmployees);
router.post('/', employeeController.createEmployee);
router.delete('/bulk', employeeController.deleteMultipleEmployees);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
