const prisma = require('./prismaClient');

async function main() {
    console.log('Seeding employees and leaves...');

    // Get all users
    const users = await prisma.user.findMany();

    for (const user of users) {
        // Split name into first/last
        const parts = user.name.split(' ');
        const firstName = parts[0] || 'Prénom';
        const lastName = parts.slice(1).join(' ') || 'Nom';

        // Upsert employee matching the user ID so they align beautifully
        await prisma.employee.upsert({
            where: { email: user.email },
            update: {},
            create: {
                id: user.id, // Using same UUID as User!
                firstName,
                lastName,
                email: user.email,
                role: user.role === 'ADMIN' ? 'Administrator' : user.role === 'HR' ? 'HR' : user.role === 'MANAGER' ? 'Manager' : 'Employee',
                department: 'Direction',
                status: 'ACTIVE',
                hireDate: new Date('2024-01-01'),
                positionTitle: user.role === 'MANAGER' ? 'Directeur' : 'Agent'
            }
        });
    }

    console.log('Employees seeded!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
