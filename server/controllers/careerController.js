const prisma = require('../prismaClient');

exports.getCareerPath = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startRole } = req.query;
        
        // Fetch current employee to get their role and department
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { skills: true }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        // Complete list of roles across 6 main departments at SII Côte d'Ivoire
        const allRoles = [
            // Tech / IT
            { id: 'tech1', title: 'Support Technique Junior', department: 'Tech', level: 1 },
            { id: 'tech2', title: 'Développeur Junior', department: 'Tech', level: 1 },
            { id: 'tech3', title: 'Développeur Senior', department: 'Tech', level: 2 },
            { id: 'tech4', title: 'Ingénieur DevOps', department: 'Tech', level: 2 },
            { id: 'tech5', title: 'Lead Developer', department: 'Tech', level: 3 },
            { id: 'tech6', title: 'Architecte Solution', department: 'Tech', level: 4 },
            { id: 'tech7', title: 'Engineering Manager', department: 'Tech', level: 4 },
            { id: 'tech8', title: 'CTO', department: 'Tech', level: 5 },

            // Product
            { id: 'prod1', title: 'Product Owner', department: 'Product', level: 2 },
            { id: 'prod2', title: 'Product Manager', department: 'Product', level: 3 },
            { id: 'prod3', title: 'UX/UI Designer', department: 'Product', level: 2 },
            { id: 'prod4', title: 'Lead Designer', department: 'Product', level: 3 },
            { id: 'prod5', title: 'Chief Product Officer', department: 'Product', level: 5 },

            // Human Resources
            { id: 'hr1', title: 'Assistant RH', department: 'Ressources Humaines', level: 1 },
            { id: 'hr2', title: 'Chargé de Recrutement', department: 'Ressources Humaines', level: 2 },
            { id: 'hr3', title: 'Responsable RH', department: 'Ressources Humaines', level: 3 },
            { id: 'hr4', title: 'Directeur RH', department: 'Ressources Humaines', level: 4 },

            // Finance
            { id: 'fin1', title: 'Comptable Junior', department: 'Finance', level: 1 },
            { id: 'fin2', title: 'Comptable Senior', department: 'Finance', level: 2 },
            { id: 'fin3', title: 'Contrôleur de Gestion', department: 'Finance', level: 3 },
            { id: 'fin4', title: 'Directeur Financier', department: 'Finance', level: 4 },

            // Sales / Commercial
            { id: 'sales1', title: 'Commercial Junior', department: 'Sales', level: 1 },
            { id: 'sales2', title: 'Commercial Senior', department: 'Sales', level: 2 },
            { id: 'sales3', title: 'Key Account Manager', department: 'Sales', level: 3 },
            { id: 'sales4', title: 'Directeur Commercial', department: 'Sales', level: 4 },

            // HSE (Hygiène, Sécurité, Environnement)
            { id: 'hse1', title: 'Agent HSE', department: 'HSE', level: 1 },
            { id: 'hse2', title: 'Inspecteur HSE', department: 'HSE', level: 2 },
            { id: 'hse3', title: 'Responsable HSE', department: 'HSE', level: 3 },
            { id: 'hse4', title: 'Directeur HSE', department: 'HSE', level: 4 }
        ];

        // Determine starting role
        const startingRoleTitle = startRole || employee.positionTitle;
        const currentRole = allRoles.find(r => r.title.toLowerCase() === startingRoleTitle.toLowerCase()) || 
                            { title: startingRoleTitle, level: 2, department: employee.department || 'Tech' };

        // Filter nodes to keep constellation readable and relevant
        const filteredRoles = allRoles.filter(role => {
            if (role.title === currentRole.title) return true;
            if (role.department === currentRole.department) return true;
            
            // Cross-department opportunities with level difference <= 1
            if (Math.abs(role.level - currentRole.level) <= 1 && (
                (currentRole.department === 'Tech' && role.department === 'Product') ||
                (currentRole.department === 'Product' && role.department === 'Tech') ||
                (currentRole.department === 'Ressources Humaines' && role.department === 'HSE')
            )) {
                return true;
            }
            // Executive roles
            if (role.level === 5) return true;
            return false;
        });

        const nodes = filteredRoles.map(role => ({
            ...role,
            isCurrent: role.title === currentRole.title,
            isPossible: role.level >= currentRole.level && (role.department === currentRole.department || role.level >= 4)
        }));

        const links = [];
        // Connect nodes based on level progression
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes.length; j++) {
                // Progression within same department
                if (nodes[i].level === nodes[j].level - 1 && nodes[i].department === nodes[j].department) {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
                // Bridges from Lead Dev to management or product roles
                if (nodes[i].title === 'Lead Developer' && ['Product Manager', 'Engineering Manager'].includes(nodes[j].title)) {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
                // Transition to CTO
                if (['Architecte Solution', 'Engineering Manager'].includes(nodes[i].title) && nodes[j].title === 'CTO') {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
                // Transition to Chief Product Officer
                if (nodes[i].title === 'Product Manager' && nodes[j].title === 'Chief Product Officer') {
                    links.push({ source: nodes[i].title, target: nodes[j].title });
                }
            }
        }

        res.status(200).json({ 
            nodes, 
            links, 
            currentRole: currentRole.title,
            allRoleTitles: allRoles.map(r => r.title)
        });
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
