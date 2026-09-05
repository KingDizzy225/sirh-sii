/**
 * Modèles de parcours d'intégration et de départ.
 *
 * Le constructeur de workflows proposait de composer ces parcours, mais tenait
 * ses modèles dans un tableau écrit en dur : rien de ce qu'on y ajoutait n'était
 * enregistré. Les parcours réellement appliqués, eux, vivaient dans
 * `data/onboardingTemplates.js`, donc hors de portée de la RH.
 *
 * Ces deux mondes sont réunis : ce qui est enregistré ici pilote la création des
 * tâches à l'embauche. Tant qu'aucun modèle actif n'existe, l'application
 * retombe sur le fichier de code — le comportement ne change pas tant que
 * personne n'a personnalisé quoi que ce soit.
 */

const prisma = require('../prismaClient');
const { SOCLE, PAR_FAMILLE } = require('../data/onboardingTemplates');

const TYPES = ['ONBOARDING', 'OFFBOARDING'];

const presenter = (t) => ({
    id: t.id,
    nom: t.name,
    type: t.type,
    famille: t.family,
    description: t.description,
    actif: t.active,
    creeLe: t.createdAt,
    taches: (t.items || [])
        .slice()
        .sort((a, b) => a.position - b.position || a.relativeDays - b.relativeDays)
        .map(i => ({
            id: i.id,
            titre: i.title,
            equipe: i.assignedTo,
            jours: i.relativeDays,
            description: i.description,
            position: i.position
        }))
});

/** GET /api/task-templates */
exports.getTemplates = async (req, res) => {
    try {
        const modeles = await prisma.taskTemplate.findMany({
            include: { items: true },
            orderBy: [{ type: 'asc' }, { createdAt: 'asc' }]
        });

        // Le socle du fichier de code est renvoyé à titre de référence : il
        // reste ce qui s'applique tant qu'aucun modèle d'intégration n'est
        // actif, et sert de point de départ à la personnalisation.
        const socleCode = {
            socle: SOCLE.map(t => ({ titre: t.taskName, equipe: t.assignedTo, jours: t.jours })),
            familles: Object.keys(PAR_FAMILLE)
        };

        const integrationActive = modeles.some(m => m.type === 'ONBOARDING' && m.active);

        res.json({
            modeles: modeles.map(presenter),
            referenceCode: socleCode,
            // Dit explicitement lequel des deux mondes s'applique en ce moment.
            sourceAppliquee: integrationActive ? 'MODELES_ENREGISTRES' : 'FICHIER_DE_CODE'
        });
    } catch (error) {
        console.error('Erreur modèles de parcours :', error);
        res.status(500).json({ error: 'Erreur lors du chargement des modèles.' });
    }
};

/** POST /api/task-templates */
exports.createTemplate = async (req, res) => {
    try {
        const { nom, type, famille, description, taches } = req.body;

        if (!nom || !String(nom).trim()) {
            return res.status(400).json({ error: 'Le nom du modèle est obligatoire.' });
        }
        if (!TYPES.includes(type)) {
            return res.status(400).json({ error: `Type « ${type} » inconnu. Valeurs : ${TYPES.join(', ')}.` });
        }

        const lignes = Array.isArray(taches) ? taches : [];
        for (const [i, t] of lignes.entries()) {
            if (!t.titre || !String(t.titre).trim()) {
                return res.status(400).json({ error: `Tâche ${i + 1} : le libellé est obligatoire.` });
            }
            if (!t.equipe || !String(t.equipe).trim()) {
                return res.status(400).json({ error: `Tâche ${i + 1} : l'équipe responsable est obligatoire.` });
            }
        }

        const modele = await prisma.taskTemplate.create({
            data: {
                name: String(nom).trim(),
                type,
                family: famille ? String(famille).trim() : null,
                description: description ? String(description).trim() : null,
                createdBy: req.user?.name || req.user?.email || null,
                items: {
                    create: lignes.map((t, i) => ({
                        title: String(t.titre).trim(),
                        assignedTo: String(t.equipe).trim(),
                        relativeDays: parseInt(t.jours, 10) || 0,
                        description: t.description ? String(t.description).trim() : null,
                        position: i
                    }))
                }
            },
            include: { items: true }
        });

        res.status(201).json(presenter(modele));
    } catch (error) {
        console.error('Erreur création de modèle :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du modèle." });
    }
};

/** PUT /api/task-templates/:id — le contenu du modèle est remplacé en bloc. */
exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, famille, description, actif, taches } = req.body;

        const existant = await prisma.taskTemplate.findUnique({ where: { id } });
        if (!existant) return res.status(404).json({ error: 'Modèle introuvable.' });

        if (nom !== undefined && !String(nom).trim()) {
            return res.status(400).json({ error: 'Le nom du modèle ne peut pas être vide.' });
        }

        const data = {};
        if (nom !== undefined) data.name = String(nom).trim();
        if (famille !== undefined) data.family = famille ? String(famille).trim() : null;
        if (description !== undefined) data.description = description ? String(description).trim() : null;
        if (actif !== undefined) data.active = actif === true;

        // Remplacement en bloc plutôt que réconciliation ligne à ligne : l'ordre
        // et le contenu des tâches sont réécrits ensemble, ce qui évite les états
        // intermédiaires où le parcours enregistré ne correspondrait ni à
        // l'ancien ni au nouveau.
        const misAJour = await prisma.$transaction(async (tx) => {
            if (Array.isArray(taches)) {
                for (const [i, t] of taches.entries()) {
                    if (!t.titre || !String(t.titre).trim()) {
                        throw Object.assign(new Error(`Tâche ${i + 1} : le libellé est obligatoire.`), { statut: 400 });
                    }
                    if (!t.equipe || !String(t.equipe).trim()) {
                        throw Object.assign(new Error(`Tâche ${i + 1} : l'équipe responsable est obligatoire.`), { statut: 400 });
                    }
                }
                await tx.taskTemplateItem.deleteMany({ where: { templateId: id } });
                if (taches.length > 0) {
                    await tx.taskTemplateItem.createMany({
                        data: taches.map((t, i) => ({
                            templateId: id,
                            title: String(t.titre).trim(),
                            assignedTo: String(t.equipe).trim(),
                            relativeDays: parseInt(t.jours, 10) || 0,
                            description: t.description ? String(t.description).trim() : null,
                            position: i
                        }))
                    });
                }
            }
            await tx.taskTemplate.update({ where: { id }, data });
            return tx.taskTemplate.findUnique({ where: { id }, include: { items: true } });
        });

        res.json(presenter(misAJour));
    } catch (error) {
        if (error.statut === 400) return res.status(400).json({ error: error.message });
        console.error('Erreur mise à jour de modèle :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du modèle.' });
    }
};

/** DELETE /api/task-templates/:id */
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const existant = await prisma.taskTemplate.findUnique({ where: { id } });
        if (!existant) return res.status(404).json({ error: 'Modèle introuvable.' });
        await prisma.taskTemplate.delete({ where: { id } });
        res.json({ message: 'Modèle supprimé.' });
    } catch (error) {
        console.error('Erreur suppression de modèle :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du modèle.' });
    }
};

/**
 * POST /api/task-templates/importer-socle
 * Crée un modèle enregistré à partir du socle codé, comme point de départ.
 */
exports.importerSocle = async (req, res) => {
    try {
        const famille = req.body?.famille || null;
        const complements = famille ? (PAR_FAMILLE[famille] || []) : [];
        const lignes = [...SOCLE, ...complements];

        const modele = await prisma.taskTemplate.create({
            data: {
                name: famille ? `Intégration — ${famille}` : 'Intégration standard',
                type: 'ONBOARDING',
                family: famille,
                description: 'Repris du socle livré avec l\'application, librement modifiable.',
                // Importé inactif : activer un modèle change ce qui sera créé à
                // la prochaine embauche, cela doit rester une décision explicite.
                active: false,
                createdBy: req.user?.name || req.user?.email || null,
                items: {
                    create: lignes.map((t, i) => ({
                        title: t.taskName,
                        assignedTo: t.assignedTo,
                        relativeDays: t.jours,
                        position: i
                    }))
                }
            },
            include: { items: true }
        });

        res.status(201).json(presenter(modele));
    } catch (error) {
        console.error('Erreur import du socle :', error);
        res.status(500).json({ error: "Erreur lors de l'import du socle." });
    }
};
