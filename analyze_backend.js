const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'server/controllers');
const routesDir = path.join(__dirname, 'server/routes');

const report = {
    unprotectedRoutes: [],
    nPlusOne: [],
    unhandledErrors: [],
    sensitiveData: []
};

// Check routes
if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
    for (const file of routeFiles) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.match(/router\.(get|post|put|delete|patch)\(/)) {
                // Ignore public routes intentionally
                if (line.includes('/public')) return;
                // If it doesn't have verifyToken or protect
                if (!line.includes('verifyToken') && !line.includes('protect')) {
                    report.unprotectedRoutes.push(`${file}:${i+1} -> ${line.trim()}`);
                }
            }
        });
    }
}

// Check controllers
if (fs.existsSync(controllersDir)) {
    const ctrlFiles = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
    for (const file of ctrlFiles) {
        const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
        
        // 1. Unhandled errors: async without try
        // A naive check: split by "exports.* = async (req, res) => {" and check if the block has "try {"
        const blocks = content.split(/exports\.\w+\s*=\s*async\s*\(req,\s*res\)\s*=>\s*\{/);
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            // Just check the first few lines of the block for "try {"
            const firstPart = block.substring(0, 200);
            if (!firstPart.includes('try {')) {
                report.unhandledErrors.push(file);
                break;
            }
        }

        // 2. N+1 Prisma
        // Check for loop (for or map) followed by prisma call inside
        // Very naive check
        if (content.match(/for\s*\(.*?\)\s*\{[^}]*prisma\.\w+\.(find|create|update|delete)/s) || 
            content.match(/\.map\([^)]*\)\s*=>\s*\{?[^}]*prisma\.\w+\.(find|create|update|delete)/s)) {
            report.nPlusOne.push(file);
        }

        // 3. Sensitive data
        // Check if returning password or secret
        if (content.match(/res\.(json|send)\([^)]*password[^)]*\)/i)) {
            report.sensitiveData.push(file);
        }
    }
}

console.log(JSON.stringify(report, null, 2));
