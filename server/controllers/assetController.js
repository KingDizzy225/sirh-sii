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
        
        let finalTag = assetTag;
        if (!finalTag) {
            finalTag = `${category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
        }

        const newAsset = await prisma.asset.create({
            data: {
                category,
                model,
                assetTag: finalTag,
                departmentOwner: departmentOwner || 'Non Assigné',
                status: 'Disponible',
                purchaseDate: new Date()
            }
        });

        res.status(201).json(newAsset);
    } catch (error) {
        console.error("Error creating asset:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
