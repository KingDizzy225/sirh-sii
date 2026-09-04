const prisma = require('../prismaClient');

const isPrivileged = (role) =>
    ['ADMIN', 'HR', 'Administrator', 'MANAGER', 'Manager'].includes(role);

// Liste des sites de pointage
exports.getWorkSites = async (req, res) => {
    try {
        const sites = await prisma.workSite.findMany({ orderBy: { createdAt: 'asc' } });
        res.status(200).json(sites);
    } catch (error) {
        console.error("Error fetching work sites:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Création d'un site de pointage
exports.createWorkSite = async (req, res) => {
    try {
        if (!isPrivileged(req.user.role)) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const { name, latitude, longitude, radiusMeters } = req.body;
        if (!name || typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ error: "Nom, latitude et longitude sont requis" });
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: "Coordonnées GPS invalides" });
        }
        const site = await prisma.workSite.create({
            data: {
                name,
                latitude,
                longitude,
                radiusMeters: Number.isInteger(radiusMeters) && radiusMeters > 0 ? radiusMeters : 200
            }
        });
        res.status(201).json(site);
    } catch (error) {
        console.error("Error creating work site:", error);
        res.status(500).json({ error: "Erreur lors de la création du site" });
    }
};

// Mise à jour d'un site (nom, coordonnées, rayon, activation)
exports.updateWorkSite = async (req, res) => {
    try {
        if (!isPrivileged(req.user.role)) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const { id } = req.params;
        const { name, latitude, longitude, radiusMeters, isActive } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (typeof latitude === 'number') data.latitude = latitude;
        if (typeof longitude === 'number') data.longitude = longitude;
        if (Number.isInteger(radiusMeters) && radiusMeters > 0) data.radiusMeters = radiusMeters;
        if (typeof isActive === 'boolean') data.isActive = isActive;

        const site = await prisma.workSite.update({ where: { id }, data });
        res.status(200).json(site);
    } catch (error) {
        console.error("Error updating work site:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du site" });
    }
};

// Suppression d'un site (les pointages liés sont conservés, workSiteId passe à null)
exports.deleteWorkSite = async (req, res) => {
    try {
        if (!isPrivileged(req.user.role)) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const { id } = req.params;
        await prisma.workSite.delete({ where: { id } });
        res.status(200).json({ message: "Site supprimé" });
    } catch (error) {
        console.error("Error deleting work site:", error);
        res.status(500).json({ error: "Erreur lors de la suppression du site" });
    }
};
