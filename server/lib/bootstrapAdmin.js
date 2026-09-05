const bcrypt = require('bcryptjs');
const prisma = require('./../prismaClient');

/**
 * Création du premier compte administrateur depuis les variables
 * d'environnement, au démarrage du serveur.
 *
 * Raison d'être : créer ce compte avec `npm run create-admin` suppose de
 * disposer de l'URL externe de la base, ce qui n'est pas toujours praticable.
 * Ici, deux variables renseignées dans l'interface de l'hébergeur suffisent.
 *
 *   BOOTSTRAP_ADMIN_EMAIL     adresse de connexion
 *   BOOTSTRAP_ADMIN_PASSWORD  mot de passe (12 caractères minimum)
 *   BOOTSTRAP_ADMIN_NAME      nom affiché (facultatif)
 *
 * Garde-fous : le compte n'est créé que s'il n'existe pas déjà — un mot de
 * passe existant n'est jamais écrasé, et relancer le serveur ne change rien.
 * Une fois le compte créé, retirer BOOTSTRAP_ADMIN_PASSWORD des variables.
 */
async function bootstrapAdminFromEnv() {
    const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
    const name = (process.env.BOOTSTRAP_ADMIN_NAME || '').trim() || 'Administrateur';

    if (!email || !password) return; // fonctionnalité non sollicitée

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        console.error('[BOOTSTRAP] BOOTSTRAP_ADMIN_EMAIL invalide, aucun compte créé.');
        return;
    }
    if (password.length < 12) {
        console.error('[BOOTSTRAP] BOOTSTRAP_ADMIN_PASSWORD trop court (12 caractères minimum), aucun compte créé.');
        return;
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log(`[BOOTSTRAP] Compte ${email} déjà présent : rien à faire. ` +
                        'Vous pouvez retirer BOOTSTRAP_ADMIN_PASSWORD des variables.');
            return;
        }

        const hashed = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { email, password: hashed, name, role: 'ADMIN' }
        });

        // Fiche employé associée : le profil, le pointage et l'explorateur de
        // carrière recherchent l'employé par son adresse email.
        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) {
            const parts = name.split(/\s+/);
            await prisma.employee.create({
                data: {
                    firstName: parts[0],
                    lastName: parts.slice(1).join(' ') || parts[0],
                    email,
                    role: 'Administrator',
                    department: 'Ressources Humaines',
                    status: 'ACTIVE',
                    hireDate: new Date(),
                    positionTitle: 'Directeur RH'
                }
            });
        }

        console.log(`[BOOTSTRAP] ✅ Compte administrateur créé : ${email}. ` +
                    'Connectez-vous, puis retirez BOOTSTRAP_ADMIN_PASSWORD des variables.');
    } catch (error) {
        console.error('[BOOTSTRAP] Échec de la création du compte administrateur :', error.message);
    }
}

module.exports = { bootstrapAdminFromEnv };
