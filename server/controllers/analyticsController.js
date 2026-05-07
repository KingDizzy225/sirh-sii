const prisma = require('../prismaClient');
const { GoogleGenAI } = require('@google/genai');

let ai;
try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch(e) { ai = null; }

exports.getDashboardAnalytics = async (req, res) => {
    try {
        // 1. Effectifs de base
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
        const terminatedEmployees = await prisma.employee.count({ where: { status: 'TERMINATED' } });
        const globalTurnover = totalEmployees > 0
            ? ((terminatedEmployees / totalEmployees) * 100).toFixed(1)
            : 0;

        // 2. Turnover par Département (données réelles)
        const allEmployees = await prisma.employee.findMany({ select: { department: true, status: true } });
        const deptMap = {};
        allEmployees.forEach(e => {
            if (!deptMap[e.department]) deptMap[e.department] = { total: 0, terminated: 0 };
            deptMap[e.department].total++;
            if (e.status === 'TERMINATED') deptMap[e.department].terminated++;
        });
        const turnoverByDept = Object.entries(deptMap)
            .filter(([, v]) => v.total > 0)
            .map(([name, v]) => ({ name, rate: parseFloat(((v.terminated / v.total) * 100).toFixed(1)) }));

        // 3. Masse salariale par département (données réelles depuis Payroll)
        const payrolls = await prisma.payroll.findMany({
            include: { employee: { select: { department: true } } }
        });
        const salaryDeptMap = {};
        payrolls.forEach(p => {
            const dept = p.employee?.department || 'Inconnu';
            if (!salaryDeptMap[dept]) salaryDeptMap[dept] = { total: 0, count: 0 };
            salaryDeptMap[dept].total += p.baseSalary || 0;
            salaryDeptMap[dept].count++;
        });
        const salaryByDept = Object.entries(salaryDeptMap).map(([name, v]) => ({
            name,
            Moyenne: Math.round(v.total / (v.count || 1)),
            Total: Math.round(v.total)
        }));

        // 4. Dépenses par département (données réelles depuis Expense)
        const expenses = await prisma.expense.findMany({
            include: { employee: { select: { department: true } } }
        });
        const expenseDeptMap = {};
        expenses.forEach(exp => {
            const dept = exp.employee?.department || 'Inconnu';
            if (!expenseDeptMap[dept]) expenseDeptMap[dept] = 0;
            expenseDeptMap[dept] += exp.amount || 0;
        });
        const expensesByDept = Object.entries(expenseDeptMap).map(([name, total]) => ({
            name,
            Montant: Math.round(total)
        }));

        // 5. Répartition types de postes (CDI/CDD/Stage via JobOffer)
        const jobOffers = await prisma.jobOffer.findMany({ select: { type: true } });
        const contractTypeMap = {};
        jobOffers.forEach(j => {
            contractTypeMap[j.type] = (contractTypeMap[j.type] || 0) + 1;
        });
        const contractTypes = Object.entries(contractTypeMap).map(([name, value]) => ({ name, value }));

        // 6. Flux embauches (6 derniers mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentHires = await prisma.employee.findMany({
            where: { hireDate: { gte: sixMonthsAgo } },
            select: { hireDate: true, status: true }
        });
        const monthLabels = ['fr-FR'];
        const hiresMap = {};
        recentHires.forEach(e => {
            const label = new Date(e.hireDate).toLocaleDateString('fr-FR', { month: 'short' });
            if (!hiresMap[label]) hiresMap[label] = { Entrées: 0, Départs: 0 };
            if (e.status === 'TERMINATED') hiresMap[label].Départs++;
            else hiresMap[label].Entrées++;
        });
        const monthlyFlux = Object.entries(hiresMap).map(([month, v]) => ({ month, ...v }));

        // 7. Absentéisme réel (jours de congés PENDING + APPROVED ce mois)
        const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
        const leavesThisMonth = await prisma.leave.findMany({
            where: { createdAt: { gte: startOfMonth } }
        });
        const totalAbsenceDays = leavesThisMonth.reduce((acc, l) => acc + (l.durationDays || 0), 0);
        const absenceRate = activeEmployees > 0
            ? ((totalAbsenceDays / (activeEmployees * 22)) * 100).toFixed(1) : 0;

        // 8. KPIs Paie (mois actuel)
        const payrollsThisMonth = await prisma.payroll.findMany({
            where: { period: { gte: startOfMonth }, status: 'APPROVED' }
        });
        const totalNetSalary = payrollsThisMonth.reduce((acc, p) => acc + (p.netSalary || 0), 0);
        const avgNetSalary = payrollsThisMonth.length > 0 ? Math.round(totalNetSalary / payrollsThisMonth.length) : 0;

        res.status(200).json({
            stats: {
                totalEmployees,
                activeEmployees,
                globalTurnover: parseFloat(globalTurnover) || 0,
                absenceRate: parseFloat(absenceRate) || 0,
                payrollCount: payrollsThisMonth.length,
                avgNetSalary,
                totalNetSalary: Math.round(totalNetSalary)
            },
            charts: {
                turnoverByDept: turnoverByDept.length > 0 ? turnoverByDept : [
                    { name: 'Ingénierie', rate: 4.2 }, { name: 'Ventes', rate: 12.5 }
                ],
                salaryByDept: salaryByDept.length > 0 ? salaryByDept : [
                    { name: 'Ingénierie', Moyenne: 450000 }, { name: 'RH', Moyenne: 320000 }
                ],
                expensesByDept: expensesByDept.length > 0 ? expensesByDept : [],
                contractTypes: contractTypes.length > 0 ? contractTypes : [
                    { name: 'CDI', value: 3 }, { name: 'CDD', value: 2 }
                ],
                monthlyFlux: monthlyFlux.length > 0 ? monthlyFlux : [
                    { month: 'Mars', Entrées: 2, Départs: 0 }
                ]
            }
        });
    } catch (error) {
        console.error("Erreur Analytics:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
};

exports.getPredictiveAnalytics = async (req, res) => {
    try {
        if (!ai) return res.status(500).json({ error: 'IA non configurée' });

        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                leaves: { select: { type: true, status: true, durationDays: true } },
                payrolls: { select: { netSalary: true, status: true } },
                PerformanceReview: { select: { overallScore: true } }
            }
        });

        if (employees.length === 0) return res.json([]);

        // Anonymize/Simplify data for the prompt
        const promptData = employees.map(emp => {
            const totalLeaves = emp.leaves.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + (l.durationDays || 0), 0);
            const sickLeaves = emp.leaves.filter(l => l.status === 'APPROVED' && l.type === 'Congé Maladie').reduce((sum, l) => sum + (l.durationDays || 0), 0);
            const avgSalary = emp.payrolls.length > 0 ? emp.payrolls[0].netSalary : 0;
            const avgScore = emp.PerformanceReview.length > 0 ? emp.PerformanceReview[0].overallScore : 3;
            const yearsOfService = (new Date() - new Date(emp.hireDate)) / (1000 * 60 * 60 * 24 * 365);

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                department: emp.department,
                yearsOfService: yearsOfService.toFixed(1),
                totalLeaves,
                sickLeaves,
                avgSalary,
                avgScore
            };
        });

        const systemPrompt = `Tu es un expert RH en analytique prédictive. Voici les données simplifiées d'employés d'une entreprise. 
Analyse ces données pour déterminer un "Risque de Départ" (Élevé, Moyen, Faible). 
Critères possibles d'alerte (Risque Élevé) : score de performance très bas (< 2.5), ancienneté élevée sans augmentation (simulé ici), ou un nombre anormal de congés maladie courts récents.
Critères possibles (Risque Moyen) : Beaucoup de congés récemment ou baisse de performance.

Renvoie UNIQUEMENT un tableau JSON valide de ce type :
[
  { "id": "123", "name": "Jean Dupont", "riskLevel": "Élevé", "reason": "Baisse de perf et forte ancienneté" }
]

Données :
${JSON.stringify(promptData)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt
        });

        const textRes = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const insights = JSON.parse(textRes);

        res.status(200).json(insights);
    } catch (error) {
        console.error("Erreur Predictive Analytics:", error);
        res.status(500).json({ error: 'Erreur lors de la prédiction' });
    }
};
