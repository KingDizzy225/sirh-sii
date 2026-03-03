const prisma = require('../prismaClient');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        // 1. Total Employés & Effectifs Actifs
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' }
        });
        const terminatedEmployees = await prisma.employee.count({
            where: { status: 'TERMINATED' }
        });

        // Turnover Global Formule simplifiée : (Départs / Effectif Total) * 100
        const globalTurnover = totalEmployees > 0 ? ((terminatedEmployees / totalEmployees) * 100).toFixed(1) : 0;

        // 2. Turnover par Département
        const departments = ['Ingénierie', 'Ventes', 'Marketing', 'Ressources Humaines', 'Finance', 'Direction'];
        const turnoverByDept = [];

        for (const dept of departments) {
            const totalInDept = await prisma.employee.count({ where: { department: dept } });
            const termInDept = await prisma.employee.count({ where: { department: dept, status: 'TERMINATED' } });
            const rate = totalInDept > 0 ? ((termInDept / totalInDept) * 100).toFixed(1) : 0;
            if (totalInDept > 0) {
                turnoverByDept.push({ name: dept, rate: parseFloat(rate) });
            }
        }

        // Si la DB est vide ou très peu remplie, on injecte des données mockées de secours pour la démo
        if (turnoverByDept.length === 0) {
            turnoverByDept.push(
                { name: 'Ingénierie', rate: 4.2 },
                { name: 'Ventes', rate: 12.5 },
                { name: 'Ressources Humaines', rate: 3.2 }
            );
        }

        // 3. Absentéisme (Approximation basée sur les congés Maladie/Sans Solde récents)
        // Pour l'exemple, calcul simple
        const recentLeaves = await prisma.leave.count({
            where: {
                status: 'Approved',
                type: { in: ['Sick', 'Unpaid'] }
            }
        });
        const absenceRate = totalEmployees > 0 ? ((recentLeaves / (totalEmployees * 20)) * 100).toFixed(1) : 2.8;

        // 4. Mock Data for missing DB fields (Gender, Age, Applicant Time-to-hire)
        const timeToHireData = [
            { month: 'Mai', days: 45 },
            { month: 'Juin', days: 42 },
            { month: 'Juil', days: 38 },
            { month: 'Août', days: 35 },
            { month: 'Sept', days: 31 },
            { month: 'Oct', days: 28 },
        ];

        const genderPayGapData = [
            { department: 'Ingénierie', male: 95, female: 92 },
            { department: 'Ventes', male: 78, female: 75 },
            { department: 'Ressources Humaines', male: 65, female: 65 },
            { department: 'Finance', male: 85, female: 81 },
        ];

        const monthlyTurnover = [
            { name: 'Janv', rate: 2.1 },
            { name: 'Févr', rate: 1.8 },
            { name: 'Mars', rate: 1.5 },
            { name: 'Avr', rate: 2.5 },
            { name: 'Mai', rate: 1.2 },
            { name: 'Juin', rate: parseFloat(globalTurnover) || 0.8 },
        ];

        const agePyramidData = [
            { ageGroup: '18-25', male: 12, female: 15 },
            { ageGroup: '26-35', male: 45, female: 38 },
            { ageGroup: '36-45', male: 30, female: 28 },
            { ageGroup: '46-55', male: 18, female: 14 },
            { ageGroup: '56+', male: 8, female: 5 },
        ];

        const mobilityVsHiringData = [
            { name: 'Promotions Internes', value: 35, color: '#8b5cf6' },
            { name: 'Recrutements Externes', value: 65, color: '#3b82f6' },
        ];

        res.status(200).json({
            stats: {
                totalEmployees,
                activeEmployees,
                globalTurnover: parseFloat(globalTurnover) || 6.4,
                absenceRate: parseFloat(absenceRate) || 2.8,
                avgTimeToHire: 28,
                payGap: 3.2,
                turnoverCost: 85 // kFCFA Millions for example
            },
            charts: {
                turnoverByDept,
                timeToHireData,
                genderPayGapData,
                monthlyTurnover,
                agePyramidData,
                mobilityVsHiringData
            }
        });

    } catch (error) {
        console.error("Erreur Analytics:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques (Analytics)' });
    }
};
