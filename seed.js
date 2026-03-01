// seed.js
import { faker } from '@faker-js/faker';
import fs from 'fs';

const NUM_EMPLOYEES = 50;

// Constantes pour répartir les données
const DEPARTMENTS = [
    { id: 'uuid-dept-it', name: 'Engineering' },
    { id: 'uuid-dept-hr', name: 'Human Resources' },
    { id: 'uuid-dept-sales', name: 'Sales' },
    { id: 'uuid-dept-finance', name: 'Finance' }
];

const ROLES = ['Employee', 'Employee', 'Employee', 'Employee', 'Manager', 'HR', 'Social Worker', 'Administrator'];

async function seedDatabase() {
    console.log(`🌱 Démarrage du Seeding : ${NUM_EMPLOYEES} Employés...`);

    try {
        // --- 1. GÉNÉRATION DES UTILISATEURS / EMPLOYÉS ---
        const employeesToInsert = [];
        const payrollToInsert = [];
        const leavesToInsert = [];
        const supportTicketsToInsert = [];
        const employeeSkillsToInsert = [];

        for (let i = 0; i < NUM_EMPLOYEES; i++) {
            const employeeId = faker.string.uuid();
            const department = faker.helpers.arrayElement(DEPARTMENTS);
            const role = faker.helpers.arrayElement(ROLES);
            const joinDate = faker.date.past({ years: 5 });

            // Employé de Base
            employeesToInsert.push({
                id: employeeId,
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email({ provider: 'company.com' }).toLowerCase(),
                role: role,
                department_id: department.id,
                department: department.name,
                status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_LEAVE', 'TERMINATED']),
                hire_date: joinDate,
                position_title: faker.person.jobTitle(),
                created_at: new Date()
            });

            // --- 2. DONNÉES DE PAIE (Payroll) ---
            const baseSalary = faker.number.int({ min: 35000, max: 120000 });
            payrollToInsert.push({
                id: faker.string.uuid(),
                employee_id: employeeId,
                period: new Date(2026, 1, 1),
                base_salary: baseSalary,
                bonus: faker.helpers.maybe(() => faker.number.int({ min: 500, max: 5000 }), { probability: 0.3 }) || 0,
                deductions: faker.number.int({ min: 100, max: 800 }),
                status: 'Paid'
            });

            // --- 3. HISTORIQUE DE CONGÉS (Leaves) ---
            const numLeaves = faker.number.int({ min: 1, max: 3 });
            for (let j = 0; j < numLeaves; j++) {
                const leaveStart = faker.date.between({ from: joinDate, to: new Date(2027, 0, 1) });
                leavesToInsert.push({
                    id: faker.string.uuid(),
                    employee_id: employeeId,
                    type: faker.helpers.arrayElement(['Annual', 'Sick', 'Maternity', 'Unpaid']),
                    start_date: leaveStart,
                    end_date: faker.date.soon({ days: 10, refDate: leaveStart }),
                    status: faker.helpers.arrayElement(['Approved', 'Approved', 'Rejected', 'Pending']),
                    duration_days: faker.number.int({ min: 1, max: 10 })
                });
            }

            // --- 4. MODULES RÉCENTS: Assistante Sociale (Support) ---
            if (faker.helpers.maybe(() => true, { probability: 0.15 })) {
                supportTicketsToInsert.push({
                    id: faker.string.uuid(),
                    requester_id: employeeId,
                    category: faker.helpers.arrayElement(['Logement', 'Famille', 'Finances', 'Santé Mentale', 'Handicap']),
                    priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Urgent']),
                    status: faker.helpers.arrayElement(['Ouvert', 'En cours', 'Résolu', 'Fermé']),
                    is_anonymous: faker.datatype.boolean(),
                    title: faker.lorem.sentence(5),
                    description: faker.lorem.paragraph(),
                    created_at: faker.date.recent({ days: 60 })
                });
            }

            // --- 5. MODULES RÉCENTS: Compétences (GPEC) ---
            const numSkills = faker.number.int({ min: 3, max: 5 });
            const mockSkills = ['JavaScript', 'React', 'Project Management', 'Communication', 'SQL', 'Leadership', 'Excel', 'Python', 'AWS', 'Design', 'Agile'];
            const assignedSkills = faker.helpers.arrayElements(mockSkills, numSkills);

            for (const skill of assignedSkills) {
                employeeSkillsToInsert.push({
                    id: faker.string.uuid(),
                    employee_id: employeeId,
                    skill_name: skill,
                    proficiency_level: faker.helpers.arrayElement(['Débutant', 'Intermédiaire', 'Avancé', 'Expert']),
                    interested_in_training: faker.datatype.boolean()
                });
            }
        }

        // --- EXPORTATION EN JSON (Simule la BD) ---
        const dbExport = {
            employees: employeesToInsert,
            payroll_records: payrollToInsert,
            leaves: leavesToInsert,
            social_support_tickets: supportTicketsToInsert,
            employee_skills: employeeSkillsToInsert
        };

        console.log("💾 Écriture des données générées dans seed_output.json...");
        fs.writeFileSync('seed_output.json', JSON.stringify(dbExport, null, 2));

        console.log("✅ SEEDING TERMINÉ AVEC SUCCÈS ! Les données sont prêtes.");
        console.log(`📊 Bilan : ${employeesToInsert.length} employés générés.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Erreur pendant le seeding:", error);
        process.exit(1);
    }
}

seedDatabase();
