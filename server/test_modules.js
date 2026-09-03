const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all course modules from the database...");
    const modules = await prisma.courseModule.findMany({
        include: { session: true }
    });
    console.log(`Found ${modules.length} modules.`);
    modules.forEach(m => {
        console.log(`- ID: ${m.id}`);
        console.log(`  Title: ${m.title}`);
        console.log(`  Course: ${m.session?.title}`);
        console.log(`  MediaUrl: ${m.mediaUrl}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
