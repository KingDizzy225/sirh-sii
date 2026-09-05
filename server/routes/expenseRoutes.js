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
router.put('/:id/status', verifyToken, expenseController.updateExpenseStatus);

module.exports = router;
