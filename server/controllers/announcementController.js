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
        const author = req.user?.name || req.user?.email || 'RH';
        const announcement = await prisma.announcement.create({
            data: { title, body, category: category || 'Info', author, pinned: pinned === true }
        });
        res.status(201).json(announcement);
    } catch (e) {
        res.status(500).json({ error: e.message });
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
