const prisma = require('../prismaClient');

// Get all contract templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await prisma.contractTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    } catch (error) {
        console.error("Error fetching contract templates:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des modèles de contrats." });
    }
};

// Create a new contract template
exports.createTemplate = async (req, res) => {
    try {
        const { title, contractType, clauses, isDefault } = req.body;
        const userEmail = req.user.email;

        const template = await prisma.contractTemplate.create({
            data: {
                title,
                contractType: contractType || 'CDI',
                clauses: typeof clauses === 'string' ? clauses : JSON.stringify(clauses),
                isDefault: isDefault || false,
                createdBy: userEmail
            }
        });
        res.status(201).json(template);
    } catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ error: "Erreur lors de la création du modèle de contrat." });
    }
};

// Generate custom contract document
exports.generateContract = async (req, res) => {
    try {
        const { employeeId, templateId, customVariables } = req.body;

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employé introuvable." });
        }

        let templateContent = "";
        if (templateId) {
            const tpl = await prisma.contractTemplate.findUnique({ where: { id: templateId } });
            if (tpl) templateContent = tpl.clauses;
        }

        // Default clause template if none provided
        if (!templateContent) {
            templateContent = `
CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE (CDI)

Entre la société SII Côte d'Ivoire et M./Mme {{FULL_NAME}}, né(e) le {{BIRTH_DATE}} à {{NATIONALITY}}.

ARTICLE 1 : ENGAGEMENT ET FONCTIONS
M./Mme {{FULL_NAME}} est engagé(e) à compter du {{HIRE_DATE}} au poste de {{POSITION_TITLE}} au sein du département {{DEPARTMENT}}.

ARTICLE 2 : RÉNUNÉRATION
En contrepartie de ses fonctions, le collaborateur percevra un salaire mensuel brut de {{BASE_SALARY}} FCFA.

ARTICLE 3 : PÉRIODE D'ESSAI
Le présent contrat est conclu avec une période d'essai de 3 mois renouvelable.

Fait à Abidjan, le {{TODAY_DATE}}.
            `;
        }

        // Variable interpolation
        let generatedText = templateContent
            .replace(/{{FULL_NAME}}/g, `${employee.firstName} ${employee.lastName}`)
            .replace(/{{FIRST_NAME}}/g, employee.firstName)
            .replace(/{{LAST_NAME}}/g, employee.lastName)
            .replace(/{{POSITION_TITLE}}/g, employee.positionTitle || 'Collaborateur')
            .replace(/{{DEPARTMENT}}/g, employee.department || 'Général')
            .replace(/{{NATIONALITY}}/g, employee.nationality || 'Ivoirienne')
            .replace(/{{HIRE_DATE}}/g, employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'Immédiat')
            .replace(/{{TODAY_DATE}}/g, new Date().toLocaleDateString('fr-FR'))
            .replace(/{{BASE_SALARY}}/g, customVariables?.baseSalary || '650 000');

        res.json({
            employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            generatedText,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error generating contract:", error);
        res.status(500).json({ error: "Erreur de génération du contrat." });
    }
};
