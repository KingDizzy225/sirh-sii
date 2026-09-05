#!/usr/bin/env node
/**
 * Essai d'intégration des écritures.
 *
 *   createdb sirh_test
 *   DATABASE_URL="postgresql://user@localhost:5432/sirh_test" npm run test:ecritures
 *
 * Exerce les principaux chemins de création à travers les contrôleurs, puis
 * vérifie que les requêtes incomplètes reçoivent bien un 400 et non un 500.
 *
 * Raison d'être : Prisma ne rejette un champ inconnu ou manquant qu'à
 * l'exécution. Ni le build, ni le lint, ni les contrôles statiques ne voient
 * une fonctionnalité morte ; seul un appel réel la révèle. Plusieurs créations
 * échouaient ainsi depuis leur écriture sans que rien ne le signale.
 *
 * Écrit en base : refuse de s'exécuter si le nom de la base ne comporte pas
 * « test » ou « essai ».
 */

const path = require('path');
const racine = path.join(__dirname, '..');
const prisma = require(path.join(racine, 'prismaClient'));

const url = process.env.DATABASE_URL || '';
const nomBase = (url.split('/').pop() || '').split('?')[0];
if (!/test|essai/i.test(nomBase)) {
    console.error(
        `\n❌ Base « ${nomBase || '(non définie)'} » refusée.\n` +
        "   Cet essai écrit en base. Pointer DATABASE_URL vers une base jetable\n" +
        "   dont le nom comporte « test » ou « essai ».\n"
    );
    process.exit(1);
}

const ctrl = (nom) => require(path.join(racine, 'controllers', nom));

// Réponse Express minimale.
const faireRes = () => {
    const r = { statut: null, corps: null };
    r.status = (c) => { r.statut = c; return r; };
    r.json = (d) => { r.corps = d; return r; };
    r.send = (d) => { r.corps = d; return r; };
    r.header = () => r; r.attachment = () => r; r.download = () => r;
    return r;
};

let echecs = 0;

/**
 * @param {number|number[]} codes Statut attendu, ou statuts acceptables.
 *
 * Toute création répond 201. Deux points de l'API s'en écartaient — `sendKudo`
 * et le pointage par QR — et sont désormais alignés ; les contrôles ci-dessous
 * figent ce choix. Restent volontairement en 200 les routes dont l'objet est
 * une mise à jour qui crée un enregistrement annexe (changement de statut d'une
 * candidature, d'un parrainage, d'un mentorat, avancement de formation) et les
 * points d'action comme le chatbot : leur ressource principale existait déjà.
 */
const attendu = async (libelle, codes, fn) => {
    const acceptes = Array.isArray(codes) ? codes : [codes];
    const r = faireRes();
    try {
        await fn(r);
    } catch (e) {
        console.log(`  ❌ ${libelle}  → exception : ${e.message.slice(0, 120)}`);
        echecs++;
        return;
    }
    const obtenu = r.statut === null ? 200 : r.statut;
    const ok = acceptes.includes(obtenu);
    console.log(`  ${ok ? '✅' : '❌'} ${libelle}  → ${obtenu}` + (ok ? '' : ` (attendu ${acceptes.join(' ou ')})`));
    if (!ok) echecs++;
};

async function main() {
    const marque = Date.now();
    // Express expose toujours `req.app` ; plusieurs contrôleurs y lisent `io`.
    const app = { get: () => null };

    const employe = (prenom, dept) => prisma.employee.create({
        data: {
            firstName: prenom, lastName: 'Essai', email: `${prenom.toLowerCase()}.${marque}@essai.test`,
            role: 'Employee', department: dept, status: 'ACTIVE',
            hireDate: new Date('2023-01-01'), positionTitle: 'Collaborateur'
        }
    });
    const emp = await employe('Awa', 'Opérations');
    const emp2 = await employe('Kouassi', 'IT');
    const user = { id: emp.id, email: emp.email, role: 'ADMIN', name: 'Essai RH' };

    // Tâches alimentant le tableau. Créées ici plutôt que par l'embauche : le
    // but est d'éprouver le tableau, pas de refaire le parcours de recrutement.
    await prisma.onboardingTask.createMany({
        data: [
            { employeeId: emp.id, taskName: 'Création des accès', assignedTo: 'IT Support', status: 'Pending', dueDate: new Date('2026-10-01') },
            { employeeId: emp.id, taskName: 'Signature du contrat', assignedTo: 'Ressources Humaines', status: 'In Progress' }
        ]
    });
    await prisma.offboardingTask.create({
        data: { employeeId: emp2.id, taskName: 'Restitution du matériel', assignedTo: 'IT Support', status: 'Pending' }
    });

    console.log('\n=== Créations ===');

    await attendu('congé', 201, r => ctrl('leaveController').createLeave(
        { body: { employeeId: emp.id, type: 'Congé Annuel', startDate: '2026-10-01', endDate: '2026-10-05', reason: 'essai' }, user, app }, r));

    await attendu('note de frais', 201, r => ctrl('expenseController').createExpense(
        { body: { employeeId: emp.id, category: 'Déplacement', amount: 25000, description: 'essai', date: '2026-09-01' }, user }, r));

    await attendu('acompte sur salaire', 201, r => ctrl('advanceController').createAdvance(
        { body: { employeeId: emp.id, amount: 50000, reason: 'essai' }, user }, r));

    await attendu('annonce', 201, r => ctrl('announcementController').createAnnouncement(
        { body: { title: 'Essai', body: 'contenu' }, user }, r));

    let offre = null;
    await attendu("offre d'emploi", 201, async r => {
        await ctrl('recruitmentController').createJobOffer(
            { body: { title: 'Dév', department: 'IT', location: 'Abidjan', type: 'CDI', experience: 'Senior', description: 'd', requirements: 'Node' }, user }, r);
        offre = r.corps;
    });

    if (offre && offre.id) {
        await attendu('candidature', 201, r => ctrl('recruitmentController').createApplicant(
            { body: { jobOfferId: offre.id, firstName: 'A', lastName: 'K', email: `cand.${marque}@essai.test`, phone: '0102030405', resumeUrl: '/cv.pdf', experience: '5 ans' }, user }, r));
    }

    await attendu('kudo', 201, r => ctrl('kudoController').sendKudo(
        { body: { senderId: emp.id, receiverId: emp2.id, message: 'bravo', category: 'Entraide' }, user }, r));

    await attendu('pointage QR', 201, r => ctrl('qrController').clockIn(
        { body: { employeeId: emp.id, type: 'START' }, user }, r));

    const etiquette = `ESS-${marque}`;
    await attendu('actif', 201, r => ctrl('assetController').createAsset(
        { body: { category: 'Informatique', model: 'X1', assetTag: etiquette, departmentOwner: 'IT' }, user }, r));

    await attendu('dossier disciplinaire', 201, r => ctrl('disciplinaryController').addRecord(
        { params: { employeeId: emp.id }, body: { date: '2026-09-01', type: 'Warning', reason: 'essai', sanction: 'Avertissement' }, user }, r));

    console.log('\n=== Tableau des tâches ===');
    // L'embauche a créé des tâches d'intégration : le tableau doit les voir.
    const board = faireRes();
    await ctrl('taskBoardController').getBoard({ user: { role: 'ADMIN', email: user.email } }, board);
    const taches = board.corps?.taches || [];
    await attendu('le tableau répond', 200, async r => { r.statut = board.statut; r.corps = board.corps; });
    console.log(`  ${taches.length > 0 ? '✅' : '❌'} tâches d'intégration listées  → ${taches.length}`);
    if (taches.length === 0) echecs++;

    // Chaque colonne est exercée. Une version antérieure n'acceptait que deux
    // des trois valeurs : `IN_PROGRESS` était rejeté parce que la mise en
    // minuscules donnait « in_progress » là où la table attendait « in progress ».
    // L'essai ne couvrait alors que PENDING et DONE, et laissait passer le défaut.
    const cible = taches.find(t => t.source === 'ONBOARDING');
    for (const statut of ['IN_PROGRESS', 'DONE', 'PENDING']) {
        await attendu(`déplacement vers ${statut}`, 200, async r => {
            await ctrl('taskBoardController').updateStatus(
                { params: { source: cible.source, id: cible.id }, body: { statut }, user: { role: 'ADMIN' } }, r);
            if (r.statut === null) r.statut = 200;
        });
    }

    await attendu('statut inconnu refusé', 400, r => ctrl('taskBoardController').updateStatus(
        { params: { source: 'ONBOARDING', id: cible.id }, body: { statut: 'BIDON' }, user: { role: 'ADMIN' } }, r));
    await attendu('nature de tâche inconnue refusée', 400, r => ctrl('taskBoardController').updateStatus(
        { params: { source: 'AUTRE', id: cible.id }, body: { statut: 'DONE' }, user: { role: 'ADMIN' } }, r));
    await attendu('tâche inexistante en 404', 404, r => ctrl('taskBoardController').updateStatus(
        { params: { source: 'ONBOARDING', id: '00000000-0000-0000-0000-000000000000' },
          body: { statut: 'DONE' }, user: { role: 'ADMIN' } }, r));

    console.log('\n=== Requêtes incomplètes : 400 attendu, pas 500 ===');
    // Une requête malformée relève de l'appelant. Répondre 500 fait porter la
    // faute au serveur et masque la vraie cause à qui intègre l'API.

    await attendu('annonce sans body', 400, r => ctrl('announcementController').createAnnouncement(
        { body: { title: 'Titre' }, user }, r));
    await attendu('annonce sans title', 400, r => ctrl('announcementController').createAnnouncement(
        { body: { body: 'Contenu' }, user }, r));
    await attendu('actif sans category', 400, r => ctrl('assetController').createAsset(
        { body: { model: 'X1' }, user }, r));
    await attendu('actif sans model', 400, r => ctrl('assetController').createAsset(
        { body: { category: 'Informatique' }, user }, r));
    await attendu('actif — étiquette en doublon', 409, r => ctrl('assetController').createAsset(
        { body: { category: 'Informatique', model: 'X2', assetTag: etiquette }, user }, r));

    console.log('\n=== Nettoyage ===');
    await prisma.employee.deleteMany({ where: { email: { endsWith: '@essai.test' } } });
    await prisma.asset.deleteMany({ where: { assetTag: { startsWith: 'ESS-' } } });
    await prisma.announcement.deleteMany({ where: { title: 'Essai' } });
    if (offre && offre.id) await prisma.jobOffer.deleteMany({ where: { id: offre.id } });
    console.log("  données d'essai supprimées");
}

main()
    .then(() => {
        console.log(echecs === 0 ? '\n✅ Tous les contrôles passent.\n' : `\n❌ ${echecs} contrôle(s) en échec.\n`);
        process.exit(echecs === 0 ? 0 : 1);
    })
    .catch((e) => { console.error('\n❌', e.message, '\n'); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
