const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding initial data...');

    // Nettoyer la base (optionnel mais utile en dev)
    await prisma.expense.deleteMany({});
    await prisma.assetAssignment.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.leave.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});

    // Mot de passe par défaut pour tous
    const defaultPassword = 'SIIRH';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const initialUsers = [
        { email: 'admin@sirh.com', name: 'Super Admin', role: 'ADMIN', password: hashedPassword },
        { email: 'drh@sirh.com', name: 'Directeur RH', role: 'HR', password: hashedPassword },
        { email: 'manager1@sirh.com', name: 'Manager Opérationnel', role: 'MANAGER', password: hashedPassword },
        { email: 'rh1@sirh.com', name: 'Assistant RH 1', role: 'HR', password: hashedPassword },
        { email: 'rh2@sirh.com', name: 'Assistant RH 2', role: 'HR', password: hashedPassword },
        { email: 'manager2@sirh.com', name: 'Manager IT', role: 'MANAGER', password: hashedPassword }
    ];

    for (const user of initialUsers) {
        await prisma.user.create({ data: user });
    }

    // Création des Employés correspondants (liés par l'email pour le Dashboard)
    const employeesData = [
        { firstName: 'Super', lastName: 'Admin', email: 'admin@sirh.com', role: 'Administrator', department: 'Direction', status: 'ACTIVE', hireDate: new Date('2020-01-01'), positionTitle: 'CEO' },
        { firstName: 'Directeur', lastName: 'RH', email: 'drh@sirh.com', role: 'HR', department: 'Ressources Humaines', status: 'ACTIVE', hireDate: new Date('2021-03-15'), positionTitle: 'DRH' },
        { firstName: 'Manager', lastName: 'Opérationnel', email: 'manager1@sirh.com', role: 'Manager', department: 'Opérations', status: 'ACTIVE', hireDate: new Date('2022-06-10'), positionTitle: 'Chef de Projet' },
        { firstName: 'Assistant', lastName: 'RH 1', email: 'rh1@sirh.com', role: 'HR', department: 'Ressources Humaines', status: 'ACTIVE', hireDate: new Date('2023-01-20'), positionTitle: 'Chargé de Recrutement' },
        { firstName: 'Assistant', lastName: 'RH 2', email: 'rh2@sirh.com', role: 'HR', department: 'Ressources Humaines', status: 'ACTIVE', hireDate: new Date('2024-05-05'), positionTitle: 'Gestionnaire Paie' },
        { firstName: 'Manager', lastName: 'IT', email: 'manager2@sirh.com', role: 'Manager', department: 'Ingénierie', status: 'ACTIVE', hireDate: new Date('2021-11-01'), positionTitle: 'Lead Developer' }
    ];

    const employees = [];
    for (const emp of employeesData) {
        const createdEmp = await prisma.employee.create({ data: emp });
        employees.push(createdEmp);
    }

    const manager1 = employees.find(e => e.email === 'manager1@sirh.com');
    const rh1 = employees.find(e => e.email === 'rh1@sirh.com');

    // Création d'Équipements (Assets)
    const assetsData = [
        { assetTag: 'IT-MAC-001', category: 'Laptop', model: 'MacBook Pro M2 14"', status: 'Assigné', departmentOwner: 'Ingénierie', purchaseDate: new Date('2023-01-15') },
        { assetTag: 'IT-MAC-002', category: 'Laptop', model: 'MacBook Pro M2 14"', status: 'Disponible', departmentOwner: 'Ressources Humaines', purchaseDate: new Date('2023-06-20') },
        { assetTag: 'IT-PHN-001', category: 'Mobile Phone', model: 'iPhone 14 Pro', status: 'Assigné', departmentOwner: 'Direction', purchaseDate: new Date('2022-10-01') },
        { assetTag: 'FLEET-001', category: 'Vehicle', model: 'Peugeot 3008', status: 'En réparation', departmentOwner: 'Opérations', purchaseDate: new Date('2021-05-10') }
    ];

    const createdAssets = [];
    for (const asset of assetsData) {
        const createdAsset = await prisma.asset.create({ data: asset });
        createdAssets.push(createdAsset);
    }

    // Assigner certains équipements
    await prisma.assetAssignment.create({
        data: {
            assetId: createdAssets[0].id,
            employeeId: manager1.id,
            assignedDate: new Date('2023-01-20')
        }
    });

    await prisma.assetAssignment.create({
        data: {
            assetId: createdAssets[2].id,
            employeeId: rh1.id,
            assignedDate: new Date('2022-10-05')
        }
    });

    // Création de Notes de Frais (Expenses)
    const expensesData = [
        { employeeId: manager1.id, amount: 45000, currency: 'FCFA', category: 'Déplacement', merchant: 'Taxi Abidjan', date: new Date('2026-03-01'), status: 'En attente' },
        { employeeId: manager1.id, amount: 120000, currency: 'FCFA', category: 'Équipement', merchant: 'Fnac', date: new Date('2026-02-15'), status: 'Approuvé' },
        { employeeId: rh1.id, amount: 15000, currency: 'FCFA', category: 'Repas', merchant: 'Restaurant Le Plateau', date: new Date('2026-03-10'), status: 'En attente' },
        { employeeId: rh1.id, amount: 250000, currency: 'FCFA', category: 'Déplacement', merchant: 'Air Côte d\'Ivoire', date: new Date('2026-01-20'), status: 'Rejeté', rejectionReason: 'Dépassement de plafond hors mission prioritaire' }
    ];

    for (const exp of expensesData) {
        await prisma.expense.create({ data: exp });
    }

    // Création de Congés (Leaves)
    await prisma.leave.createMany({
        data: [
            { employeeId: manager1.id, type: 'Annual', startDate: new Date('2026-04-10'), endDate: new Date('2026-04-15'), status: 'Pending', durationDays: 5, reason: 'Vacances de Pâques' },
            { employeeId: rh1.id, type: 'Sick', startDate: new Date('2026-02-05'), endDate: new Date('2026-02-06'), status: 'Approved', durationDays: 2, reason: 'Grippe' }
        ]
    });

    console.log('Seed completed successfully with Employees, Assets, and Expenses data.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
