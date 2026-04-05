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
