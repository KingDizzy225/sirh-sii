const prisma = require('../prismaClient');

// Get all assets
exports.getAllAssets = async (req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                assignments: {
                    include: { employee: true },
                    orderBy: { assignedDate: 'desc' },
                    take: 1
                }
            }
        });

        // Format similarly to frontend mock format
        const formattedAssets = assets.map(asset => {
            const latestAssignment = asset.assignments[0];
            return {
                id: asset.id,
                tag: asset.assetTag,
                category: asset.category,
                name: asset.model,
                status: asset.status,
                assignedTo: latestAssignment && !latestAssignment.returnedDate 
                    ? `${latestAssignment.employee.firstName} ${latestAssignment.employee.lastName}` 
                    : '-',
                department: asset.departmentOwner,
                date: asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : '-',
            };
        });

        res.json(formattedAssets);
    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Create a new asset
exports.createAsset = async (req, res) => {
    try {
        const { category, model, assetTag, departmentOwner } = req.body;

        // `category` et `model` sont obligatoires au schéma. La génération de
        // l'étiquette lisait `category.substring()` avant toute vérification :
        // une requête sans catégorie levait une TypeError et se soldait par un
        // 500 « Erreur serveur », alors que la requête était simplement
        // incomplète.
        const manquants = [];
        if (!category || !String(category).trim()) manquants.push('category');
        if (!model || !String(model).trim()) manquants.push('model');
        if (manquants.length > 0) {
            return res.status(400).json({
                error: `Champ(s) obligatoire(s) manquant(s) : ${manquants.join(', ')}.`
            });
        }

        const categorieNette = String(category).trim();
        const finalTag = (assetTag && String(assetTag).trim())
            || `${categorieNette.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

        const newAsset = await prisma.asset.create({
            data: {
                category: categorieNette,
                model: String(model).trim(),
                assetTag: finalTag,
                departmentOwner: departmentOwner || 'Non Assigné',
                status: 'Disponible',
                purchaseDate: new Date()
            }
        });

        res.status(201).json(newAsset);
    } catch (error) {
        // `assetTag` est unique : un doublon est une erreur de l'appelant, pas
        // une panne du serveur. Prisma la signale par le code P2002.
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: `L'étiquette « ${req.body.assetTag} » est déjà attribuée à un autre actif.`
            });
        }
        console.error("Error creating asset:", error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'actif." });
    }
};
