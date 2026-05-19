const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { triggerWebhook } = require('./webhookController');

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

// Get profile for the currently logged-in user
exports.getProfile = async (req, res) => {
    try {
        const { email } = req.user; // Get email from verified JWT
        
        const employee = await prisma.employee.findUnique({
            where: { email },
            include: {
                manager: true, // Fetch manager details if applicable
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Profil employé introuvable pour cet utilisateur' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Create a new employee and auto-provision their User account for Self-Service
exports.createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, role, department, positionTitle, hireDate, status, birthDate, gender, phone, address, nationality } = req.body;

        // Execute sequentially to ensure both are created
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
                birthDate: birthDate ? new Date(birthDate) : null,
                gender: gender || 'Non spécifié',
                phone,
                address,
                nationality
            }
        });

        // Automatically create User for Self-Service Portal access
        const defaultPassword = 'Welcome2026!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                email,
                password: hashedPassword,
                role: role === 'Administrator' ? 'ADMIN' : (role === 'HR' ? 'HR' : (role === 'Manager' ? 'MANAGER' : 'EMPLOYEE'))
            }
        });

        // Trigger Webhook
        triggerWebhook('EMPLOYEE_CREATED', newEmployee);

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
        const data = { ...req.body };
        
        if (data.birthDate) {
            data.birthDate = new Date(data.birthDate);
        } else if (data.birthDate === '') {
            data.birthDate = null;
        }

        if (data.hireDate) {
            data.hireDate = new Date(data.hireDate);
        } else if (data.hireDate === '') {
            data.hireDate = null;
        }

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

        // Prisma SQLite doesn't support createMany skipDuplicates — use upsert loop
        let created = 0;
        let skipped = 0;
        const defaultPassword = 'Welcome2026!';
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const emp of dataToInsert) {
            try {
                const existing = await prisma.employee.findUnique({ where: { email: emp.email } });
                if (existing) { skipped++; continue; }

                await prisma.employee.create({ data: emp });

                // Auto-create User account
                const userExists = await prisma.user.findUnique({ where: { email: emp.email } });
                if (!userExists) {
                    await prisma.user.create({
                        data: {
                            name: `${emp.firstName} ${emp.lastName}`,
                            email: emp.email,
                            password: hashedPassword,
                            role: emp.role === 'Administrator' ? 'ADMIN' : (emp.role === 'HR' ? 'HR' : (emp.role === 'Manager' ? 'MANAGER' : 'EMPLOYEE'))
                        }
                    });
                }
                created++;
            } catch (err) {
                console.error(`Skipping ${emp.email}:`, err.message);
                skipped++;
            }
        }

        res.status(201).json({
            message: `${created} employé(s) importé(s) avec succès${skipped > 0 ? `, ${skipped} ignoré(s) (doublons)` : ''}.`,
            count: created
        });

    } catch (error) {
        console.error('Error importing employees:', error);
        res.status(500).json({ error: 'Failed to import employees' });
    }
};

// Get Employee By ID with full relations
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                manager: { select: { firstName: true, lastName: true, positionTitle: true } },
                skills: true,
                talentProfile: true,
                assets: {
                    include: { asset: true }
                },
                leaves: {
                    orderBy: { startDate: 'desc' },
                    take: 5
                }
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee profile by ID:', error);
        res.status(500).json({ error: 'Failed to fetch employee profile' });
    }
};
