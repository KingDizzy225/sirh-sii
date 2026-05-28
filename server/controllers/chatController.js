const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prismaClient');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        
        let employeeId = null;
        let employeeContext = "Vous parlez à un utilisateur non identifié ou non lié à un profil employé.";
        if (req.user && req.user.email) {
            const employee = await prisma.employee.findUnique({
                where: { email: req.user.email },
                include: { leaves: true }
            });
            if (employee) {
                employeeId = employee.id;
                const totalLeavesTaken = employee.leaves.filter(l => l.status === 'APPROVED').reduce((acc, l) => {
                    const diffTime = Math.abs(new Date(l.endDate) - new Date(l.startDate));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return acc + diffDays;
                }, 0);
                const remainingLeaves = 30 - totalLeavesTaken;
                
                employeeContext = `Tu parles à ${employee.firstName} ${employee.lastName}, qui occupe le poste de ${employee.positionTitle} dans le département ${employee.department}. Il/Elle a actuellement ${remainingLeaves} jours de congés disponibles. Date d'aujourd'hui: ${new Date().toISOString().split('T')[0]}.`;
            }
        }

        const systemPrompt = `Tu es l'assistant RH officiel pour l'entreprise ivoirienne SII.
Ton rôle est d'informer les collaborateurs et d'exécuter des actions pour eux (ex: poser des congés).
Contexte d'entreprise : Heures de travail : 8h-17h. Congés payés : 30 jours par an. Mutuelle Santé : 80%.
Contexte du collaborateur actuel :
${employeeContext}

L'employé dit : "${message}"

Analyse l'intention de l'employé.
Tu dois OBLIGATOIREMENT répondre avec un objet JSON strict et valide, sans balise markdown autour, ayant cette structure exacte :
{
  "intent": "INFO" ou "CREATE_LEAVE",
  "reply": "Le texte poli que tu réponds à l'employé. Si tu poses un congé, dis-lui que c'est fait et confirme les dates. S'il n'a plus de jours disponibles, refuse poliment.",
  "actionData": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "reason": "La raison de l'absence"
  }
}
L'objet "actionData" ne doit être rempli que si intent est "CREATE_LEAVE" ET que l'employé a assez de congés. Sinon, null.`;

        const result = await aiModel.generateContent(systemPrompt);
        const textResponse = await result.response.text();
        
        let cleanedJson = textResponse.trim();
        if (cleanedJson.startsWith('\`\`\`json')) cleanedJson = cleanedJson.replace(/\`\`\`json/g, '');
        if (cleanedJson.startsWith('\`\`\`')) cleanedJson = cleanedJson.replace(/\`\`\`/g, '');
        cleanedJson = cleanedJson.replace(/\`\`\`/g, '').trim();

        const responseData = JSON.parse(cleanedJson);

        // Si l'IA a détecté une demande de création de congé valide
        if (responseData.intent === 'CREATE_LEAVE' && responseData.actionData && employeeId) {
            try {
                await prisma.leave.create({
                    data: {
                        employeeId: employeeId,
                        leaveType: 'ANNUAL',
                        startDate: new Date(responseData.actionData.startDate),
                        endDate: new Date(responseData.actionData.endDate),
                        reason: responseData.actionData.reason || "Demande via Assistant IA",
                        status: 'PENDING'
                    }
                });
            } catch (dbErr) {
                console.error("Erreur création congé via Chatbot:", dbErr);
                return res.json({ reply: "J'ai compris votre demande, mais j'ai rencontré une erreur technique en essayant d'enregistrer le congé dans la base." });
            }
        }

        res.json({ reply: responseData.reply });
    } catch(err) {
        console.error("Chat Error:", err);
        res.status(500).json({ reply: 'Désolé, je rencontre des difficultés techniques actuellement.' });
    }
};
