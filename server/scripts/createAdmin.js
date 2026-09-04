#!/usr/bin/env node
/**
 * Création du premier compte administrateur.
 *
 * Aucun identifiant n'est écrit dans le dépôt : le script lit les valeurs
 * depuis l'environnement au moment de l'exécution.
 *
 *   ADMIN_EMAIL="rh@entreprise.ci" \
 *   ADMIN_PASSWORD='...' \
 *   ADMIN_NAME="Prénom Nom" \
 *   DATABASE_URL="postgres://..." \
 *   npm run create-admin
 *
 * Options :
 *   --role=ADMIN|HR|MANAGER   Rôle du compte (défaut : ADMIN)
 *   --reset-password          Réinitialise le mot de passe si le compte existe déjà
 *   --no-employee             Ne crée pas la fiche employé associée
 */

const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const getOption = (name, fallback) => {
    const match = args.find(a => a.startsWith(`--${name}=`));
    return match ? match.split('=').slice(1).join('=') : fallback;
};

const fail = (message) => {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
};

async function main() {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    const name = (process.env.ADMIN_NAME || '').trim();
    const role = getOption('role', 'ADMIN').toUpperCase();

    if (!email || !password || !name) {
        fail("Variables requises : ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.\n" +
             "   Exemple : ADMIN_EMAIL=\"rh@entreprise.ci\" ADMIN_PASSWORD='...' ADMIN_NAME=\"Prénom Nom\" npm run create-admin");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        fail(`Adresse email invalide : ${email}`);
    }
    if (!['ADMIN', 'HR', 'MANAGER'].includes(role)) {
        fail(`Rôle invalide : ${role} (valeurs acceptées : ADMIN, HR, MANAGER)`);
    }
    if (password.length < 12) {
        fail("Le mot de passe doit contenir au moins 12 caractères.");
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        fail("Le mot de passe doit mêler minuscules, majuscules et chiffres.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && !hasFlag('reset-password')) {
        fail(`Un compte existe déjà pour ${email}.\n` +
             "   Relancez avec --reset-password pour réinitialiser son mot de passe.");
    }

    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
        await prisma.user.update({
            where: { email },
            data: { password: hashed, role, name }
        });
        console.log(`\n✅ Mot de passe réinitialisé pour ${email} (rôle ${role}).`);
    } else {
        await prisma.user.create({
            data: { email, password: hashed, name, role }
        });
        console.log(`\n✅ Compte ${role} créé : ${email}`);
    }

    // Fiche employé associée : nécessaire pour le profil, le pointage et
    // l'explorateur de carrière, qui recherchent l'employé par email.
    if (!hasFlag('no-employee')) {
        const employee = await prisma.employee.findUnique({ where: { email } });
        if (employee) {
            console.log(`ℹ️  Fiche employé déjà présente pour ${email}, inchangée.`);
        } else {
            const parts = name.split(/\s+/);
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ') || parts[0];
            const frontendRole = role === 'ADMIN' ? 'Administrator' : (role === 'HR' ? 'HR' : 'Manager');

            await prisma.employee.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    role: frontendRole,
                    department: 'Ressources Humaines',
                    status: 'ACTIVE',
                    hireDate: new Date(),
                    positionTitle: role === 'ADMIN' ? 'Directeur RH' : 'Chargé RH'
                }
            });
            console.log(`✅ Fiche employé créée pour ${firstName} ${lastName}.`);
        }
    }

    const total = await prisma.user.count();
    console.log(`\nComptes utilisateurs en base : ${total}`);
    console.log("Connectez-vous à l'application avec cette adresse email.\n");
}

main()
    .catch((error) => {
        console.error('\n❌ Échec de la création du compte :', error.message, '\n');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
