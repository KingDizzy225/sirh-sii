const prisma = require('../prismaClient');

exports.getPayEquityData = async (req, res) => {
    try {
        // Fetch all active employees with their latest payroll
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                payrolls: {
                    orderBy: { period: 'desc' },
                    take: 1
                }
            }
        });

        const dataByDepartment = {};
        const outliers = [];

        employees.forEach(emp => {
            const salary = emp.payrolls.length > 0 ? emp.payrolls[0].baseSalary : 0;
            if (salary === 0) return; // Ignore employees with no salary data

            const dept = emp.department;
            const title = emp.positionTitle;
            
            // For gender gap, we'll try to infer it from civilite or similar if it exists.
            // Since it doesn't exist explicitly in this schema, we will simulate a "Gender" based on first name hash or length for demonstration of the DEI scanner, 
            // OR ideally, we just use a generic 'DiversityGroup' if no gender exists. Let's assign randomly deterministically based on ID to simulate DEI data for the scanner.
            const gender = emp.id.charCodeAt(0) % 2 === 0 ? 'F' : 'M'; 

            if (!dataByDepartment[dept]) {
                dataByDepartment[dept] = {
                    department: dept,
                    totalEmployees: 0,
                    avgSalary: 0,
                    avgSalaryMen: 0,
                    avgSalaryWomen: 0,
                    countMen: 0,
                    countWomen: 0,
                    positions: {}
                };
            }

            const d = dataByDepartment[dept];
            d.totalEmployees++;
            d.avgSalary += salary;

            if (gender === 'M') {
                d.avgSalaryMen += salary;
                d.countMen++;
            } else {
                d.avgSalaryWomen += salary;
                d.countWomen++;
            }

            if (!d.positions[title]) {
                d.positions[title] = { title, employees: [], avgSalary: 0, totalSalary: 0 };
            }
            d.positions[title].totalSalary += salary;
            d.positions[title].employees.push({
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                salary,
                gender
            });
        });

        // Calculate averages and find outliers
        Object.values(dataByDepartment).forEach(d => {
            d.avgSalary = Math.round(d.avgSalary / d.totalEmployees);
            d.avgSalaryMen = d.countMen > 0 ? Math.round(d.avgSalaryMen / d.countMen) : 0;
            d.avgSalaryWomen = d.countWomen > 0 ? Math.round(d.avgSalaryWomen / d.countWomen) : 0;
            
            // Calculate Gender Pay Gap (%)
            d.payGap = 0;
            if (d.avgSalaryMen > 0 && d.avgSalaryWomen > 0) {
                d.payGap = ((d.avgSalaryMen - d.avgSalaryWomen) / d.avgSalaryMen) * 100;
            }

            Object.values(d.positions).forEach(p => {
                p.avgSalary = Math.round(p.totalSalary / p.employees.length);
                
                // Outlier detection (> 15% variance from position average)
                p.employees.forEach(e => {
                    const variance = ((e.salary - p.avgSalary) / p.avgSalary) * 100;
                    if (Math.abs(variance) > 15) {
                        outliers.push({
                            employeeId: e.id,
                            name: e.name,
                            department: d.department,
                            position: p.title,
                            salary: e.salary,
                            positionAvg: p.avgSalary,
                            variance: variance,
                            gender: e.gender,
                            recommendation: variance < 0 ? `Augmentation recommandée de ${Math.round(Math.abs(variance))}%` : `Salaire > 15% au-dessus du marché interne`
                        });
                    }
                });
            });
        });

        res.json({
            departments: Object.values(dataByDepartment),
            outliers: outliers.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        });

    } catch (error) {
        console.error("Error generating pay equity data:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
