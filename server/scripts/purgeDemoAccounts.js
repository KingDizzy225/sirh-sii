#!/usr/bin/env node
/**
 * Retrait des identifiants de connexion de démonstration.
 *
 *   npm run purge-demo            # liste ce qui serait supprimé, sans rien faire
 *   npm run purge-demo -- --confirm
 *
 * DISABLE_TEST_ACCOUNTS=true empêche la *recréation* des comptes @sirh.com au
 * démarrage, mais ne touche pas à ceux déjà présents. Sur une base neuve la
 * question ne se pose pas ; sur la base existante, ces comptes restent
 * utilisables avec un mot de passe qui figure dans un dépôt public.
 *
 * Ce script ne supprime que les lignes `User`, c'est-à-dire le moyen de se
 * connecter. Les fiches `Employee` correspondantes sont conservées
 * volontairement : elles ne donnent aucun accès, et leur suppression
 * entraînerait celle de leurs subordonnés hiérarchiques (`onDelete: Cascade`
 * sur la relation manager) — un vrai salarié rattaché à un manager de
 * démonstration disparaîtrait avec lui, sans avertissement.
 *
 * Pour retirer aussi ces fiches, le faire depuis l'application après avoir
 * réaffecté les rattachements.
 */

const prisma = require('../prismaClient');

const confirme = process.argv.includes('--confirm');
const DOMAINE = '@sirh.com';

async function main() {
    const comptes = await prisma.user.findMany({
        where: { email: { endsWith: DOMAINE } },
        select: { email: true, name: true, role: true }
    });

    if (comptes.length === 0) {
        console.log(`\nAucun compte en ${DOMAINE}. Rien à faire.\n`);
        return;
    }

    console.log(`\n${comptes.length} compte(s) de démonstration :\n`);
    for (const c of comptes) {
        console.log(`  ${c.email.padEnd(28)} ${c.role.padEnd(9)} ${c.name}`);
    }

    if (!confirme) {
        console.log(
            '\nAucune suppression effectuée (simulation).\n' +
            'Pour supprimer réellement :  npm run purge-demo -- --confirm\n' +
            'Poser également DISABLE_TEST_ACCOUNTS=true, sans quoi le prochain\n' +
            'démarrage du serveur les recréera à l\'identique.\n'
        );
        return;
    }

    if (process.env.DISABLE_TEST_ACCOUNTS !== 'true') {
        console.log(
            '\n⚠️  DISABLE_TEST_ACCOUNTS ne vaut pas "true" dans cet environnement.\n' +
            '   Les comptes seront recréés au prochain démarrage du serveur.\n' +
            '   Poser la variable chez l\'hébergeur avant de poursuivre.\n'
        );
    }

    const nominatifs = await prisma.user.count({
        where: { email: { not: { endsWith: DOMAINE } } }
    });
    if (nominatifs === 0) {
        console.error(
            '\n❌ Aucun compte nominatif en base : supprimer les comptes de\n' +
            '   démonstration rendrait l\'application inaccessible à tous.\n' +
            '   Créer d\'abord un administrateur (npm run create-admin).\n'
        );
        process.exit(1);
    }

    const { count } = await prisma.user.deleteMany({
        where: { email: { endsWith: DOMAINE } }
    });
    console.log(`\n✅ ${count} compte(s) supprimé(s). ${nominatifs} compte(s) nominatif(s) conservé(s).\n`);
}

main()
    .catch((e) => { console.error('\n❌', e.message, '\n'); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
