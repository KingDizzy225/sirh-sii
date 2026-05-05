const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const prisma = new PrismaClient();
const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const fetchAll = (query) => new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

async function main() {
    console.log("Connecté à la base de données Render Postgres.");
    
    const tablesToMigrate = [
        'Employee',
        'User',
        'SkillDefinition',
        'TalentProfile',
        'EmployeeSkill',
        'Asset',
        'AssetAssignment',
        'Leave',
        'Expense',
        'MedicalVisit',
        'Payroll',
        'EmployeeDocument'
    ];

    for (const tableName of tablesToMigrate) {
        console.log(`Lecture de la table SQLite : ${tableName}...`);
        const rows = await fetchAll(`SELECT * FROM "${tableName}"`);
        
        if (rows.length === 0) {
            console.log(`Table ${tableName} vide, on passe.`);
            continue;
        }

        console.log(`Migration de ${rows.length} lignes vers ${tableName}...`);
        
        const snakeToCamel = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

        // Conversion des booléens, dates et snake_case -> camelCase
        const formattedRows = rows.map(row => {
            const formatted = {};
            for (const [key, value] of Object.entries(row)) {
                const camelKey = snakeToCamel(key);
                let finalVal = value;
                
                // Conversion Dates
                if (typeof value === 'number' && 
                   (camelKey.toLowerCase().includes('date') || camelKey.includes('At') || camelKey.includes('Date') || camelKey === 'lastAssessment' || camelKey === 'period')) {
                    finalVal = value < 100000000000 ? new Date(value * 1000) : new Date(value);
                }
                
                formatted[camelKey] = finalVal;
            }
            
            if (tableName === 'Payroll' && formatted.isPaid !== undefined) {
                formatted.isPaid = formatted.isPaid === 1;
            }
            if (tableName === 'TalentProfile' && formatted.readyForPromotion !== undefined) {
                formatted.readyForPromotion = formatted.readyForPromotion === 1;
            }
            if (tableName === 'EmployeeSkill' && formatted.interestedInTraining !== undefined) {
                formatted.interestedInTraining = formatted.interestedInTraining === 1;
            }
            
            return formatted;
        });

        // Suppression des données existantes (pour éviter les doublons si on relance)
        try {
            await prisma[tableName.charAt(0).toLowerCase() + tableName.slice(1)].deleteMany({});
        } catch(e) {}

        try {
            await prisma[tableName.charAt(0).toLowerCase() + tableName.slice(1)].createMany({
                data: formattedRows,
                skipDuplicates: true
            });
            console.log(`✅ Table ${tableName} migrée avec succès !`);
        } catch (e) {
            console.error(`❌ Erreur lors de la migration de ${tableName}:`, e.message);
            // On essaie ligne par ligne si createMany échoue
            let successCount = 0;
            for(const row of formattedRows) {
                try {
                    await prisma[tableName.charAt(0).toLowerCase() + tableName.slice(1)].create({ data: row });
                    successCount++;
                } catch(err) {
                    // console.error(`Failed row in ${tableName}:`, err.message);
                }
            }
            console.log(`✅ ${successCount} lignes insérées manuellement dans ${tableName}.`);
        }
    }
}

main()
    .then(() => {
        console.log("🚀 MIGRATION TERMINÉE AVEC SUCCÈS !");
        db.close();
        prisma.$disconnect();
    })
    .catch(e => {
        console.error(e);
        db.close();
        prisma.$disconnect();
    });
