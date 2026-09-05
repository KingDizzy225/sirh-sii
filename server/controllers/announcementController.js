const prisma = require('../prismaClient');

// GET all announcements (everyone)
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
        });
        res.json(announcements);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// POST create (HR/Admin)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, body, category, pinned } = req.body;

        // `title` et `body` sont obligatoires au schéma. Sans ce contrôle, une
        // requête incomplète descendait jusqu'à Prisma, qui la rejetait, et le
        // client recevait un 500 accompagné du message d'erreur interne — une
        // panne serveur annoncée là où le tort était du côté de l'appelant.
        const manquants = [];
        if (!title || !String(title).trim()) manquants.push('title');
        if (!body || !String(body).trim()) manquants.push('body');
        if (manquants.length > 0) {
            return res.status(400).json({
                error: `Champ(s) obligatoire(s) manquant(s) : ${manquants.join(', ')}.`
            });
        }

        const author = req.user?.name || req.user?.email || 'RH';
        const announcement = await prisma.announcement.create({
            data: {
                title: String(title).trim(),
                body: String(body).trim(),
                category: category || 'Info',
                author,
                pinned: pinned === true
            }
        });
        res.status(201).json(announcement);
    } catch (e) {
        console.error('Erreur création annonce :', e);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'annonce." });
    }
};

// PUT update (HR/Admin)
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.announcement.update({ where: { id }, data: req.body });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// DELETE (HR/Admin)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id } });
        res.json({ message: 'Annonce supprimée.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
