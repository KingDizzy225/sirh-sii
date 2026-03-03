const prisma = require('./prismaClient');

async function main() {
    try {
        const newEmployee = await prisma.employee.create({
            data: {
                firstName: "Test",
                lastName: "User",
                email: "test.user@entreprise.com",
                role: 'Employee',
                department: 'IT',
                positionTitle: 'Dev',
                hireDate: new Date(),
                status: 'ACTIVE',
            }
        });
        console.log("Success:", newEmployee);
    } catch (err) {
        console.error("Exact Prisma error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
