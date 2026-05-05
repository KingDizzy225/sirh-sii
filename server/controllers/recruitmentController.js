const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { GoogleGenAI } = require('@google/genai');

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
        res.status(500).json({ error: 'Failed to create applicant' });
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
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.2 }
        });

        let aiText = response.text().trim();
        // Nettoyage au cas où Gemini renvoie du Markdown
        if (aiText.startsWith('\`\`\`json')) {
            aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        }

        const result = JSON.parse(aiText);

        res.status(200).json({
            score: result.score,
            summary: result.summary
        });

    } catch (error) {
        console.error("Erreur IA Recrutement :", error);
        res.status(500).json({ error: "L'IA n'a pas pu analyser ce profil." });
    }
};
