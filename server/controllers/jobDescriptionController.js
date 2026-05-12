const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prismaClient');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.getJobDescriptions = async (req, res) => {
    try {
        const jobs = await prisma.jobDescription.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getJobDescriptionById = async (req, res) => {
    try {
        const job = await prisma.jobDescription.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ error: "Introuvable" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.generateJobDescription = async (req, res) => {
    try {
        const { title, department } = req.body;

        const systemPrompt = `Tu es un Expert RH spécialisé dans la rédaction de fiches de poste modernes et attractives pour l'entreprise ivoirienne SII.
Rédige une fiche de poste complète et structurée au format HTML (uniquement le corps, sans les balises <html>, <head> ou <body>).
Le poste est : "${title}" dans le département : "${department}".

La structure attendue DOIT être exactement la suivante, avec de belles balises HTML (h2, h3, ul, li, p, strong) :
<h2>Description du Poste : ${title}</h2>
<p>[Une brève introduction accrocheuse]</p>

<h3>🎯 Vos Missions Principales</h3>
<ul>
  <li>[Mission 1]</li>
  ...
</ul>

<h3>🧠 Compétences Requises (Hard Skills)</h3>
<ul>...</ul>

<h3>🤝 Savoir-Être (Soft Skills)</h3>
<ul>...</ul>

<h3>💰 Rémunération & Avantages</h3>
<p>Salaire estimé sur le marché (en FCFA) : [Fourchette réaliste]</p>
<ul>
  <li>Assurance Santé à 80%</li>
  ...
</ul>

Réponds UNIQUEMENT par le code HTML généré. Aucun autre texte.`;

        const result = await aiModel.generateContent(systemPrompt);
        const response = await result.response;
        let htmlContent = response.text().trim();
        
        // Remove markdown formatting if Gemini added it
        if (htmlContent.startsWith('```html')) {
            htmlContent = htmlContent.substring(7);
        }
        if (htmlContent.endsWith('```')) {
            htmlContent = htmlContent.substring(0, htmlContent.length - 3);
        }

        const job = await prisma.jobDescription.create({
            data: {
                title,
                department,
                content: htmlContent
            }
        });

        res.status(201).json(job);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Erreur lors de la génération par l'IA" });
    }
};

exports.updateJobDescription = async (req, res) => {
    try {
        const { content, status } = req.body;
        const job = await prisma.jobDescription.update({
            where: { id: req.params.id },
            data: { content, status }
        });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteJobDescription = async (req, res) => {
    try {
        await prisma.jobDescription.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
