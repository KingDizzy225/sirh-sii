const prisma = require('../prismaClient');

exports.getCareerPath = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Fetch current employee to get their role and department
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { skills: true }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        // Logic for career paths (static mapping for now, can be enhanced with AI)
        // This simulates a 'constellation' of possibilities
        const allRoles = [
            { id: '1', title: 'Développeur Junior', department: 'IT', level: 1 },
            { id: '2', title: 'Développeur Senior', department: 'IT', level: 2 },
            { id: '3', title: 'Lead Developer', department: 'IT', level: 3 },
            { id: '4', title: 'Architecte Solution', department: 'IT', level: 4 },
            { id: '5', title: 'Product Manager', department: 'Product', level: 3 },
            { id: '6', title: 'CTO', department: 'Direction', level: 5 },
            { id: '7', title: 'Engineering Manager', department: 'IT', level: 4 }
        ];

        // Filter and map connections
        const currentRole = allRoles.find(r => r.title === employee.positionTitle) || { title: employee.positionTitle, level: 2, department: employee.department };
        
        const nodes = allRoles.map(role => ({
            ...role,
            isCurrent: role.title === employee.positionTitle,
            isPossible: role.level >= currentRole.level && (role.department === currentRole.department || role.level > 3)
        }));

        const links = [];
        // Connect nodes based on level progression
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                if (nodes[i].level === nodes[j].level - 1 && nodes[i].department === nodes[j].department) {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
                // Management bridge
                if (nodes[i].level === 3 && nodes[j].level === 4 && nodes[j].title.includes('Manager')) {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
            }
        }

        res.status(200).json({ nodes, links, currentRole: employee.positionTitle });
    } catch (error) {
        console.error("Error fetching career path:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du plan de carrière" });
    }
};

exports.getTimeline = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const [employee, leaves, participations, kudos, history] = await Promise.all([
            prisma.employee.findUnique({ where: { id: employeeId } }),
            prisma.leave.findMany({ where: { employeeId, status: 'Approved' }, orderBy: { startDate: 'desc' } }),
            prisma.trainingParticipation.findMany({ where: { employeeId }, include: { session: true }, orderBy: { createdAt: 'desc' } }),
            prisma.kudo.findMany({ where: { receiverId: employeeId }, include: { sender: true }, orderBy: { createdAt: 'desc' } }),
            prisma.careerHistory.findMany({ where: { employeeId }, orderBy: { eventDate: 'desc' } })
        ]);

        // Merge all into a unified timeline
        const events = [
            {
                id: 'hire',
                date: employee.hireDate,
                type: 'HIRE',
                title: 'Bienvenue chez SII !',
                description: `A rejoint l'entreprise en tant que ${employee.positionTitle}.`,
                icon: 'Home'
            },
            ...leaves.map(l => ({
                id: l.id,
                date: l.startDate,
                type: 'LEAVE',
                title: `Congé ${l.type}`,
                description: `Absence de ${l.durationDays} jours.`,
                icon: 'Calendar'
            })),
            ...participations.map(p => ({
                id: p.id,
                date: p.session.date,
                type: 'TRAINING',
                title: `Formation : ${p.session.title}`,
                description: `Formation de ${p.session.durationHours}h terminée avec succès.`,
                icon: 'GraduationCap'
            })),
            ...kudos.map(k => ({
                id: k.id,
                date: k.createdAt,
                type: 'KUDO',
                title: `Kudo reçu de ${k.sender.firstName}`,
                description: `"${k.message}"`,
                icon: 'Heart'
            })),
            ...history.map(h => ({
                id: h.id,
                date: h.eventDate,
                type: h.type,
                title: h.type === 'PROMOTION' ? 'Promotion !' : 'Changement de poste',
                description: `Passage de ${h.previousValue} à ${h.newValue}.`,
                icon: 'Award'
            }))
        ];

        // Sort by date descending
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching timeline:", error);
        res.status(500).json({ error: "Erreur lors de la génération de la timeline" });
    }
};
