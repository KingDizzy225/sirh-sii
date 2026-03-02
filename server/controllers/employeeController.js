const prisma = require('../prismaClient');

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, role, department, positionTitle, hireDate, status } = req.body;

        const newEmployee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                role: role || 'Employee',
                department,
                positionTitle,
                hireDate: hireDate ? new Date(hireDate) : new Date(),
                status: status || 'ACTIVE',
            }
        });

        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee' });
    }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data
        });

        res.status(200).json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.employee.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
};

// Delete multiple employees (Bulk)
exports.deleteMultipleEmployees = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Array of employee IDs is required' });
        }

        const deleteResult = await prisma.employee.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        res.status(200).json({ message: `Successfully deleted ${deleteResult.count} employees`, count: deleteResult.count });
    } catch (error) {
        console.error('Error deleting multiple employees:', error);
        res.status(500).json({ error: 'Failed to delete multiple employees' });
    }
};

// Import multiple employees (CSV bulk)
exports.importBulkEmployees = async (req, res) => {
    try {
        const { employees } = req.body;

        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({ error: 'Array of employees is required' });
        }

        // Format data properly for Prisma
        const dataToInsert = employees.map(emp => ({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email || `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@entreprise.com`,
            role: emp.role || 'Employee',
            department: emp.department || 'Ressources Humaines',
            positionTitle: emp.positionTitle || 'Poste Non Assigné',
            status: emp.status || 'ACTIVE',
            hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date()
        }));

        // Prisma createMany (skipDuplicates true allows ignoring existing emails instead of failing the whole batch)
        const createResult = await prisma.employee.createMany({
            data: dataToInsert,
            skipDuplicates: true
        });

        res.status(201).json({
            message: `Successfully imported ${createResult.count} out of ${employees.length} employees (duplicates skipped)`,
            count: createResult.count
        });

    } catch (error) {
        console.error('Error importing employees:', error);
        res.status(500).json({ error: 'Failed to import employees' });
    }
};
