const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'", [], (err, tables) => {
    if (err) throw err;
    
    let pending = tables.length;
    console.log("Checking row counts in SQLite...");
    
    tables.forEach(t => {
        db.get(`SELECT COUNT(*) as count FROM "${t.name}"`, [], (err, row) => {
            if (row && row.count > 0) {
                console.log(`Table ${t.name}: ${row.count} rows`);
            }
            pending--;
            if (pending === 0) db.close();
        });
    });
});
