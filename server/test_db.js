const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const payrolls = await prisma.payroll.findMany({ orderBy: { period: 'desc' }, take: 5, include: { employee: true } });
  for (const p of payrolls) {
    console.log(p.employee.firstName + ' - Period: ' + p.period + ' - Base: ' + p.baseSalary);
  }
}
main().finally(() => prisma.$disconnect());
