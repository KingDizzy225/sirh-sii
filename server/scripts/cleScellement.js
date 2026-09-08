#!/usr/bin/env node
/**
 * Clé de scellement des documents signés.
 *
 *   npm run cle-scellement            # état de la clé, sans rien créer
 *   npm run cle-scellement -- --exporter
 *
 * Les documents émis portent un sceau produit avec cette clé. Sans elle, ils
 * deviennent invérifiables : le certificat continue d'exister, mais plus
 * personne ne peut confirmer qu'il vient bien de l'entreprise. Elle survit donc
 * aux migrations, aux changements d'hébergeur et aux remises à zéro de base.
 *
 * Deux situations, et elles n'appellent pas la même chose :
 *
 *  - Aucune clé n'existe encore. Le mieux est d'en produire une et de la poser
 *    dans SIGNATURE_SEAL_PRIVATE_KEY avant le premier document signé. Rien
 *    n'est alors à récupérer, jamais.
 *  - Une clé existe déjà en base, produite au premier usage. Il faut l'exporter
 *    et la conserver ailleurs, car les documents déjà scellés ne se vérifient
 *    qu'avec elle.
 *
 * Ce script ne crée jamais de clé par lui-même : lire l'état ne doit pas
 * changer l'état.
 */

const prisma = require('../prismaClient');
const crypto = require('crypto');

const exporter = process.argv.includes('--exporter');
const produire = process.argv.includes('--produire');

async function main() {
    const env = (process.env.SIGNATURE_SEAL_PRIVATE_KEY || '').trim();
    const enBase = await prisma.signingKey.findFirst({
        where: { active: true }, orderBy: { createdAt: 'desc' }
    });
    const scelles = await prisma.issuedDocument.count({ where: { sceau: { not: null } } });

    console.log('');
    console.log(`Documents déjà scellés : ${scelles}`);

    if (env) {
        console.log('Clé courante : variable d\'environnement SIGNATURE_SEAL_PRIVATE_KEY.');
        console.log(`Identifiant  : ${process.env.SIGNATURE_SEAL_KEY_ID || 'env'}`);
    } else if (enBase) {
        console.log(`Clé courante : conservée en base (${enBase.keyId}, produite le ${enBase.createdAt.toLocaleDateString('fr-FR')}).`);
        console.log('');
        console.log('Une clé en base est moins protégée qu\'une variable d\'environnement,');
        console.log('et disparaît avec la base. Exportez-la et posez-la dans');
        console.log('SIGNATURE_SEAL_PRIVATE_KEY avant toute migration.');
    } else {
        console.log('Clé courante : aucune.');
        console.log('');
        if (scelles === 0) {
            console.log('Aucun document n\'est encore scellé : c\'est le moment idéal.');
            console.log('Produisez une clé et posez-la dans l\'environnement — vous n\'aurez');
            console.log('alors jamais rien à récupérer.');
            console.log('');
            console.log('  npm run cle-scellement -- --produire');
        } else {
            // Ne devrait pas arriver : des sceaux sans clé signifient que la
            // clé a été supprimée. Le dire plutôt que de laisser croire à un
            // système sain.
            console.log(`⚠️  ${scelles} document(s) portent un sceau, mais aucune clé n'est disponible.`);
            console.log('   Ces sceaux ne peuvent plus être vérifiés. Retrouvez la clé d\'origine,');
            console.log('   ou réémettez les documents concernés.');
        }
    }

    if (produire) {
        if (enBase || env) {
            console.log('');
            console.log('⚠️  Une clé existe déjà. En produire une autre laisserait les documents');
            console.log('   déjà scellés vérifiables uniquement tant que l\'ancienne subsiste.');
            console.log('   Exportez d\'abord l\'existante (--exporter).');
            return;
        }
        const { privateKey } = crypto.generateKeyPairSync('ed25519');
        const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
        console.log('');
        console.log('Clé produite. À poser dans l\'environnement du serveur :');
        console.log('');
        console.log(`SIGNATURE_SEAL_PRIVATE_KEY="${Buffer.from(pem).toString('base64')}"`);
        console.log('');
        console.log('Conservez-en une copie hors du serveur. Elle ne se régénère pas :');
        console.log('les documents scellés avec elle ne se vérifieraient plus.');
        return;
    }

    if (exporter) {
        if (!enBase) {
            console.log('');
            console.log('Rien à exporter : aucune clé en base.');
            return;
        }
        console.log('');
        console.log('À poser dans l\'environnement du serveur :');
        console.log('');
        console.log(`SIGNATURE_SEAL_PRIVATE_KEY="${Buffer.from(enBase.privateKeyPem).toString('base64')}"`);
        console.log(`SIGNATURE_SEAL_KEY_ID="${enBase.keyId}"`);
        console.log('');
        console.log('Conservez l\'identifiant : il figure sur les documents déjà émis,');
        console.log('et c\'est par lui qu\'ils retrouvent leur clé de vérification.');
    } else if (enBase) {
        console.log('');
        console.log('Pour l\'exporter :  npm run cle-scellement -- --exporter');
    }
    console.log('');
}

main()
    .catch((e) => { console.error('\nÉchec :', e.message, '\n'); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
