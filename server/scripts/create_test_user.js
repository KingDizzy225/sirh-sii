const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email: 'jean.k@sii.ci' } });
  if (existing) {
      console.log('Kouamé Jean existe déjà.');
      return;
  }

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      name: 'Kouamé Jean',
      email: 'jean.k@sii.ci',
      password: hashedPassword,
      role: 'EMPLOYEE'
    }
  });

  // 2. Create Employee
  const emp = await prisma.employee.create({
    data: {
      firstName: 'Jean',
      lastName: 'Kouamé',
      email: 'jean.kouame@sii.ci',
      department: 'Informatique',
      positionTitle: 'Développeur Fullstack',
      hireDate: new Date(),
      status: 'ACTIVE',
      role: 'EMPLOYEE'
    }
  });

  console.log('Utilisateur Kouamé Jean créé avec succès!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
