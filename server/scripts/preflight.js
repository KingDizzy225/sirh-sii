#!/usr/bin/env node
/**
 * Contrôle de préparation à la mise en production.
 *
 *   npm run preflight
 *
 * Vérifie, sur l'environnement où il s'exécute, que rien de ce qui rendait
 * l'application acceptable en démonstration ne subsiste en production : compte
 * de test à mot de passe public, secret par défaut, base ouverte à toutes les
 * origines, absence de compte nominatif.
 *
 * À exécuter sur le serveur cible (variables d'environnement de production
 * chargées), pas sur un poste de développement.
 */

const prisma = require('../prismaClient');

const resultats = [];
const ok = (libelle, detail) => resultats.push({ niveau: 'ok', libelle, detail });
const avertir = (libelle, detail) => resultats.push({ niveau: 'avertissement', libelle, detail });
const bloquer = (libelle, detail) => resultats.push({ niveau: 'bloquant', libelle, detail });

async function verifier() {
    // --- Secrets et configuration ---
    const secret = process.env.JWT_SECRET;
    if (!secret) bloquer('JWT_SECRET', 'Absent : le serveur refusera de démarrer en production.');
    else if (secret.length < 32) bloquer('JWT_SECRET', `Trop court (${secret.length} caractères, 32 minimum).`);
    else ok('JWT_SECRET', `Défini (${secret.length} caractères).`);

    if (!process.env.DATABASE_URL) bloquer('DATABASE_URL', 'Absente.');
    else ok('DATABASE_URL', 'Définie.');

    if (!process.env.FRONTEND_URL && !process.env.PUBLIC_APP_URL) {
        bloquer('FRONTEND_URL',
            "Absente : l'API accepte toutes les origines et les QR codes pointent vers l'adresse de repli.");
    } else {
        ok('FRONTEND_URL', process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL);
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        avertir('ANTHROPIC_API_KEY', 'Absente : les fonctions IA renverront une erreur explicite.');
    } else {
        ok('ANTHROPIC_API_KEY', 'Définie.');
        // Une clé d'organisation sans espace de travail est acceptée à la
        // configuration mais refusée à chaque appel : le contrôle ne peut pas
        // le deviner, il rappelle donc la variable qui règle le cas.
        if (!process.env.ANTHROPIC_WORKSPACE_ID) {
            avertir('ANTHROPIC_WORKSPACE_ID',
                "Non définie. Nécessaire si la clé n'est pas rattachée à un espace de travail — " +
                'vérifier avec GET /api/jobs/ia.');
        } else ok('ANTHROPIC_WORKSPACE_ID', 'Définie.');
    }

    if (process.env.SMTP_HOST) ok('SMTP', `Configuré (${process.env.SMTP_HOST}).`);
    else avertir('SMTP', "Non configuré : les emails partent vers une boîte de test, pas vers les salariés.");

    if (process.env.NODE_ENV !== 'production') {
        avertir('NODE_ENV', `Vaut « ${process.env.NODE_ENV || 'non défini' } » : certaines protections ne s'activent qu'en production.`);
    } else ok('NODE_ENV', 'production');

    // --- Comptes ---
    try {
        const comptesTest = await prisma.user.count({
            where: { email: { endsWith: '@sirh.com' } }
        });
        if (comptesTest > 0 && process.env.DISABLE_TEST_ACCOUNTS !== 'true') {
            bloquer('Comptes de démonstration',
                `${comptesTest} compte(s) en @sirh.com présents et recréés à chaque démarrage. ` +
                'Leur mot de passe figure dans le dépôt public. Poser DISABLE_TEST_ACCOUNTS=true et les supprimer.');
        } else if (comptesTest > 0) {
            avertir('Comptes de démonstration',
                `${comptesTest} compte(s) encore en base, mais leur recréation est désactivée. À supprimer.`);
        } else {
            ok('Comptes de démonstration', 'Aucun.');
        }

        const nominatifs = await prisma.user.count({
            where: { email: { not: { endsWith: '@sirh.com' } } }
        });
        if (nominatifs === 0) {
            bloquer('Comptes nominatifs',
                "Aucun : une fois les comptes de test retirés, plus personne ne peut se connecter. " +
                'Créer un administrateur avec npm run create-admin.');
        } else ok('Comptes nominatifs', `${nominatifs} compte(s).`);

        // --- Volumétrie ---
        const [salaries, paies] = await Promise.all([
            prisma.employee.count(),
            prisma.payroll.count()
        ]);
        ok('Volumétrie', `${salaries} salarié(s), ${paies} bulletin(s).`);
    } catch (error) {
        bloquer('Base de données', `Inaccessible : ${error.message}`);
    }

    // --- Traitements planifiés ---
    if (process.env.DISABLE_SCHEDULED_JOBS === 'true') {
        avertir('Traitements planifiés',
            "Désactivés : acquisition des congés, alertes et relances ne tourneront pas.");
    } else ok('Traitements planifiés', 'Actifs.');
}

verifier()
    .then(() => {
        const par = (n) => resultats.filter(r => r.niveau === n);
        const symbole = { ok: '✅', avertissement: '⚠️ ', bloquant: '❌' };

        console.log('\nContrôle de préparation à la production\n' + '─'.repeat(60));
        for (const r of resultats) {
            console.log(`${symbole[r.niveau]} ${r.libelle}`);
            console.log(`   ${r.detail}`);
        }

        const bloquants = par('bloquant').length;
        const avertissements = par('avertissement').length;
        console.log('─'.repeat(60));
        console.log(`${par('ok').length} conforme(s) · ${avertissements} avertissement(s) · ${bloquants} bloquant(s)\n`);

        if (bloquants > 0) {
            console.log("Mise en production déconseillée tant que les points bloquants subsistent.\n");
            process.exit(1);
        }
        console.log('Aucun point bloquant.\n');
    })
    .catch((e) => {
        console.error('\nContrôle interrompu :', e.message, '\n');
        process.exit(1);
    })
    .finally(async () => { await prisma.$disconnect(); });
