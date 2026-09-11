const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/policy', verifyToken, expenseController.getExpensePolicy);
// Export comptable des frais validés — réservé RH/administration
router.get('/export/accounting', verifyToken, requireRole(['ADMIN', 'HR']), expenseController.exportAccounting);
router.get('/', verifyToken, expenseController.getExpenses);
router.post('/', verifyToken, expenseController.upload.single('receipt'), expenseController.createExpense);
router.post('/ocr', verifyToken, expenseController.upload.single('receipt'), expenseController.scanReceipt);
// Valider une note engage un remboursement. La route n'exigeait qu'une session :
// tout compte connecté — un responsable, le demandeur lui-même — pouvait valider.
router.put('/:id/status', verifyToken, requireRole(['ADMIN', 'HR']), expenseController.updateExpenseStatus);

module.exports = router;
