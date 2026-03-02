const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding initial users...');

    // Mot de passe par défaut pour tous : sirh2026
    const defaultPassword = 'sirh';
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
        // Upsert permet d'insérer s'il n'existe pas, ou de mettre à jour s'il existe (évite les doublons d'email)
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    console.log('Seed completed: 6 users initialized with password "sirh".');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
