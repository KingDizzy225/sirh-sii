const express = require('express');
const router = express.Router();
const c = require('../controllers/gpecController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/map', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.getCompetencyMap);
router.get('/gaps', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.getSkillGaps);
router.get('/skill-definitions', verifyToken, c.getSkillDefinitions);
router.post('/skill-definitions', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.createSkillDefinition);
router.delete('/skill-definitions/:id', verifyToken, requireRole('HR', 'ADMIN', 'Administrator'), c.deleteSkillDefinition);

router.post('/employee-skills', verifyToken, requireRole('HR', 'ADMIN', 'Administrator', 'Manager'), c.assignSkillToEmployee);

module.exports = router;
