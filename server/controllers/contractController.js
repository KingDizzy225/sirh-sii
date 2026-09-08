const crypto = require('crypto');
const apposition = require('../lib/apposition');
const contratPdf = require('../lib/contratPdf');
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

/**
 * Contrat de travail en PDF, signé et scellé.
 *
 * Le studio composait le contrat dans le navigateur et l'exportait par la boîte
 * d'impression du système : il fallait imprimer, faire signer, rescanner. Le
 * contrat est désormais rendu par le serveur, avec la signature du signataire
 * habilité et un sceau que le salarié — ou une banque à qui il le présentera —
 * peut vérifier.
 *
 * Le texte est produit à partir des paramètres, non reçu du navigateur : un
 * contrat dont le contenu serait dicté par le client ne serait pas
 * reproductible, et rien ne garantirait que le PDF signé dise ce que l'écran
 * affichait.
 */
exports.telechargerPdf = async (req, res) => {
    try {
        const {
            employeeId, contractType, baseSalary, probationMonths,
            includeNonCompete, includeRemoteClause, signataireId
        } = req.body;

        const employe = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employe) return res.status(404).json({ error: 'Employé introuvable.' });

        const type = ['CDI', 'CDD', 'Stage'].includes(contractType) ? contractType : 'CDI';
        const salaire = String(baseSalary || '').trim();
        if (!salaire) return res.status(400).json({ error: 'La rémunération est requise.' });

        const essai = parseInt(probationMonths, 10);
        if (!Number.isFinite(essai) || essai < 0 || essai > 12) {
            return res.status(400).json({ error: "La période d'essai doit être exprimée en mois (0 à 12)." });
        }

        // Inscription au registre : c'est ce jeton que le QR encode, et c'est
        // lui qui permettra à un tiers de vérifier le contrat.
        const registre = await prisma.issuedDocument.create({
            data: {
                token: crypto.randomBytes(24).toString('hex'),
                type: 'CONTRAT_TRAVAIL',
                employeeId: employe.id,
                issuedByEmail: (req.user && req.user.email) || null,
                employeeName: `${employe.firstName} ${employe.lastName}`,
                positionTitle: employe.positionTitle || null,
                department: employe.department || null,
                hireDate: employe.hireDate || null
            }
        });

        const signataire = await apposition.choisirSignataire(signataireId);

        const doc = contratPdf.nouveauContrat({
            employe,
            contractType: type,
            baseSalary: salaire,
            probationMonths: essai,
            nonConcurrence: Boolean(includeNonCompete),
            teletravail: Boolean(includeRemoteClause),
            reference: registre.token.slice(0, 12).toUpperCase()
        });

        // Emplacement de la signature du collaborateur : le contrat se signe des
        // deux côtés, et l'employeur ne peut pas signer pour lui.
        const ySalarie = Math.min(doc.y, 600);
        doc.fontSize(9).fillColor('#0f172a')
           .text('Le collaborateur, lu et approuvé', 330, ySalarie, { width: 215 });
        doc.moveTo(330, ySalarie + 60).lineTo(520, ySalarie + 60).strokeColor('#cbd5e1').stroke();
        doc.y = ySalarie;

        await apposition.apposer(doc, {
            signataire,
            registre,
            employe,
            typeDocument: `Contrat de travail (${type})`
        });

        const nom = `contrat_${type}_${employe.lastName}_${registre.token.slice(0, 8)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nom}`);
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Erreur génération du contrat PDF :', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du contrat.' });
        }
    }
};
