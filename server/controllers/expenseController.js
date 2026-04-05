const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const receiptDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, receiptDir),
    filename: (req, file, cb) => cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`)
});
exports.upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
}});


// Get expenses (all for admin/manager, personal for employee)
exports.getExpenses = async (req, res) => {
    try {
        const { role, email } = req.user; // from JWT token

        // Find the matching Employee record
        const employee = await prisma.employee.findUnique({ where: { email } });
        
        let expenses = [];
        if (role === 'ADMIN' || role === 'MANAGER' || role === 'HR') {
            expenses = await prisma.expense.findMany({
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
        } else {
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });
            expenses = await prisma.expense.findMany({
                where: { employeeId: employee.id },
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
        }

        // Format for frontend
        const formattedExpenses = expenses.map(exp => ({
            id: exp.id,
            employee: `${exp.employee.firstName} ${exp.employee.lastName}`,
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            merchant: exp.merchant || '-',
            date: new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: exp.status,
            rejectionReason: exp.rejectionReason
        }));

        res.json(formattedExpenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Create a new expense
exports.createExpense = async (req, res) => {
    try {
        const { amount, currency, category, merchant, date } = req.body;
        const { email } = req.user;

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        const newExpense = await prisma.expense.create({
            data: {
                employeeId: employee.id,
                amount: parseFloat(amount),
                currency: currency || 'FCFA',
                category,
                merchant,
                date: date ? new Date(date) : new Date(),
                status: 'En attente',
                receiptPath: req.file ? `/uploads/receipts/${req.file.filename}` : null
            }
        });

        res.status(201).json(newExpense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Update status (Approve/Reject)
exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: { status, rejectionReason }
        });

        res.json(updatedExpense);
    } catch (error) {
        console.error("Error updating expense status:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
