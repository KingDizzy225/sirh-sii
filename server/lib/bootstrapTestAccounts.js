const bcrypt = require('bcryptjs');
const prisma = require('./../prismaClient');

/**
 * Comptes de démonstration créés automatiquement au démarrage.
 *
 * Ce sont les comptes annoncés sur l'écran de connexion. Les créer ici évite
 * d'avoir à exécuter `seed.js` contre la base distante, ce qui suppose de
 * disposer de son URL externe.
 *
 * Deux différences essentielles avec seed.js, qui vide la base avant d'écrire :
 * rien n'est jamais supprimé, et un compte déjà présent n'est pas retouché —
 * son mot de passe reste celui qu'il a. Le traitement est donc sans risque à
 * chaque redémarrage.
 *
 * ⚠️ Le mot de passe de ces comptes est affiché publiquement sur l'écran de
 * connexion : ils conviennent à une phase de démonstration, pas à un usage
 * réel. Poser DISABLE_TEST_ACCOUNTS=true avant d'ouvrir l'application à de
 * véritables salariés.
 */

const TEST_PASSWORD = process.env.TEST_ACCOUNTS_PASSWORD || 'SIIRH';

const ACCOUNTS = [
    {
        email: 'admin@sirh.com', name: 'Super Admin', role: 'ADMIN',
        firstName: 'Super', lastName: 'Admin', frontendRole: 'Administrator',
        department: 'Direction', positionTitle: 'CEO', hireDate: new Date('2020-01-01')
    },
    {
        email: 'drh@sirh.com', name: 'Directeur RH', role: 'HR',
        firstName: 'Directeur', lastName: 'RH', frontendRole: 'HR',
        department: 'Ressources Humaines', positionTitle: 'DRH', hireDate: new Date('2021-03-15')
    },
    {
        email: 'manager1@sirh.com', name: 'Manager Opérationnel', role: 'MANAGER',
        firstName: 'Manager', lastName: 'Opérationnel', frontendRole: 'Manager',
        department: 'Opérations', positionTitle: 'Chef de Projet', hireDate: new Date('2022-06-10')
    },
    {
        email: 'rh1@sirh.com', name: 'Assistant RH 1', role: 'HR',
        firstName: 'Assistant', lastName: 'RH 1', frontendRole: 'HR',
        department: 'Ressources Humaines', positionTitle: 'Chargé de Recrutement', hireDate: new Date('2023-01-20')
    },
    {
        email: 'rh2@sirh.com', name: 'Assistant RH 2', role: 'HR',
        firstName: 'Assistant', lastName: 'RH 2', frontendRole: 'HR',
        department: 'Ressources Humaines', positionTitle: 'Gestionnaire Paie', hireDate: new Date('2024-05-05')
    },
    {
        email: 'manager2@sirh.com', name: 'Manager IT', role: 'MANAGER',
        firstName: 'Manager', lastName: 'IT', frontendRole: 'Manager',
        department: 'Ingénierie', positionTitle: 'Lead Developer', hireDate: new Date('2021-11-01')
    }
];

async function bootstrapTestAccounts() {
    if (process.env.DISABLE_TEST_ACCOUNTS === 'true') {
        console.log('[COMPTES TEST] Désactivés (DISABLE_TEST_ACCOUNTS=true).');
        return;
    }

    try {
        const hashed = await bcrypt.hash(TEST_PASSWORD, 10);
        let createdUsers = 0;
        let createdEmployees = 0;

        for (const account of ACCOUNTS) {
            const existingUser = await prisma.user.findUnique({ where: { email: account.email } });
            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        email: account.email,
                        password: hashed,
                        name: account.name,
                        role: account.role
                    }
                });
                createdUsers++;
            }

            // Fiche employé associée : profil, pointage et carrière recherchent
            // l'employé par son adresse email.
            const existingEmployee = await prisma.employee.findUnique({ where: { email: account.email } });
            if (!existingEmployee) {
                await prisma.employee.create({
                    data: {
                        firstName: account.firstName,
                        lastName: account.lastName,
                        email: account.email,
                        role: account.frontendRole,
                        department: account.department,
                        status: 'ACTIVE',
                        hireDate: account.hireDate,
                        positionTitle: account.positionTitle
                    }
                });
                createdEmployees++;
            }
        }

        if (createdUsers || createdEmployees) {
            console.log(
                `[COMPTES TEST] ${createdUsers} compte(s) et ${createdEmployees} fiche(s) employé créés. ` +
                'Identifiants publics (écran de connexion) — poser DISABLE_TEST_ACCOUNTS=true avant tout usage réel.'
            );
        } else {
            console.log('[COMPTES TEST] Déjà présents, aucun changement.');
        }
    } catch (error) {
        // Ne jamais empêcher le serveur de servir l'API
        console.error('[COMPTES TEST] Échec de la création :', error.message);
    }
}

module.exports = { bootstrapTestAccounts, ACCOUNTS, TEST_PASSWORD };
