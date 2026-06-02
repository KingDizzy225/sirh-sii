const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { triggerWebhook } = require('./webhookController');

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                onboardingTasks: true
            },
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

        // Automatisation : Création des tâches d'Onboarding Zéro-Papier
        await prisma.onboardingTask.createMany({
            data: [
                {
                    employeeId: newEmployee.id,
                    taskName: "Création des accès informatiques et adresse email",
                    assignedTo: "IT Support",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
                },
                {
                    employeeId: newEmployee.id,
                    taskName: "Signature électronique du contrat de travail",
                    assignedTo: "Ressources Humaines",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
                },
                {
                    employeeId: newEmployee.id,
                    taskName: "Planification du point d'intégration (1ère semaine)",
                    assignedTo: "Manager Direct",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
                }
            ]
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
        res.status(500).json({ error: 'Failed to update employee', details: error.message });
    }
};

// Helper: supprime toutes les données liées à un employé, puis l'employé lui-même
const deleteEmployeeWithRelations = async (id) => {
    // Supprimer dans l'ordre pour respecter les contraintes de clé étrangère
    await prisma.kudo.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
    await prisma.payroll.deleteMany({ where: { employeeId: id } });
    await prisma.leave.deleteMany({ where: { employeeId: id } });
    await prisma.absence.deleteMany({ where: { employeeId: id } });
    await prisma.expense.deleteMany({ where: { employeeId: id } });
    await prisma.salaryAdvance.deleteMany({ where: { employeeId: id } });
    await prisma.notification.deleteMany({ where: { employeeId: id } });
    await prisma.employeeDocument.deleteMany({ where: { employeeId: id } });
    await prisma.employeeSkill.deleteMany({ where: { employeeId: id } });
    await prisma.assetAssignment.deleteMany({ where: { employeeId: id } });
    await prisma.trainingParticipation.deleteMany({ where: { employeeId: id } });
    await prisma.performanceGoal.deleteMany({ where: { employeeId: id } });
    await prisma.performanceReview.deleteMany({ where: { employeeId: id } });
    await prisma.performanceFeedback.deleteMany({ where: { employeeId: id } });
    await prisma.medicalVisit.deleteMany({ where: { employeeId: id } });
    await prisma.pointEvent.deleteMany({ where: { employeeId: id } });
    await prisma.employeePoints.deleteMany({ where: { employeeId: id } });
    await prisma.talentProfile.deleteMany({ where: { employeeId: id } });
    await prisma.offboardingTask.deleteMany({ where: { employeeId: id } });
    await prisma.onboardingTask.deleteMany({ where: { employeeId: id } });
    await prisma.shiftSchedule.deleteMany({ where: { employeeId: id } });
    await prisma.employeeBenefit.deleteMany({ where: { employeeId: id } });
    await prisma.timeLog.deleteMany({ where: { employeeId: id } });
    await prisma.careerHistory.deleteMany({ where: { employeeId: id } });
    await prisma.disciplinaryRecord.deleteMany({ where: { employeeId: id } });
    await prisma.orgSimulationNode.deleteMany({ where: { employeeId: id } });
    await prisma.successor.deleteMany({ where: { employeeId: id } });
    await prisma.retentionAction.deleteMany({ where: { employeeId: id } });
    await prisma.supportTicket.deleteMany({ where: { requesterId: id } });
    // Désassocier les subordonnés avant suppression
    await prisma.employee.updateMany({ where: { managerId: id }, data: { managerId: null } });
    // Supprimer l'employé lui-même
    await prisma.employee.delete({ where: { id } });
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteEmployeeWithRelations(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee', details: error.message });
    }
};

// Delete multiple employees (Bulk)
exports.deleteMultipleEmployees = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Array of employee IDs is required' });
        }

        for (const id of ids) {
            await deleteEmployeeWithRelations(id);
        }

        res.status(200).json({ message: `Successfully deleted ${ids.length} employees`, count: ids.length });
    } catch (error) {
        console.error('Error deleting multiple employees:', error);
        res.status(500).json({ error: 'Failed to delete multiple employees', details: error.message });
    }
};

// Import multiple employees (CSV bulk)
exports.importBulkEmployees = async (req, res) => {
    try {
        const { employees } = req.body;

        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({ error: 'Un tableau d\'employés est requis' });
        }

        // Format data properly for Prisma with robust header mapping
        const dataToInsert = employees
            .map(emp => {
                if (!emp || typeof emp !== 'object') return null;

                const getVal = (keys) => {
                    for (const key of keys) {
                        if (emp[key] !== undefined && emp[key] !== null) return emp[key].toString().trim();
                        const lowerKey = key.toLowerCase();
                        const foundKey = Object.keys(emp).find(k => k.toLowerCase() === lowerKey);
                        if (foundKey && emp[foundKey] !== undefined && emp[foundKey] !== null) {
                            return emp[foundKey].toString().trim();
                        }
                    }
                    return null;
                };

                let firstName = getVal(['firstName', 'prenom', 'Prénom', 'Prenom']);
                let lastName = getVal(['lastName', 'nom', 'Nom', 'nom de famille']);
                
                // If we have a fullName, or if lastName contains a space (meaning it is a full name) and firstName is missing
                const fullName = getVal(['Nom', 'name', 'nom complet']) || lastName;
                
                if (fullName && (!firstName || firstName === lastName)) {
                    const parts = fullName.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        firstName = parts[0];
                        lastName = parts.slice(1).join(' ');
                    } else if (parts.length === 1) {
                        firstName = parts[0];
                        lastName = lastName && lastName !== fullName ? lastName : 'Collaborateur';
                    }
                }

                // Skip if both firstName and lastName are missing
                if (!firstName && !lastName) return null;

                const email = getVal(['email', 'Email']);
                
                let role = getVal(['role', 'Rôle', 'role', 'systemRole']);
                if (role) {
                    const rLower = role.toLowerCase();
                    if (rLower.includes('admin') || rLower.includes('dir')) {
                        role = 'Administrator';
                    } else if (rLower.includes('hr') || rLower.includes('rh') || rLower.includes('ressources')) {
                        role = 'HR';
                    } else if (rLower.includes('manag') || rLower.includes('chef') || rLower.includes('resp')) {
                        role = 'Manager';
                    } else {
                        role = 'Employee';
                    }
                } else {
                    role = 'Employee';
                }

                const department = getVal(['department', 'département', 'Département', 'departement']) || 'Ressources Humaines';
                const positionTitle = getVal(['positionTitle', 'poste', 'Poste', 'position']) || 'Poste Non Assigné';
                
                let status = getVal(['status', 'statut', 'Statut']);
                if (status) {
                    const sLower = status.toLowerCase();
                    if (sLower.includes('inact') || sLower.includes('suspend')) {
                        status = 'INACTIVE';
                    } else {
                        status = 'ACTIVE';
                    }
                } else {
                    status = 'ACTIVE';
                }

                const hireDateVal = getVal(['hireDate', 'date d\'embauche', 'date_embauche', 'embauche']);
                let hireDate = new Date();
                if (hireDateVal) {
                    const parsedDate = new Date(hireDateVal);
                    if (!isNaN(parsedDate.getTime())) {
                        hireDate = parsedDate;
                    }
                }

                // Standardize email creation by cleaning up special characters and accents
                const safeFirst = (firstName || 'info').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9.-]/g, "");
                const safeLast = (lastName || 'collab').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9.-]/g, "");
                const defaultEmail = `${safeFirst}.${safeLast}@entreprise.com`;

                return {
                    firstName: firstName || 'Collaborateur',
                    lastName: lastName || 'Sans Nom',
                    email: email || defaultEmail,
                    role,
                    department,
                    positionTitle,
                    status,
                    hireDate
                };
            })
            .filter(Boolean); // Filter out null/invalid mapping results

        if (dataToInsert.length === 0) {
            return res.status(400).json({ error: 'Aucun employé valide trouvé. Assurez-vous d\'avoir les en-têtes requis (ex: Nom, Prénom ou firstName, lastName).' });
        }

        // Prisma SQLite doesn't support createMany skipDuplicates — use upsert loop
        let created = 0;
        let skipped = 0;
        const defaultPassword = 'Welcome2026!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const emp of dataToInsert) {
            try {
                const existing = await prisma.employee.findUnique({ where: { email: emp.email } });
                if (existing) { skipped++; continue; }

                const newEmp = await prisma.employee.create({ data: emp });

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

                // Automatisation : Création des tâches d'Onboarding Zéro-Papier pour chaque nouvel employé importé
                await prisma.onboardingTask.createMany({
                    data: [
                        {
                            employeeId: newEmp.id,
                            taskName: "Création des accès informatiques et adresse email",
                            assignedTo: "IT Support",
                            dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
                        },
                        {
                            employeeId: newEmp.id,
                            taskName: "Signature électronique du contrat de travail",
                            assignedTo: "Ressources Humaines",
                            dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
                        },
                        {
                            employeeId: newEmp.id,
                            taskName: "Planification du point d'intégration (1ère semaine)",
                            assignedTo: "Manager Direct",
                            dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
                        }
                    ]
                });

                created++;
            } catch (err) {
                console.error(`Skipping ${emp.email}:`, err.message);
                skipped++;
            }
        }

        res.status(201).json({
            message: `${created} employé(s) importé(s) avec succès${skipped > 0 ? `, ${skipped} ignoré(s) (doublons ou erreurs)` : ''}.`,
            count: created
        });

    } catch (error) {
        console.error('Error importing employees:', error);
        res.status(500).json({ error: 'Failed to import employees' });
    }
}

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

// Get Onboarding Tasks for an Employee
exports.getOnboardingTasks = async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await prisma.onboardingTask.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching onboarding tasks:', error);
        res.status(500).json({ error: 'Failed to fetch onboarding tasks' });
    }
};

// Update Onboarding Task Status
exports.updateOnboardingTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        const updatedTask = await prisma.onboardingTask.update({
            where: { id: taskId },
            data: { status }
        });
        
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating onboarding task:', error);
        res.status(500).json({ error: 'Failed to update onboarding task' });
    }
};

// Initialize Onboarding Tasks for an existing employee
exports.initOnboardingTasks = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        // Check if employee already has onboarding tasks
        const existingTasks = await prisma.onboardingTask.findMany({
            where: { employeeId: id }
        });

        if (existingTasks.length > 0) {
            return res.status(400).json({ error: 'Ce collaborateur a déjà un plan d\'intégration actif.' });
        }

        // Create standard tasks
        await prisma.onboardingTask.createMany({
            data: [
                {
                    employeeId: id,
                    taskName: "Création des accès informatiques et adresse email",
                    assignedTo: "IT Support",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
                },
                {
                    employeeId: id,
                    taskName: "Signature électronique du contrat de travail",
                    assignedTo: "Ressources Humaines",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
                },
                {
                    employeeId: id,
                    taskName: "Planification du point d'intégration (1ère semaine)",
                    assignedTo: "Manager Direct",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
                }
            ]
        });

        // Retrieve created tasks
        const createdTasks = await prisma.onboardingTask.findMany({
            where: { employeeId: id },
            orderBy: { createdAt: 'asc' }
        });

        res.status(201).json({
            message: "Plan d'intégration initialisé avec succès.",
            tasks: createdTasks
        });
    } catch (error) {
        console.error('Error initializing onboarding tasks:', error);
        res.status(500).json({ error: 'Failed to initialize onboarding tasks' });
    }
};
