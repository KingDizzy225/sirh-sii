const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prismaClient');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        
        let employeeContext = "Employé non identifié.";
        if (req.user && req.user.email) {
            const employee = await prisma.employee.findUnique({
                where: { email: req.user.email },
                include: { leaves: true }
            });
            if (employee) {
                const totalLeavesTaken = employee.leaves.filter(l => l.status === 'APPROVED').reduce((acc, l) => {
                    const diffTime = Math.abs(new Date(l.endDate) - new Date(l.startDate));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return acc + diffDays;
                }, 0);
                const remainingLeaves = 30 - totalLeavesTaken;
                
                employeeContext = `Tu parles à ${employee.firstName} ${employee.lastName}, qui occupe le poste de ${employee.positionTitle} dans le département ${employee.department}. Il/Elle a actuellement ${remainingLeaves} jours de congés disponibles.`;
            }
        }

        const systemPrompt = `Tu es l'assistant RH officiel pour l'entreprise ivoirienne SII.
Ton rôle est d'informer les collaborateurs avec un ton poli, professionnel, et concis.
Contexte d'entreprise :
- Heures de travail : 8h-17h du Lundi au Vendredi.
- Congés payés : 30 jours par an.
- Mutuelle Santé : L'entreprise prend en charge 80%, vous 20%.

Contexte du collaborateur actuel :
${employeeContext}

Réponds de manière stricte et concise à cette question de l'employé : "${message}"`;

        const result = await aiModel.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch(err) {
        console.error("Chat Error:", err);
        res.status(500).json({ reply: 'Désolé, je rencontre des difficultés techniques actuellement.' });
    }
};
