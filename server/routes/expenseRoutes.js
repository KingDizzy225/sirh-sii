const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, expenseController.getExpenses);
router.post('/', verifyToken, expenseController.upload.single('receipt'), expenseController.createExpense);
router.post('/ocr', verifyToken, expenseController.upload.single('receipt'), expenseController.scanReceipt);
router.put('/:id/status', verifyToken, expenseController.updateExpenseStatus);

module.exports = router;
