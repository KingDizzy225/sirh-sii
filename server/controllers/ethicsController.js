const prisma = require('../prismaClient');
const crypto = require('crypto');

// Public route: No authentication required for submitting a report
exports.submitReport = async (req, res) => {
    try {
        const { category, description } = req.body;
        
        // Generate a random tracking ID for the whistleblower to check status later
        const trackingId = 'WB-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const newReport = await prisma.whistleblowingReport.create({
            data: {
                trackingId,
                category,
                description,
                status: 'Submitted'
            }
        });

        // We return the tracking ID so the user can save it
        res.status(201).json({ trackingId: newReport.trackingId, message: "Signalement reçu." });
    } catch (error) {
        console.error("Error creating ethics report:", error);
        res.status(500).json({ error: "Erreur lors de la soumission" });
    }
};

// Check report status (Public with Tracking ID)
exports.checkStatus = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const report = await prisma.whistleblowingReport.findUnique({
            where: { trackingId },
            select: { trackingId: true, status: true, resolution: true, createdAt: true }
        });

        if (!report) return res.status(404).json({ error: "Signalement introuvable." });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Admin route to get all reports
exports.getReports = async (req, res) => {
    try {
        const reports = await prisma.whistleblowingReport.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Admin route to update report
exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;

        const updated = await prisma.whistleblowingReport.update({
            where: { id },
            data: { status, resolution }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
