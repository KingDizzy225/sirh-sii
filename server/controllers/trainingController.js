const prisma = require('../prismaClient');

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
                        }
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
                }
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
