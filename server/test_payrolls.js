require('dotenv').config();
const axios = require('axios');
const token = 'mock_token'; // Or use DB directly
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Fetch latest payrolls
    const payrolls = await prisma.payroll.findMany({
        orderBy: { period: 'desc' }
    });
    console.log("Total payrolls:", payrolls.length);
    
    // Group by employee to find the latest
    const latest = {};
    for (const p of payrolls) {
        if (!latest[p.employeeId]) {
            latest[p.employeeId] = p;
        }
    }
    
    for (const [empId, p] of Object.entries(latest)) {
        const emp = await prisma.employee.findUnique({where: {id: empId}});
        console.log(`Latest for ${emp.firstName}: ${p.baseSalary} (Period: ${p.period})`);
    }
}
main().finally(() => prisma.$disconnect());
