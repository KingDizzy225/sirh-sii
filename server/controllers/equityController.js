const prisma = require('../prismaClient');

/**
 * Normalise le genre déclaré sur la fiche employé.
 *
 * Le champ est libre et facultatif ; il vaut « Non spécifié » par défaut. Tout
 * ce qui n'est pas reconnu comme féminin ou masculin est classé « inconnu » et
 * exclu des comparaisons : une valeur non renseignée ne doit ni être devinée,
 * ni être versée arbitrairement dans l'un des deux groupes.
 */
/**
 * Nombre minimal de titulaires d'un poste pour qu'une comparaison individuelle
 * ait un sens. Surchargeable pour une petite structure, où trois personnes sur
 * un même intitulé sont déjà rares.
 */
const EFFECTIF_MIN_COMPARAISON = parseInt(process.env.EFFECTIF_MIN_EQUITE, 10) || 3;

const normaliserGenre = (valeur) => {
    const v = String(valeur || '').trim().toLowerCase();
    if (['f', 'femme', 'féminin', 'feminin', 'female'].includes(v)) return 'F';
    if (['m', 'homme', 'masculin', 'male'].includes(v)) return 'M';
    return null;
};

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
        // Ce que l'analyse ne couvre pas doit être connu de qui la lit : un
        // écart calculé sur trois personnes ne se distingue autrement pas d'un
        // écart calculé sur tout l'effectif.
        const couverture = { actifs: employees.length, sansSalaire: 0, sansGenre: 0 };

        employees.forEach(emp => {
            const salary = emp.payrolls.length > 0 ? emp.payrolls[0].baseSalary : 0;
            if (salary === 0) { couverture.sansSalaire++; return; }

            const dept = emp.department;
            const title = emp.positionTitle;

            // Le genre est lu sur la fiche employé. Il était auparavant tiré de
            // `emp.id.charCodeAt(0) % 2`, c'est-à-dire à pile ou face : les
            // écarts de rémunération H/F et les recommandations d'augmentation
            // nominatives qui en découlaient ne mesuraient rien. Le champ
            // existait pourtant déjà au schéma.
            const gender = normaliserGenre(emp.gender);
            if (!gender) couverture.sansGenre++;

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

            // Un genre non renseigné n'est versé dans aucun des deux groupes :
            // le compter d'un côté déplacerait la moyenne de ce côté-là.
            if (gender === 'M') {
                d.avgSalaryMen += salary;
                d.countMen++;
            } else if (gender === 'F') {
                d.avgSalaryWomen += salary;
                d.countWomen++;
            } else {
                d.countInconnu = (d.countInconnu || 0) + 1;
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
            
            // L'écart vaut `null`, non zéro, quand un des deux groupes est
            // absent : « pas d'écart mesurable » et « aucun écart » ne se
            // confondent pas, et un zéro affiché passerait pour une parité
            // parfaite là où il n'y a simplement personne à comparer.
            d.countInconnu = d.countInconnu || 0;
            d.payGap = (d.countMen > 0 && d.countWomen > 0)
                ? ((d.avgSalaryMen - d.avgSalaryWomen) / d.avgSalaryMen) * 100
                : null;
            d.comparable = d.payGap !== null;

            Object.values(d.positions).forEach(p => {
                p.avgSalary = Math.round(p.totalSalary / p.employees.length);

                // Une « moyenne du poste » calculée sur deux personnes n'est pas
                // une référence : l'écart mesuré y est surtout l'effet de
                // l'autre salaire. En deçà de ce seuil, aucune recommandation
                // n'est émise — mieux vaut ne rien dire que recommander une
                // augmentation sur une base qui n'en est pas une.
                if (p.employees.length < EFFECTIF_MIN_COMPARAISON) return;

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
            outliers: outliers.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)),
            couverture
        });

    } catch (error) {
        console.error("Error generating pay equity data:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
