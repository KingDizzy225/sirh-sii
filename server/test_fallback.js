const prisma = require('./prismaClient');
async function test() {
    try {
        const topic = "Management";
        console.log("Utilisation du Fallback (Quota AI dépassé) pour le sujet:", topic);
            
        const fallbackSession = await prisma.trainingSession.create({
            data: {
                title: `Initiation: ${topic || 'Formation Générique'}`,
                description: `Ce cours a été généré automatiquement par notre module de secours suite à l'indisponibilité temporaire de l'IA. Il couvre les concepts essentiels liés à ${topic}.`,
                trainerName: 'Système RH (Secours)',
                date: new Date(),
                durationHours: 2.0,
                status: 'Active'
            }
        });

        await prisma.courseModule.createMany({
            data: [
                {
                    sessionId: fallbackSession.id,
                    title: "Module 1 - Introduction et Fondamentaux",
                    content: `Bienvenue dans cette formation sur : ${topic}.\n\nCe premier module aborde les bases fondamentales. Assurez-vous d'avoir pris connaissance des prérequis.`,
                    orderSequence: 0
                },
                {
                    sessionId: fallbackSession.id,
                    title: "Module 2 - Concepts Avancés",
                    content: `Maintenant que vous maîtrisez les bases de ${topic}, plongeons dans des cas d'utilisation plus complexes.`,
                    orderSequence: 1
                }
            ]
        });
        console.log("SUCCESS");
    } catch (e) {
        console.error(e);
    }
}
test();
