const prisma = require('../prismaClient');
const { ROLES, BRIDGES } = require('../data/careerCatalog');

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

        // Determine starting role (référentiel complet : server/data/careerCatalog.js)
        const startingRoleTitle = startRole || employee.positionTitle;
        const currentRole = ROLES.find(r => r.title.toLowerCase() === startingRoleTitle.toLowerCase()) ||
                            { title: startingRoleTitle, level: 2, department: employee.department || 'Tech / IT', skills: [] };

        // Filter nodes to keep the constellation readable:
        // - toute la famille du poste courant
        // - les passerelles directes depuis/vers le poste courant
        // - le sommet de la famille (niveau 5) et les passerelles de 2e niveau vers la Direction
        const bridgeTitles = new Set();
        BRIDGES.forEach(b => {
            if (b.source === currentRole.title) bridgeTitles.add(b.target);
            if (b.target === currentRole.title) bridgeTitles.add(b.source);
        });

        const filteredRoles = ROLES.filter(role => {
            if (role.title === currentRole.title) return true;
            if (role.department === currentRole.department) return true;
            if (bridgeTitles.has(role.title)) return true;
            return false;
        });

        const includedTitles = new Set(filteredRoles.map(r => r.title));

        const nodes = filteredRoles.map(role => ({
            ...role,
            isCurrent: role.title === currentRole.title,
            isPossible: role.level >= currentRole.level &&
                (role.department === currentRole.department || bridgeTitles.has(role.title))
        }));

        // Links : progression verticale au sein d'une famille (vers le niveau supérieur
        // le plus proche réellement présent) + passerelles inter-familles du référentiel
        const links = [];
        const byDept = {};
        nodes.forEach(n => {
            byDept[n.department] = byDept[n.department] || [];
            byDept[n.department].push(n);
        });
        Object.values(byDept).forEach(deptNodes => {
            deptNodes.forEach(node => {
                const higherLevels = deptNodes.filter(n => n.level > node.level).map(n => n.level);
                if (higherLevels.length === 0) return;
                const nextLevel = Math.min(...higherLevels);
                deptNodes
                    .filter(n => n.level === nextLevel)
                    .forEach(target => links.push({ source: node.title, target: target.title }));
            });
        });
        BRIDGES.forEach(b => {
            if (includedTitles.has(b.source) && includedTitles.has(b.target)) {
                links.push({ source: b.source, target: b.target });
            }
        });

        // Catalogue groupé par famille pour le sélecteur du frontend
        const families = [];
        ROLES.forEach(role => {
            let family = families.find(f => f.name === role.department);
            if (!family) {
                family = { name: role.department, roles: [] };
                families.push(family);
            }
            family.roles.push(role.title);
        });

        res.status(200).json({
            nodes,
            links,
            currentRole: currentRole.title,
            allRoleTitles: ROLES.map(r => r.title),
            families
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
