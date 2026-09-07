const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { triggerWebhook } = require('./webhookController');
const { construireTachesIntegration } = require('../data/onboardingTemplates');
const { soldeOuverture } = require('../lib/conges');
const dossier = require('../lib/dossier');
const corbeille = require('../lib/corbeille');

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
        const {
            firstName, lastName, email, role, department, positionTitle, hireDate,
            status, birthDate, gender, phone, address, nationality,
            matricule, cnpsNumber, bankName, bankAccount, childrenCount,
            // Solde reconnu par le système précédent, s'il y en a un.
            soldeRepris, annualLeaveBalance
        } = req.body;

        const dateEmbauche = hireDate ? new Date(hireDate) : new Date();

        // Le solde de congés n'est plus le forfait de 30 jours du schéma, qui
        // créditait une année entière à un salarié arrivé la veille. Il est
        // repris s'il est fourni, calculé sinon.
        const ouverture = soldeOuverture({
            hireDate: dateEmbauche,
            gender,
            childrenCount,
            soldeRepris: soldeRepris ?? annualLeaveBalance ?? null
        });

        // Execute sequentially to ensure both are created
        const newEmployee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
                email,
                role: role || 'Employee',
                department,
                positionTitle,
                hireDate: dateEmbauche,
                status: status || 'ACTIVE',
                birthDate: birthDate ? new Date(birthDate) : null,
                gender: gender || 'Non spécifié',
                phone,
                address,
                nationality,
                matricule: matricule || null,
                cnpsNumber: cnpsNumber || null,
                bankName: bankName || null,
                bankAccount: bankAccount || null,
                childrenCount: Number(childrenCount) || 0,
                annualLeaveBalance: ouverture.solde,
                leaveBalanceSource: ouverture.source,
                leaveBalanceSetAt: new Date()
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
            data: await construireTachesIntegration(newEmployee, prisma)
        });

        // Trigger Webhook
        triggerWebhook('EMPLOYEE_CREATED', newEmployee);

        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        if (error.code === 'P2002') {
            // Deux contraintes d'unicité désormais : dire laquelle, sans quoi
            // un matricule en double s'affiche comme un email en double.
            const champs = (error.meta && error.meta.target) || [];
            const surMatricule = String(champs).includes('matricule');
            return res.status(400).json({
                error: surMatricule
                    ? 'Ce matricule est déjà attribué à un autre salarié.'
                    : 'Cette adresse email est déjà utilisée.'
            });
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

        if (data.childrenCount !== undefined) {
            data.childrenCount = Number(data.childrenCount) || 0;
        }
        // Le matricule porte une contrainte d'unicité : une chaîne vide est une
        // valeur comme une autre pour Postgres, et le deuxième salarié « sans
        // matricule » serait rejeté. L'absence se dit avec null.
        for (const champ of ['matricule', 'cnpsNumber', 'bankName', 'bankAccount']) {
            if (data[champ] !== undefined && String(data[champ]).trim() === '') {
                data[champ] = null;
            }
        }
        // Un solde saisi à la main fait foi : c'est une décision de la RH, pas
        // un calcul. On l'enregistre comme tel, et la reprise automatique
        // (repair-leave-balances) s'interdira d'y revenir.
        if (data.annualLeaveBalance !== undefined && data.annualLeaveBalance !== '') {
            data.annualLeaveBalance = Number(data.annualLeaveBalance) || 0;
            data.leaveBalanceSource = 'REPRISE';
            data.leaveBalanceSetAt = new Date();
        } else {
            delete data.annualLeaveBalance;
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
const deleteEmployeeWithRelations = async (id, auteur = null) => {
    // Copie du dossier avant toute suppression. Elle est prise en premier :
    // une fois la cascade partie, il n'y a plus rien à copier.
    const instantane = await corbeille.capturer(prisma, id);
    if (instantane) {
        const e = instantane.employee;
        await prisma.deletedEmployee.create({
            data: {
                employeeId: e.id,
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                department: e.department,
                positionTitle: e.positionTitle,
                snapshot: instantane,
                relatedCount: instantane.lignes,
                deletedBy: auteur
            }
        });
    }

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
        await deleteEmployeeWithRelations(id, req.user && req.user.email);
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
            await deleteEmployeeWithRelations(id, req.user && req.user.email);
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

                // Dossier administratif. Ces colonnes sont facultatives dans le
                // fichier : absentes, le dossier reste incomplet et le rapport
                // de conformité le signalera, plutôt que d'inventer une valeur.
                const matricule = getVal(['matricule', 'Matricule', 'matricule interne']);
                const cnpsNumber = getVal(['cnpsNumber', 'cnps', 'CNPS', 'numero cnps', 'numéro cnps', 'n° cnps']);
                const bankName = getVal(['bankName', 'banque', 'Banque']);
                const bankAccount = getVal(['bankAccount', 'rib', 'RIB', 'compte', 'numero de compte', 'numéro de compte', 'iban']);
                const childrenCount = parseInt(getVal(['childrenCount', 'enfants', 'Enfants', 'enfants a charge', 'enfants à charge']), 10);

                // Reprise des compteurs de congés. `soldeRepris` fait foi quand
                // il est fourni : c'est le solde que le système précédent ou le
                // registre papier reconnaissait au salarié, et il l'engage.
                const soldeReprisVal = getVal(['soldeRepris', 'solde conges', 'solde congés', 'solde', 'leaveBalance', 'annualLeaveBalance']);
                const joursPrisVal = getVal(['joursPris', 'conges pris', 'congés pris', 'jours pris']);
                const nombre = (v) => {
                    if (v === null || v === undefined || v === '') return null;
                    const n = parseFloat(String(v).replace(',', '.'));
                    return Number.isFinite(n) ? n : null;
                };

                const ouverture = soldeOuverture({
                    hireDate,
                    gender: getVal(['gender', 'genre', 'sexe', 'Sexe']),
                    childrenCount: Number.isFinite(childrenCount) ? childrenCount : 0,
                    joursPris: nombre(joursPrisVal) || 0,
                    soldeRepris: nombre(soldeReprisVal)
                });

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
                    hireDate,
                    matricule: matricule || null,
                    cnpsNumber: cnpsNumber || null,
                    bankName: bankName || null,
                    bankAccount: bankAccount || null,
                    childrenCount: Number.isFinite(childrenCount) ? childrenCount : 0,
                    annualLeaveBalance: ouverture.solde,
                    leaveBalanceSource: ouverture.source,
                    leaveBalanceSetAt: new Date()
                };
            })
            .filter(Boolean); // Filter out null/invalid mapping results

        if (dataToInsert.length === 0) {
            return res.status(400).json({ error: 'Aucun employé valide trouvé. Assurez-vous d\'avoir les en-têtes requis (ex: Nom, Prénom ou firstName, lastName).' });
        }

        // Prisma SQLite doesn't support createMany skipDuplicates — use upsert loop
        let created = 0;
        let skipped = 0;
        let soldesRepris = 0;
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
            data: await construireTachesIntegration(newEmp, prisma)
        });

                created++;
                if (emp.leaveBalanceSource === 'REPRISE') soldesRepris++;
            } catch (err) {
                console.error(`Skipping ${emp.email}:`, err.message);
                skipped++;
            }
        }

        // Le détail des soldes est remonté explicitement : un import silencieux
        // laisserait croire que les compteurs de congés ont été repris alors
        // qu'ils ont pu être calculés faute de colonne dans le fichier.
        const calcules = created - soldesRepris;
        res.status(201).json({
            message: `${created} employé(s) importé(s) avec succès${skipped > 0 ? `, ${skipped} ignoré(s) (doublons ou erreurs)` : ''}.`,
            count: created,
            soldes: {
                repris: soldesRepris,
                calcules,
                message: calcules > 0
                    ? `${calcules} solde(s) de congés calculé(s) depuis la date d'embauche, faute de colonne « solde congés » dans le fichier. À vérifier avant la première demande de congé.`
                    : 'Tous les soldes de congés ont été repris du fichier.'
            }
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
            data: await construireTachesIntegration({ id: id, department: employee?.department }, prisma)
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


/**
 * État du dossier administratif de l'effectif.
 *
 * Le registre unique du personnel s'imprimait jusqu'ici sans matricule ni
 * numéro CNPS — deux mentions que la base ne connaissait pas. Il était donc
 * produit, mais pas opposable, et rien ne le signalait. Cet écran dit ce qui
 * manque, à qui, et ce que l'absence empêche.
 */
exports.getConformite = async (req, res) => {
    try {
        // Les salariés sortis restent au registre mais ne sont plus déclarés :
        // leur dossier ne peut plus être complété et n'a pas à être compté
        // comme un manquement en cours.
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: dossier.selection(),
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
        });

        res.json(dossier.synthese(salaries));
    } catch (error) {
        console.error('Erreur conformité des dossiers :', error);
        res.status(500).json({ error: 'Erreur lors du contrôle des dossiers.' });
    }
};

// ----------------------------------------------------
// Corbeille
// ----------------------------------------------------

// Durée pendant laquelle un dossier supprimé reste restaurable. Au-delà, il est
// purgé : conserver indéfiniment le dossier complet d'une personne qui a quitté
// l'entreprise n'est ni utile ni légitime.
const RETENTION_JOURS = parseInt(process.env.DELETED_EMPLOYEE_RETENTION_DAYS, 10) || 30;

/** Dossiers supprimés encore restaurables. */
exports.getCorbeille = async (req, res) => {
    try {
        const limite = new Date(Date.now() - RETENTION_JOURS * 86400000);

        const dossiers = await prisma.deletedEmployee.findMany({
            where: { restoredAt: null, deletedAt: { gte: limite } },
            orderBy: { deletedAt: 'desc' },
            // L'instantané complet peut peser lourd : la liste n'en a pas
            // besoin, seule la restauration le lit.
            select: {
                id: true, employeeId: true, firstName: true, lastName: true,
                email: true, department: true, positionTitle: true,
                relatedCount: true, deletedAt: true, deletedBy: true
            }
        });

        res.json({
            retentionJours: RETENTION_JOURS,
            dossiers: dossiers.map((d) => ({
                ...d,
                // Jours restants avant purge définitive, arrondis au jour près.
                joursRestants: Math.max(
                    0,
                    RETENTION_JOURS - Math.floor((Date.now() - new Date(d.deletedAt)) / 86400000)
                )
            }))
        });
    } catch (error) {
        console.error('Erreur lecture corbeille :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture de la corbeille.' });
    }
};

/** Reconstitue un dossier supprimé. */
exports.restoreEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const entree = await prisma.deletedEmployee.findUnique({ where: { id } });
        if (!entree) {
            return res.status(404).json({ error: 'Ce dossier ne figure pas dans la corbeille.' });
        }
        if (entree.restoredAt) {
            return res.status(409).json({ error: 'Ce dossier a déjà été restauré.' });
        }

        const resultat = await corbeille.restaurer(prisma, entree.snapshot);

        await prisma.deletedEmployee.update({
            where: { id },
            data: { restoredAt: new Date(), restoredBy: req.user && req.user.email }
        });

        res.json({
            message: `${entree.firstName} ${entree.lastName} restauré(e).`,
            lignesRestaurees: resultat.restaurees,
            rattachements: resultat.rattaches,
            avertissements: resultat.avertissements,
            // Ce qui n'a pas pu revenir est dit, pas tu : une restauration
            // silencieusement partielle serait pire qu'un échec.
            echecs: resultat.echecs
        });
    } catch (error) {
        if (error.code === 'DEJA_PRESENT' || error.code === 'EMAIL_REPRIS') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Erreur restauration :', error);
        res.status(500).json({ error: 'Erreur lors de la restauration du dossier.' });
    }
};

/** Purge définitive d'un dossier, avant l'échéance de rétention. */
exports.purgerCorbeille = async (req, res) => {
    try {
        const { id } = req.params;
        const entree = await prisma.deletedEmployee.findUnique({ where: { id } });
        if (!entree) {
            return res.status(404).json({ error: 'Ce dossier ne figure pas dans la corbeille.' });
        }
        await prisma.deletedEmployee.delete({ where: { id } });
        res.json({ message: `Dossier de ${entree.firstName} ${entree.lastName} définitivement supprimé.` });
    } catch (error) {
        console.error('Erreur purge corbeille :', error);
        res.status(500).json({ error: 'Erreur lors de la purge.' });
    }
};

exports.RETENTION_JOURS = RETENTION_JOURS;
