const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/cvs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `cv_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
    }
});
exports.uploadCV = multer({ storage });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =============== JOB OFFERS ===============

exports.getAllJobOffers = async (req, res) => {
    try {
        const offers = await prisma.jobOffer.findMany({
            include: { applicants: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offers);
    } catch (error) {
        console.error('Error fetching job offers:', error);
        res.status(500).json({ error: 'Failed to fetch job offers' });
    }
};

exports.createJobOffer = async (req, res) => {
    try {
        const { title, department, location, type, experience, description, requirements } = req.body;

        const newOffer = await prisma.jobOffer.create({
            data: {
                title,
                department,
                location,
                type,
                experience,
                description,
                requirements,
                status: 'PUBLISHED'
            }
        });

        res.status(201).json(newOffer);
    } catch (error) {
        console.error('Error creating job offer:', error);
        res.status(500).json({ error: 'Failed to create job offer' });
    }
};

exports.updateJobOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PUBLISHED', 'CLOSED', 'DRAFT'

        const updatedOffer = await prisma.jobOffer.update({
            where: { id },
            data: { status }
        });

        res.status(200).json(updatedOffer);
    } catch (error) {
        console.error('Error updating job offer status:', error);
        res.status(500).json({ error: 'Failed to update job offer status' });
    }
};

// =============== APPLICANTS ===============

exports.getAllApplicants = async (req, res) => {
    try {
        const applicants = await prisma.applicant.findMany({
            include: { jobOffer: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
};

exports.createApplicant = async (req, res) => {
    try {
        const { jobOfferId, firstName, lastName, email, phone, resumeUrl, experience } = req.body;

        const newApplicant = await prisma.applicant.create({
            data: {
                jobOfferId,
                firstName,
                lastName,
                email,
                phone,
                resumeUrl,
                experience,
                status: 'NEW'
            }
        });

        res.status(201).json(newApplicant);
    } catch (error) {
        console.error('Error creating applicant:', error);
        res.status(500).json({ error: 'Failed to analyze candidate' });
    }
};



exports.publicApply = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun CV fourni' });
        }

        // Get the default job offer (or the first one) to attach the applicant
        const jobOffers = await prisma.jobOffer.findMany({ take: 1 });
        let jobOfferId = req.body.jobOfferId;
        if (!jobOfferId && jobOffers.length > 0) {
            jobOfferId = jobOffers[0].id;
        }

        // Analyse the CV with AI
        let aiExtractedData = { firstName: 'Candidat', lastName: 'Inconnu', email: 'email@example.com', phone: '' };
        
        try {
            const mimeType = req.file.mimetype;
            const fileContent = fs.readFileSync(req.file.path).toString("base64");

            const prompt = `Tu es un recruteur expert. Analyse ce CV et extrais les informations sous forme de JSON strict :
            {
              "firstName": "Prénom du candidat",
              "lastName": "Nom de famille du candidat",
              "email": "Adresse email",
              "phone": "Numéro de téléphone"
            }
            Ne renvoie QUE le JSON, pas de texte autour.`;

            const result = await aiModel.generateContent([
                prompt,
                { inlineData: { data: fileContent, mimeType: mimeType } }
            ]);
            const response = await result.response;
            const textRes = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            aiExtractedData = JSON.parse(textRes);
        } catch (e) {
            console.error("AI Extraction failed, using defaults", e);
        }

        const applicant = await prisma.applicant.create({
            data: {
                firstName: aiExtractedData.firstName || 'Candidat',
                lastName: aiExtractedData.lastName || 'Inconnu',
                email: aiExtractedData.email || 'candidat@example.com',
                phone: aiExtractedData.phone || '',
                resumeUrl: `/uploads/cvs/${req.file.filename}`,
                source: 'Site Carrière',
                status: 'NOUVEAU',
                jobOfferId: jobOfferId || null
            }
        });

        res.status(201).json({ message: "Candidature reçue avec succès", applicant });
    } catch (error) {
        console.error('Public apply error:', error);
        res.status(500).json({ error: 'Erreur lors de la candidature' });
    }
};

exports.updateApplicantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (status === 'HIRED') {
            const applicant = await prisma.applicant.findUnique({
                where: { id },
                include: { jobOffer: true }
            });

            if (!applicant) {
                return res.status(404).json({ error: 'Applicant not found' });
            }

            const result = await prisma.$transaction(async (tx) => {
                const updatedApp = await tx.applicant.update({
                    where: { id },
                    data: { status }
                });

                // Evite les doublons si cliqué multiples fois
                const existingEmployee = await tx.employee.findUnique({ where: { email: applicant.email } });
                
                if (!existingEmployee) {
                    await tx.employee.create({
                        data: {
                            firstName: applicant.firstName,
                            lastName: applicant.lastName,
                            email: applicant.email,
                            role: 'Employee',
                            department: applicant.jobOffer.department,
                            positionTitle: applicant.jobOffer.title,
                            hireDate: new Date(),
                            status: 'ACTIVE',
                        }
                    });

                    const defaultPassword = 'Welcome2026!';
                    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                    
                    const existingUser = await tx.user.findUnique({ where: { email: applicant.email }});
                    if (!existingUser) {
                        await tx.user.create({
                            data: {
                                name: `${applicant.firstName} ${applicant.lastName}`,
                                email: applicant.email,
                                password: hashedPassword,
                                role: 'EMPLOYEE'
                            }
                        });
                    }
                }
                
                return updatedApp;
            });
            return res.status(200).json(result);
        }

        const updatedApplicant = await prisma.applicant.update({
            where: { id },
            data: { status }
        });

        res.status(200).json(updatedApplicant);
    } catch (error) {
        console.error('Error updating applicant status:', error);
        res.status(500).json({ error: 'Failed to update applicant status' });
    }
};

exports.analyzeCandidateWithAI = async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await prisma.applicant.findUnique({
            where: { id },
            include: { jobOffer: true }
        });

        if (!applicant) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const prompt = `
Tu es un expert RH. Évalue le profil suivant pour le poste de ${applicant.jobOffer.title}.
Description du poste : ${applicant.jobOffer.description}
Profil recherché : ${applicant.jobOffer.requirements}

Candidat : ${applicant.firstName} ${applicant.lastName}
Expérience/Compétences du candidat (simulé d'après son CV) : Le candidat possède une expérience préalable dans le domaine, a les bases académiques nécessaires et montre une bonne motivation.

Génère une réponse stricte au format JSON (sans Markdown) :
{
  "score": <nombre entre 1 et 100>,
  "summary": "<un résumé de 2 phrases justifiant le score par rapport au poste>"
}
`;
        
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        
        let aiText = response.text().trim();
        // Nettoyage au cas où Gemini renvoie du Markdown

        const parsed = JSON.parse(aiText.replace(/```json/g, '').replace(/```/g, '').trim());

        res.status(200).json({
            score: parsed.score,
            summary: parsed.summary
        });

    } catch (error) {
        console.error("Erreur IA Recrutement :", error);
        res.status(500).json({ error: "L'IA n'a pas pu analyser ce profil." });
    }
};
