const prisma = require('../prismaClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Récupérer toutes les sessions de formation (Cahier de formation)
exports.getAllTrainings = async (req, res) => {
    try {
        const trainings = await prisma.trainingSession.findMany({
            include: {
                participations: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                department: true
                            }
                        },
                        moduleProgresses: true
                    }
                },
                modules: {
                    orderBy: {
                        orderSequence: 'asc'
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.status(200).json(trainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du cahier de formation' });
    }
};

// Ajouter une nouvelle formation terminée
exports.createTraining = async (req, res) => {
    try {
        const { title, description, trainerName, date, durationHours, participantIds } = req.body;

        if (!title || !trainerName || !date || !durationHours) {
            return res.status(400).json({ error: 'Données invalides: Titre, formateur, date et durée complétés requis.' });
        }

        const newStatus = (!participantIds || participantIds.length === 0) ? 'Active' : 'Completed';

        // 1. Créer la session de formation
        const trainingSession = await prisma.trainingSession.create({
            data: {
                title,
                description: description || '',
                trainerName,
                date: new Date(date),
                durationHours: parseFloat(durationHours),
                status: newStatus
            }
        });

        // 2. Associer les employés à cette session s'il y en a
        if (Array.isArray(participantIds) && participantIds.length > 0) {
            const participationsData = participantIds.map(employeeId => ({
                sessionId: trainingSession.id,
                employeeId: employeeId,
                completionStatus: 'Completed'
            }));

            await prisma.trainingParticipation.createMany({
                data: participationsData
            });
        }

        // 3. Retourner la session complète (avec les relations)
        const completeSession = await prisma.trainingSession.findUnique({
            where: { id: trainingSession.id },
            include: {
                participations: {
                    include: {
                        employee: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                },
                modules: true
            }
        });

        res.status(201).json(completeSession);
    } catch (error) {
        console.error('Error creating training:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la formation' });
    }
};

// S'inscrire à une formation en ligne (Employé)
exports.enrollInTraining = async (req, res) => {
    try {
        const { id } = req.user;
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID requis' });
        }

        const session = await prisma.trainingSession.findUnique({ where: { id: sessionId }});
        if (!session) return res.status(404).json({ error: 'Formation introuvable' });

        const enrollment = await prisma.trainingParticipation.create({
            data: {
                sessionId,
                employeeId: id,
                completionStatus: 'En cours'
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Vous êtes déjà inscrit à cette formation.' });
        }
        console.error('Error Enrolling in training:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription à la formation.' });
    }
};

// =======================
// LMS MODULES MANAGEMENT
// =======================

exports.createModule = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title, content, mediaUrl, orderSequence } = req.body;

        const session = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
        if (!session) return res.status(404).json({ error: 'Cours introuvable' });

        const module = await prisma.courseModule.create({
            data: {
                sessionId,
                title,
                content: content || '',
                mediaUrl: mediaUrl || '',
                orderSequence: parseInt(orderSequence, 10) || 0
            }
        });

        res.status(201).json(module);
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ error: 'Erreur création module' });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        await prisma.courseModule.delete({ where: { id: moduleId } });
        res.status(200).json({ message: 'Module supprimé' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: 'Erreur suppression module' });
    }
};

exports.markProgressCompleted = async (req, res) => {
    try {
        const { id } = req.user; // employeeId
        const { sessionId, moduleId } = req.body;

        // Find participation
        const participation = await prisma.trainingParticipation.findUnique({
            where: {
                sessionId_employeeId: {
                    sessionId: sessionId,
                    employeeId: id
                }
            }
        });

        if (!participation) {
            return res.status(404).json({ error: 'Participation introuvable. Êtes-vous inscrit ?' });
        }

        const progress = await prisma.moduleProgress.upsert({
            where: {
                participationId_moduleId: {
                    participationId: participation.id,
                    moduleId: moduleId
                }
            },
            update: { completedDate: new Date() },
            create: {
                participationId: participation.id,
                moduleId: moduleId,
                completedDate: new Date()
            }
        });

        // Check if all modules are completed to update overall participation status
        const allModules = await prisma.courseModule.findMany({ where: { sessionId } });
        const allProgress = await prisma.moduleProgress.findMany({ where: { participationId: participation.id } });

        if (allModules.length > 0 && allProgress.length >= allModules.length) {
            await prisma.trainingParticipation.update({
                where: { id: participation.id },
                data: { completionStatus: 'Completed' }
            });
        }

        res.status(200).json(progress);
    } catch (error) {
        console.error('Error marking progress:', error);
        res.status(500).json({ error: 'Erreur lors de la validation du module' });
    }
};

// =======================
// IA GENERATION MODULE
// =======================

exports.generateAITraining = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ error: 'Thème requis' });

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
                },
                {
                    "title": "Titre du chapitre 2",
                    "content": "Contenu pédagogique détaillé..."
                },
                {
                    "title": "Titre du chapitre 3",
                    "content": "Contenu pédagogique détaillé..."
                }
            ]
        }`;

        const result = await aiModel.generateContent(prompt);
        const textResponse = await result.response.text();
        
        let cleanedJson = textResponse.trim();
        if (cleanedJson.startsWith('\`\`\`json')) cleanedJson = cleanedJson.replace(/\`\`\`json/g, '');
        if (cleanedJson.startsWith('\`\`\`')) cleanedJson = cleanedJson.replace(/\`\`\`/g, '');
        cleanedJson = cleanedJson.replace(/\`\`\`/g, '').trim();

        const courseData = JSON.parse(cleanedJson);

        // Save to DB
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

        const completeSession = await prisma.trainingSession.findUnique({
            where: { id: trainingSession.id },
            include: { modules: true }
        });

        res.status(201).json(completeSession);
    } catch (error) {
        console.error('Error generating AI training:', error);
        res.status(500).json({ error: 'Erreur lors de la génération IA du cours.' });
    }
};
