const prisma = require('../prismaClient');

// Get all payroll records
exports.getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({
            include: { employee: true },
            orderBy: { periodStart: 'desc' }
        });
        res.status(200).json(payrolls);
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        res.status(500).json({ error: 'Failed to fetch payroll records' });
    }
};

// Create a new payroll record
exports.createPayroll = async (req, res) => {
    try {
        const { employeeId, periodStart, periodEnd, baseSalary, bonuses, deductions } = req.body;

        const netSalary = (baseSalary || 0) + (bonuses || 0) - (deductions || 0);

        const newPayroll = await prisma.payroll.create({
            data: {
                employeeId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                baseSalary,
                bonuses: bonuses || 0,
                deductions: deductions || 0,
                netSalary,
                status: 'DRAFT',
                paymentMethod: 'Virement',
                paymentDate: new Date() // Temporary placeholder
            },
            include: { employee: true }
        });

        res.status(201).json(newPayroll);
    } catch (error) {
        console.error('Error creating payroll:', error);
        res.status(500).json({ error: 'Failed to create payroll record' });
    }
};

// Update payroll status (ex: Approve -> PAID)
exports.updatePayrollStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PAID', 'APPROVED'

        const updatedPayroll = await prisma.payroll.update({
            where: { id },
            data: { status, paymentDate: status === 'PAID' ? new Date() : undefined },
            include: { employee: true }
        });

        res.status(200).json(updatedPayroll);
    } catch (error) {
        console.error('Error updating payroll status:', error);
        res.status(500).json({ error: 'Failed to update payroll status' });
    }
};
