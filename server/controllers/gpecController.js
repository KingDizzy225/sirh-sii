const prisma = require('../prismaClient');

// GET competency map (skills grouped by department)
exports.getCompetencyMap = async (req, res) => {
    try {
        const skills = await prisma.employeeSkill.findMany({
            include: { employee: { select: { department: true } } }
        });
        // Group: dept -> skillName -> average level
        const levelMap = { 'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3, 'Expert': 4 };
        const deptSkillMap = {};
        skills.forEach(s => {
            const dept = s.employee?.department || 'Inconnu';
            if (!deptSkillMap[dept]) deptSkillMap[dept] = {};
            if (!deptSkillMap[dept][s.skillName]) deptSkillMap[dept][s.skillName] = [];
            deptSkillMap[dept][s.skillName].push(levelMap[s.proficiencyLevel] || 1);
        });
        const map = Object.entries(deptSkillMap).map(([dept, skills]) => ({
            dept,
            skills: Object.entries(skills).map(([skill, levels]) => ({
                skill,
                avgLevel: (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1),
                count: levels.length
            }))
        }));
        res.json(map);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/**
 * Rôles cibles déduits des postes réellement occupés.
 *
 * La liste des rôles servant à mesurer un écart était écrite dans l'écran :
 * quatre intitulés, dont aucun n'existait forcément dans l'entreprise. Un
 * responsable comparait donc son collaborateur à un poste imaginaire.
 *
 * Les rôles viennent désormais des postes tenus par les salariés, et le niveau
 * attendu pour chaque compétence est **le plus haut niveau constaté chez les
 * titulaires du poste** : le collègue le plus avancé fixe la barre.
 *
 * **Ce n'est pas un référentiel validé.** C'est une photographie de ce que
 * l'entreprise sait faire aujourd'hui, et elle le dit : chaque rôle porte le
 * nombre de titulaires sur lequel il a été calculé, et un poste tenu par une
 * seule personne se compare à elle-même — l'écart y vaut zéro par
 * construction.
 */
exports.getRolesCibles = async (req, res) => {
    try {
        const NIVEAUX = { 'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3, 'Expert': 4 };

        const competences = await prisma.employeeSkill.findMany({
            include: {
                employee: { select: { id: true, positionTitle: true, department: true, status: true } }
            }
        });

        const parPoste = new Map();
        for (const c of competences) {
            const salarie = c.employee;
            const poste = (salarie?.positionTitle || '').trim();
            if (!poste || salarie.status === 'TERMINATED') continue;

            if (!parPoste.has(poste)) {
                parPoste.set(poste, { titulaires: new Set(), departements: new Set(), exigences: new Map() });
            }
            const entree = parPoste.get(poste);
            entree.titulaires.add(salarie.id);
            if (salarie.department) entree.departements.add(salarie.department);

            const niveau = NIVEAUX[c.proficiencyLevel] || 1;
            const connu = entree.exigences.get(c.skillName);
            entree.exigences.set(c.skillName, {
                niveau: Math.max(connu?.niveau || 0, niveau),
                observations: (connu?.observations || 0) + 1
            });
        }

        const roles = [...parPoste.entries()]
            .map(([title, e]) => ({
                title,
                titulaires: e.titulaires.size,
                departements: [...e.departements],
                requirements: Object.fromEntries(
                    [...e.exigences.entries()].map(([nom, v]) => [nom, v.niveau])
                ),
                observations: Object.fromEntries(
                    [...e.exigences.entries()].map(([nom, v]) => [nom, v.observations])
                ),
                // Un poste tenu par une seule personne ne mesure rien : la barre
                // est son propre niveau. Signalé plutôt que masqué.
                comparable: e.titulaires.size > 1
            }))
            .filter((r) => Object.keys(r.requirements).length > 0)
            .sort((a, b) => b.titulaires - a.titulaires || a.title.localeCompare(b.title, 'fr'));

        res.json({
            methode: "Niveau attendu = plus haut niveau constaté chez les titulaires du poste. "
                + "Photographie des compétences enregistrées, non référentiel validé.",
            postesRetenus: roles.length,
            roles
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// GET gaps (critical skills with few experts)
exports.getSkillGaps = async (req, res) => {
    try {
        const criticalDefs = await prisma.skillDefinition.findMany({
            where: { criticality: 'Critique' }
        });
        const gaps = [];
        for (const def of criticalDefs) {
            const experts = await prisma.employeeSkill.count({
                where: { skillName: def.name, proficiencyLevel: { in: ['Avancé', 'Expert'] } }
            });
            if (experts < 3) {
                gaps.push({ skill: def.name, category: def.category, experts, criticality: def.criticality });
            }
        }
        res.json(gaps);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// GET skill definitions (referentiel)
exports.getSkillDefinitions = async (req, res) => {
    try {
        const defs = await prisma.skillDefinition.findMany({ orderBy: { category: 'asc' } });
        res.json(defs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST create skill definition
exports.createSkillDefinition = async (req, res) => {
    try {
        const { name, category, description, criticality } = req.body;
        const def = await prisma.skillDefinition.create({ data: { name, category, description, criticality: criticality || 'Normal' } });
        res.status(201).json(def);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// DELETE skill definition
exports.deleteSkillDefinition = async (req, res) => {
    try {
        await prisma.skillDefinition.delete({ where: { id: req.params.id } });
        res.json({ message: 'Compétence supprimée du référentiel.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST assign skill to employee
exports.assignSkillToEmployee = async (req, res) => {
    try {
        const { employeeId, skillName, proficiencyLevel } = req.body;

        // Check if employee already has this skill
        const existingSkill = await prisma.employeeSkill.findFirst({
            where: { employeeId, skillName }
        });

        if (existingSkill) {
            // Update proficiency
            const updated = await prisma.employeeSkill.update({
                where: { id: existingSkill.id },
                data: { proficiencyLevel }
            });
            return res.json(updated);
        }

        // Otherwise create new assignment
        const newSkill = await prisma.employeeSkill.create({
            data: {
                employeeId,
                skillName,
                proficiencyLevel
            }
        });

        res.status(201).json(newSkill);
    } catch (error) {
        console.error("Assign Skill Error:", error);
        res.status(500).json({ error: "Erreur lors de l'assignation de la compétence." });
    }
};
