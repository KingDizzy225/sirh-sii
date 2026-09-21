#!/usr/bin/env node
/**
 * Base école : anonymise une copie de la production.
 *
 * L'équipe informatique a besoin d'une base pour éprouver une mise à jour, et
 * la RH d'une base pour se former. Sans cet outil, les deux copient la
 * production — et les salaires réels de tout le monde se retrouvent sur des
 * postes de travail, hors de toute protection.
 *
 *   1. Restaurer une sauvegarde de production dans une base NOMMÉE « ecole »,
 *      « test », « essai » ou « demo » — le script refuse toute autre base.
 *   2. DATABASE_URL="postgresql://…/sirh_ecole" node scripts/anonymiser.js --confirmer
 *
 * Options :
 *   --confirmer              obligatoire ; sans elle, le script ne fait rien
 *   --mot-de-passe="…"       remplace le mot de passe de tous les comptes
 *
 * **Ce qui est anonymisé** : identités, contacts, adresses, dates de
 * naissance (décalées), matricules, numéros CNPS, coordonnées bancaires,
 * salaires (bruités), messages libres (congés, sanctions, remerciements,
 * livres d'or), journaux WhatsApp et notifications.
 *
 * **Ce qui est supprimé** : le journal d'audit (il contient les valeurs
 * d'avant et d'après en clair), les documents scellés et les liens de remise
 * (leur sceau ne vaudrait plus rien après renommage), les chemins de fichiers.
 *
 * **Ce qui n'est PAS traité** : les fichiers eux-mêmes, dans `uploads/`. Ne
 * les copiez pas sur la base école — une pièce d'identité scannée reste une
 * pièce d'identité scannée.
 */

const crypto = require('crypto');
const prisma = require('../prismaClient');

const PRENOMS = ['Awa', 'Brou', 'Cissé', 'Drissa', 'Épiphanie', 'Fatou', 'Gbato', 'Henriette', 'Ibrahim',
    'Jocelyne', 'Konan', 'Lassina', 'Mariam', 'N\'Guessan', 'Ouattara', 'Pauline', 'Raoul', 'Salimata',
    'Tanoh', 'Yao', 'Zié', 'Aminata', 'Bakary', 'Clarisse'];
const NOMS = ['Koffi', 'Traoré', 'Kouassi', 'Diabaté', 'Bamba', 'Yoro', 'Touré', 'Kone', 'Gnahoré',
    'Assamoi', 'Sangaré', 'Doumbia', 'Aka', 'Beugré', 'Coulibaly', 'Ehui', 'Fofana', 'Gbagbo'];

const argument = (nom) => {
    const trouve = process.argv.find((a) => a.startsWith(`--${nom}=`));
    return trouve ? trouve.slice(nom.length + 3).replace(/^["']|["']$/g, '') : null;
};

const nombreDe = (graine, modulo) => parseInt(crypto.createHash('sha256').update(String(graine)).digest('hex').slice(0, 8), 16) % modulo;

const url = process.env.DATABASE_URL || '';
const nomBase = (url.split('/').pop() || '').split('?')[0];

async function principal() {
    if (!/ecole|test|essai|demo|anonym/i.test(nomBase)) {
        console.error(
            `\n❌ Base « ${nomBase || '(non définie)'} » refusée.\n` +
            "   Ce script réécrit toutes les identités. Il ne s'exécute que sur une base dont le nom\n" +
            "   comporte « ecole », « test », « essai », « demo » ou « anonym ».\n" +
            '   Restaurez d\'abord une sauvegarde dans une base ainsi nommée.\n'
        );
        process.exit(1);
    }
    if (!process.argv.includes('--confirmer')) {
        console.error(`\n❌ Ajoutez --confirmer pour anonymiser « ${nomBase} ». Rien n'a été modifié.\n`);
        process.exit(1);
    }

    console.log(`\nAnonymisation de « ${nomBase} »…\n`);
    const compte = {};
    const noter = (quoi, n) => { compte[quoi] = (compte[quoi] || 0) + n; };

    // --- Salariés ---------------------------------------------------------
    const salaries = await prisma.employee.findMany({ select: { id: true, baseSalary: true, birthDate: true } });
    for (const s of salaries) {
        const prenom = PRENOMS[nombreDe(`${s.id}p`, PRENOMS.length)];
        const nom = NOMS[nombreDe(`${s.id}n`, NOMS.length)];
        const suffixe = nombreDe(`${s.id}s`, 9000) + 1000;
        // Le salaire garde son ordre de grandeur : une formation à la paie sur
        // des montants absurdes n'apprend rien.
        const bruit = 1 + (nombreDe(`${s.id}b`, 21) - 10) / 100;
        const naissance = s.birthDate ? new Date(s.birthDate) : null;
        if (naissance) naissance.setUTCDate(naissance.getUTCDate() + nombreDe(`${s.id}d`, 61) - 30);

        await prisma.employee.update({
            where: { id: s.id },
            data: {
                firstName: prenom,
                lastName: `${nom}-${suffixe}`,
                email: `${prenom.toLowerCase()}.${nom.toLowerCase()}${suffixe}@ecole.local`,
                phone: `07${String(10000000 + nombreDe(`${s.id}t`, 89999999)).slice(0, 8)}`,
                address: 'Adresse anonymisée',
                birthDate: naissance,
                matricule: `E-${suffixe}${nombreDe(`${s.id}m`, 99)}`,
                cnpsNumber: `CNPS-${suffixe}${nombreDe(`${s.id}c`, 999)}`,
                bankName: 'Banque école',
                bankAccount: `CI00${suffixe}${nombreDe(`${s.id}k`, 999999)}`,
                baseSalary: s.baseSalary ? Math.round((s.baseSalary * bruit) / 500) * 500 : null
            }
        });
    }
    noter('salariés', salaries.length);

    // --- Comptes de connexion --------------------------------------------
    const motDePasse = argument('mot-de-passe');
    const utilisateurs = await prisma.user.findMany({ select: { id: true } });
    let empreinte = null;
    if (motDePasse) {
        const bcrypt = require('bcryptjs');
        empreinte = await bcrypt.hash(motDePasse, 10);
    }
    for (const u of utilisateurs) {
        const suffixe = nombreDe(`${u.id}u`, 9000) + 1000;
        await prisma.user.update({
            where: { id: u.id },
            data: {
                name: `Utilisateur ${suffixe}`,
                email: `utilisateur${suffixe}@ecole.local`,
                ...(empreinte ? { password: empreinte } : {})
            }
        });
    }
    noter('comptes', utilisateurs.length);
    if (!motDePasse) {
        console.log('  ⚠️  Mots de passe inchangés : personne ne connaîtra les nouvelles adresses.');
        console.log('      Relancer avec --mot-de-passe="…" pour ouvrir la base école.\n');
    }

    // --- Textes libres ----------------------------------------------------
    // Ils nomment des personnes, décrivent des situations de santé ou des
    // sanctions : les conserver reviendrait à n'avoir rien anonymisé.
    const vides = [
        ['congés', () => prisma.leave.updateMany({ data: { reason: null, attachmentPath: null } })],
        ['absences', () => prisma.absence.updateMany({ data: { justification: null, justificatifPath: null } })],
        ['procédures', () => prisma.procedure.updateMany({ data: { motif: '[anonymisé]', issue: null } })],
        ['visites médicales', () => prisma.medicalVisit.updateMany({ data: { notes: null, restrictions: null, doctor: null } })],
        ['remerciements', () => prisma.kudo.updateMany({ data: { message: 'Message anonymisé' } })],
        ['annonces', () => prisma.announcement.updateMany({ data: { body: 'Contenu anonymisé' } })],
        ['livres d\'or', () => prisma.motLivreDor.updateMany({ data: { auteur: 'Collègue', message: 'Message anonymisé', empreinteIp: null } })],
        ['passations', () => prisma.elementPassation.updateMany({ data: { texte: '[anonymisé]' } })],
        ['bulletins (fichiers)', () => prisma.payroll.updateMany({ data: { pdfPath: null, signature: null } })],
        ['documents (fichiers)', () => prisma.employeeDocument.updateMany({ data: { filePath: '/uploads/anonymise', certificatePath: null, signatureHash: null } })],
        ['pièces (fichiers)', () => prisma.pieceSalarie.updateMany({ data: { filePath: null, note: null } })],
        ['badges (photos)', () => prisma.badgeSalarie.updateMany({ data: { photoPath: null } })]
    ];
    for (const [quoi, travail] of vides) {
        const { count } = await travail();
        noter(quoi, count);
    }

    // --- Suppressions -----------------------------------------------------
    const supprimes = [
        ['journal d\'audit', () => prisma.auditLog.deleteMany({})],
        ['ancrages', () => prisma.ancrageAudit.deleteMany({})],
        ['documents scellés', () => prisma.issuedDocument.deleteMany({})],
        ['liens de remise', () => prisma.remiseDocument.deleteMany({})],
        ['liens de bilan annuel', () => prisma.retrospectiveAnnuelle.deleteMany({})],
        ['journal WhatsApp', () => prisma.whatsappLog.deleteMany({})],
        ['notifications', () => prisma.notification.deleteMany({})],
        ['comptes rendus de sonde', () => prisma.executionSonde.deleteMany({})]
    ];
    for (const [quoi, travail] of supprimes) {
        const { count } = await travail();
        noter(`${quoi} (supprimés)`, count);
    }

    console.log('Résultat :');
    for (const [quoi, n] of Object.entries(compte)) console.log(`  ${String(n).padStart(6)} ${quoi}`);
    console.log(
        '\n✅ Base école prête.\n' +
        "   Ne copiez pas le dossier uploads/ de la production : les fichiers, eux, ne sont pas anonymisés.\n" +
        '   Le journal d\'audit a été vidé : la chaîne repart de zéro sur cette base.\n'
    );
}

principal()
    .catch((e) => { console.error('\n❌ Anonymisation interrompue :', e.message, '\n'); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
