const prisma = require('../prismaClient');

// 1. Fetch ALL employees with their talent profiles
exports.getTalentProfiles = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                positionTitle: true,
                department: true,
                talentProfile: true
            }
        });

        // Map data to ensure every employee has a default talent structure if it's missing in DB
        const mapped = employees.map(emp => {
            const tp = emp.talentProfile || {
                potential: 'Medium',
                performance: 'Medium',
                flightRisk: 'Low',
                readiness: '1-2 years',
                lastAssessment: new Date()
            };

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                position: emp.positionTitle,
                department: emp.department,
                potential: tp.potential,
                performance: tp.performance,
                flightRisk: tp.flightRisk,
                readiness: tp.readiness,
                lastAssessment: tp.lastAssessment
            };
        });

        res.status(200).json(mapped);
    } catch (error) {
        console.error("Erreur Fetch Talent Profiles:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des talents." });
    }
};

// 2. Update (Upsert) Talent Profile for an employee
exports.updateTalentProfile = async (req, res) => {
    try {
        const { id } = req.params; // employeeId
        const { potential, performance, flightRisk, readiness } = req.body;

        const updatedProfile = await prisma.talentProfile.upsert({
            where: { employeeId: id },
            update: {
                potential,
                performance,
                flightRisk,
                readiness,
                lastAssessment: new Date()
            },
            create: {
                employeeId: id,
                potential: potential || 'Medium',
                performance: performance || 'Medium',
                flightRisk: flightRisk || 'Low',
                readiness: readiness || '1-2 years'
            }
        });

        res.status(200).json({ message: "Profil talent mis à jour avec succès", profile: updatedProfile });
    } catch (error) {
        console.error("Erreur Update Talent Profile:", error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
    }
};
