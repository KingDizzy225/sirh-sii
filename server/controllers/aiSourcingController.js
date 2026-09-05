const { getGenerativeModel } = require("../lib/claudeAI");
const prisma = require('../prismaClient');

exports.analyzeCandidates = async (req, res) => {
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
             return res.status(500).json({ error: 'La clé ANTHROPIC_API_KEY n\'est pas configurée sur le serveur.' });
        }
        
        const { jobDescription, candidates } = req.body; // candidates is an array of { name, resumeText }

        if (!jobDescription || !candidates || candidates.length === 0) {
            return res.status(400).json({ error: "Description de poste et candidats requis." });
        }
        const model = getGenerativeModel();

        const prompt = `
            Tu es un expert en recrutement RH. 
            Analyse les candidats suivants par rapport à la description de poste fournie.
            Pour chaque candidat, donne un score de correspondance sur 100, une liste de points forts et une liste de points faibles (écarts de compétences).
            
            Description de poste:
            ${jobDescription}

            Candidats:
            ${candidates.map((c, i) => `Candidat ${i+1} (${c.name}): ${c.resumeText}`).join('\n\n')}

            Renvoie le résultat UNIQUEMENT sous forme de JSON valide avec cette structure:
            [
                {
                    "name": "Nom du candidat",
                    "score": 85,
                    "strengths": ["compétence 1", "expérience X"],
                    "weaknesses": ["manque de Y"],
                    "summary": "Court résumé de 2 lignes"
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean markdown JSON if present
        text = text.replace(/```json|```/g, "").trim();
        
        const analysis = JSON.parse(text);
        res.json(analysis);
    } catch (error) {
        console.error("AI Sourcing Error:", error);
        res.status(500).json({ error: "Erreur lors de l'analyse IA." });
    }
};
