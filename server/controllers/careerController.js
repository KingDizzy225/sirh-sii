const prisma = require('../prismaClient');
const { ROLES, BRIDGES } = require('../data/careerCatalog');
const { ecartCompetences } = require('../lib/skillMatch');

// Construit la constellation (nœuds + liens) autour d'un poste de départ.
// Partagé par le parcours personnalisé et le catalogue public.
// `employeeSkills` — compétences déclarées du salarié : fournies pour le
// parcours personnalisé, absentes pour le catalogue public consulté hors session.
const buildConstellation = (startingRoleTitle, fallbackDepartment = 'Tech / IT', employeeSkills = null) => {
        const currentRole = ROLES.find(r => r.title.toLowerCase() === String(startingRoleTitle).toLowerCase()) ||
                            { title: startingRoleTitle, level: 2, department: fallbackDepartment, skills: [] };

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

        const nodes = filteredRoles.map(role => {
            const node = {
                ...role,
                isCurrent: role.title === currentRole.title,
                isPossible: role.level >= currentRole.level &&
                    (role.department === currentRole.department || bridgeTitles.has(role.title))
            };

            // Écart de compétences : ce qui sépare réellement le salarié du poste.
            // C'est ce rapprochement qui transforme le référentiel en outil de
            // décision plutôt qu'en simple carte des métiers.
            if (employeeSkills) {
                node.ecart = ecartCompetences(role.skills, employeeSkills);
            }
            return node;
        });

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

        return {
            nodes,
            links,
            currentRole: currentRole.title,
            allRoleTitles: ROLES.map(r => r.title),
            families
        };
};

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

        const startingRoleTitle = startRole || employee.positionTitle;
        res.status(200).json(
            buildConstellation(
                startingRoleTitle,
                employee.department || 'Tech / IT',
                employee.skills || []
            )
        );
    } catch (error) {
        console.error("Error fetching career path:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du plan de carrière" });
    }
};

// Catalogue métiers public : référentiel générique, sans donnée personnelle.
// Permet à l'explorateur de fonctionner hors session (démo, mode déconnecté).
exports.getCatalog = async (req, res) => {
    try {
        const startingRoleTitle = req.query.startRole || ROLES[0].title;
        res.status(200).json(buildConstellation(startingRoleTitle));
    } catch (error) {
        console.error("Error fetching career catalog:", error);
        res.status(500).json({ error: "Erreur lors de la récupération du référentiel métiers" });
    }
};

/**
 * Ajout d'un événement au parcours d'un salarié (promotion, changement de
 * poste, évolution salariale…). La fiche employé proposait déjà ce formulaire,
 * mais aucune route ne le recevait : l'enregistrement échouait en silence.
 */
exports.addCareerEvent = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { eventDate, type, previousValue, newValue, comment } = req.body;

        if (!type || !newValue) {
            return res.status(400).json({ error: "Le type d'événement et la nouvelle valeur sont requis." });
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employé introuvable.' });

        const event = await prisma.careerHistory.create({
            data: {
                employeeId,
                eventDate: eventDate ? new Date(eventDate) : new Date(),
                type,
                previousValue: previousValue || null,
                newValue,
                comment: comment || null
            }
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Error adding career event:', error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'événement de carrière." });
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
