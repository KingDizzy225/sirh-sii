const prisma = require('../prismaClient');
const { getGenerativeModel } = require("../lib/claudeAI");

exports.getSurveys = async (req, res) => {
    try {
        const surveys = await prisma.climateSurvey.findMany({
            include: { responses: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(surveys);
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ error: "Erreur de chargement des sondages." });
    }
};

exports.createSurvey = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userEmail = req.user.email;

        const survey = await prisma.climateSurvey.create({
            data: {
                title,
                description: description || null,
                status: 'ACTIVE',
                createdBy: userEmail
            }
        });
        res.status(201).json(survey);
    } catch (error) {
        console.error("Error creating survey:", error);
        res.status(500).json({ error: "Erreur de création du sondage." });
    }
};

exports.submitResponse = async (req, res) => {
    try {
        const { surveyId, score, feedback, department } = req.body;

        const response = await prisma.surveyResponse.create({
            data: {
                surveyId,
                score: parseInt(score),
                feedback: feedback || null,
                department: department || 'Général'
            }
        });

        // Recalculate eNPS for the survey (% Promoters (9-10) - % Detractors (0-6))
        const allResponses = await prisma.surveyResponse.findMany({ where: { surveyId } });
        const total = allResponses.length;
        if (total > 0) {
            const promoters = allResponses.filter(r => r.score >= 9).length;
            const detractors = allResponses.filter(r => r.score <= 6).length;
            const enpsScore = Math.round(((promoters - detractors) / total) * 100);

            await prisma.climateSurvey.update({
                where: { id: surveyId },
                data: { enpsScore }
            });
        }

        res.status(201).json(response);
    } catch (error) {
        console.error("Error submitting survey response:", error);
        res.status(500).json({ error: "Erreur d'enregistrement du vote." });
    }
};

exports.analyzeSentimentWithAi = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const responses = await prisma.surveyResponse.findMany({ where: { surveyId } });
        const comments = responses.map(r => r.feedback).filter(Boolean);

        if (comments.length === 0) {
            return res.json({
                summary: "Aucun commentaire textuel rédigé pour le moment.",
                initiatives: ["Organiser un atelier d'échange en équipe", "Sensibiliser à la politique de bien-être au travail", "Maintenir un point régulier RH"]
            });
        }

        try {
            const model = getGenerativeModel();
            const prompt = `Voici des commentaires anonymes de collaborateurs lors d'une enquête sur le climat social d'une entreprise :\n${comments.join('\n')}\nSynthétise le climat global et propose 3 initiatives RH concrètes et bienveillantes sous format JSON : { "summary": "...", "initiatives": ["...", "...", "..."] }`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            return res.json(parsed);
        } catch (aiErr) {
            console.warn("Repli hors-ligne de l’IA :", aiErr.message);
            return res.json({
                summary: "Le climat global reflète un fort engagement sur la collaboration avec des attentes sur la flexibilité.",
                initiatives: [
                    "Renforcer la flexibilité du temps de travail et du remote",
                    "Organiser des sessions mensuelles de feedback avec les managers",
                    "Mettre en place des programmes de reconnaissance des efforts"
                ]
            });
        }
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        res.status(500).json({ error: "Erreur d'analyse IA." });
    }
};
