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

        if (!title || !trainerName || !date || !durationHours || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({ error: 'Données invalides ou aucun participant sélectionné' });
        }

        // 1. Créer la session de formation
        const trainingSession = await prisma.trainingSession.create({
            data: {
                title,
                description,
                trainerName,
                date: new Date(date),
                durationHours: parseFloat(durationHours),
                status: 'Completed'
            }
        });

        // 2. Associer les employés à cette session
        const participationsData = participantIds.map(employeeId => ({
            sessionId: trainingSession.id,
            employeeId: employeeId,
            completionStatus: 'Completed'
        }));

        await prisma.trainingParticipation.createMany({
            data: participationsData
        });

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
