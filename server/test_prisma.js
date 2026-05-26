const prisma = require('./prismaClient');
async function test() {
    const trainings = await prisma.trainingSession.findMany({
        orderBy: { date: 'desc' },
        include: { modules: true }
    });
    console.log("Trainings count:", trainings.length);
    console.log("Trainings:", JSON.stringify(trainings.map(t => ({ title: t.title, modules: t.modules.length })), null, 2));
}
test();
