const prisma = require('./prismaClient');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('Seeding 190 employees and their competencies into Prisma database...');

    const jsonPath = path.join(__dirname, 'data', 'mock_190_employees.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('File not found:', jsonPath);
        process.exit(1);
    }

    const employeesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${employeesData.length} employees to seed.`);

    let createdCount = 0;
    let skillsCount = 0;

    for (const emp of employeesData) {
        try {
            // Upsert employee by email
            const created = await prisma.employee.upsert({
                where: { email: emp.email },
                update: {
                    positionTitle: emp.positionTitle,
                    department: emp.department,
                    role: emp.role,
                    phone: emp.phone,
                    gender: emp.gender,
                    address: emp.address,
                    nationality: emp.nationality,
                    matricule: emp.matricule,
                    cnpsNumber: emp.cnpsNumber,
                    bankName: emp.bankName,
                    bankAccount: emp.bankAccount,
                    childrenCount: emp.childrenCount,
                    annualLeaveBalance: emp.annualLeaveBalance
                },
                create: {
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    email: emp.email,
                    role: emp.role,
                    department: emp.department,
                    status: emp.status || 'ACTIVE',
                    hireDate: new Date(emp.hireDate || '2023-01-15'),
                    birthDate: new Date(emp.birthDate || '1990-01-01'),
                    positionTitle: emp.positionTitle,
                    phone: emp.phone,
                    gender: emp.gender,
                    address: emp.address,
                    nationality: emp.nationality,
                    matricule: emp.matricule,
                    cnpsNumber: emp.cnpsNumber,
                    bankName: emp.bankName,
                    bankAccount: emp.bankAccount,
                    childrenCount: emp.childrenCount || 0,
                    annualLeaveBalance: emp.annualLeaveBalance || 24,
                    leaveBalanceSource: 'CALCUL'
                }
            });

            createdCount++;

            // Upsert talent profile
            if (emp.potential && emp.performance) {
                await prisma.talentProfile.upsert({
                    where: { employeeId: created.id },
                    update: {
                        potential: emp.potential,
                        performance: emp.performance,
                        flightRisk: emp.flightRisk || 'Low',
                        readiness: emp.readiness || 'Prêt maintenant'
                    },
                    create: {
                        employeeId: created.id,
                        potential: emp.potential,
                        performance: emp.performance,
                        flightRisk: emp.flightRisk || 'Low',
                        readiness: emp.readiness || 'Prêt maintenant'
                    }
                }).catch(() => {});
            }

            // Seed skills
            if (Array.isArray(emp.skills)) {
                for (const s of emp.skills) {
                    await prisma.employeeSkill.create({
                        data: {
                            employeeId: created.id,
                            skillName: s.skillName,
                            proficiencyLevel: s.proficiencyLevel,
                            interestedInTraining: false
                        }
                    }).catch(() => {});
                    skillsCount++;
                }
            }
        } catch (err) {
            console.warn(`Could not seed employee ${emp.email}:`, err.message);
        }
    }

    console.log(`Seeding complete: ${createdCount} employees and ${skillsCount} skills seeded!`);
}

main()
    .catch(e => console.error('Seed error:', e))
    .finally(() => prisma.$disconnect());
