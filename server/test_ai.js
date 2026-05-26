require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('./prismaClient'); // Check if prisma works

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const topic = "Management";
        const prompt = `Tu es un expert RH et ingénieur pédagogique. Le RH veut créer un cours sur le thème suivant : "${topic}".
        Génère une session de formation complète avec exactement 3 modules (chapitres).
        Le format de réponse doit être STRICTEMENT un objet JSON valide, SANS balises markdown, avec cette structure :
        {
            "title": "Titre accrocheur du cours",
            "description": "Courte description de ce que les employés vont apprendre",
            "durationHours": 2.5,
            "modules": [
                {
                    "title": "Titre du chapitre 1",
                    "content": "Contenu pédagogique détaillé de ce chapitre (au moins 2 paragraphes)."
                }
            ]
        }`;

        const result = await aiModel.generateContent(prompt);
        const textResponse = await result.response.text();
        console.log("TEXT RESPONSE:");
        console.log(textResponse);
        
        const match = textResponse.match(/\{[\s\S]*\}/);
        if (!match) {
            console.log("No JSON match found");
            return;
        }
        
        const courseData = JSON.parse(match[0]);
        console.log("PARSED JSON:", courseData);

        const trainingSession = await prisma.trainingSession.create({
            data: {
                title: courseData.title,
                description: courseData.description,
                trainerName: 'IA (Gemini)',
                date: new Date(),
                durationHours: courseData.durationHours,
                status: 'Active'
            }
        });
        console.log("Created Training Session:", trainingSession);

        const modulePromises = courseData.modules.map((m, idx) => {
            return prisma.courseModule.create({
                data: {
                    sessionId: trainingSession.id,
                    title: m.title,
                    content: m.content,
                    orderSequence: idx
                }
            });
        });

        await Promise.all(modulePromises);
        console.log("Created Modules");
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
    }
}
test();
