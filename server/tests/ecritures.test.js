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

    console.log('\n=== Santé et sécurité ===');
    const hier = new Date(Date.now() - 86400000).toISOString();
    const ancien = new Date(Date.now() - 10 * 86400000).toISOString();
    let accidentRecent = null;

    await attendu("accident du travail consigné", 201, async r => {
        await ctrl('hseController').createAccident({
            body: {
                employeeId: emp.id, occurredAt: hier, location: 'Entrepôt A',
                type: 'Accident du travail', severity: 'Majeur',
                description: 'Chute de plain-pied', daysOff: 5
            }, user
        }, r);
        accidentRecent = r.corps;
    });

    // La bascule du délai de déclaration se vérifie des deux côtés : un contrôle
    // qui ne teste qu'un sens laisse passer un seuil inversé.
    console.log(`  ${accidentRecent?.declarationEnRetard === false ? '✅' : '❌'} dans le délai : aucun retard signalé`);
    if (accidentRecent?.declarationEnRetard !== false) echecs++;

    let accidentAncien = null;
    await attendu('accident ancien consigné', 201, async r => {
        await ctrl('hseController').createAccident({
            body: {
                employeeId: emp2.id, occurredAt: ancien, location: 'Quai',
                type: 'Accident du travail', severity: 'Grave',
                description: 'Écrasement du pied', daysOff: 30
            }, user
        }, r);
        accidentAncien = r.corps;
    });
    console.log(`  ${accidentAncien?.declarationEnRetard === true ? '✅' : '❌'} délai dépassé : retard signalé`);
    if (accidentAncien?.declarationEnRetard !== true) echecs++;

    await attendu('accident sans lieu refusé', 400, r => ctrl('hseController').createAccident(
        { body: { employeeId: emp.id, occurredAt: hier, type: 'Accident du travail', severity: 'Mineur', description: 'x' }, user }, r));
    await attendu('type inconnu refusé', 400, r => ctrl('hseController').createAccident(
        { body: { employeeId: emp.id, occurredAt: hier, location: 'X', type: 'Bidon', severity: 'Mineur', description: 'x' }, user }, r));
    await attendu('date future refusée', 400, r => ctrl('hseController').createAccident(
        { body: { employeeId: emp.id, occurredAt: new Date(Date.now() + 86400000).toISOString(), location: 'X', type: 'Accident du travail', severity: 'Mineur', description: 'x' }, user }, r));
    await attendu('salarié inexistant refusé', 404, r => ctrl('hseController').createAccident(
        { body: { employeeId: '00000000-0000-0000-0000-000000000000', occurredAt: hier, location: 'X', type: 'Accident du travail', severity: 'Mineur', description: 'x' }, user }, r));

    await attendu('déclaration CNPS enregistrée', 200, async r => {
        await ctrl('hseController').updateAccident(
            { params: { id: accidentAncien.id }, body: { declaredToCnps: true }, user }, r);
        if (r.statut === null) r.statut = 200;
    });
    await attendu('statut de suivi inconnu refusé', 400, r => ctrl('hseController').updateAccident(
        { params: { id: accidentAncien.id }, body: { status: 'Bidon' }, user }, r));

    await attendu('registre et indicateurs', 200, async r => {
        await ctrl('hseController').getAccidents({ query: {}, user }, r);
        if (r.statut === null) r.statut = 200;
    });

    await attendu('suivi des visites médicales', 200, async r => {
        await ctrl('hseController').getSuiviVisites({ query: {}, user }, r);
        if (r.statut === null) r.statut = 200;
    });

    console.log('\n=== Équité salariale ===');
    // Garde-fou contre un retour en arrière : le genre était tiré de
    // `emp.id.charCodeAt(0) % 2`, donc à pile ou face, alors que le champ
    // existait sur la fiche. Les écarts H/F et les recommandations
    // d'augmentation nominatives qui en découlaient ne mesuraient rien.
    const hFemme = await prisma.employee.create({
        data: {
            firstName: 'Awa', lastName: 'Equite', email: `awa.eq.${marque}@essai.test`,
            role: 'Employee', department: 'Équité', status: 'ACTIVE',
            hireDate: new Date('2023-01-01'), positionTitle: 'Analyste', gender: 'Femme'
        }
    });
    const hHomme = await prisma.employee.create({
        data: {
            firstName: 'Yao', lastName: 'Equite', email: `yao.eq.${marque}@essai.test`,
            role: 'Employee', department: 'Équité', status: 'ACTIVE',
            hireDate: new Date('2023-01-01'), positionTitle: 'Analyste', gender: 'Homme'
        }
    });
    await prisma.payroll.createMany({
        data: [
            { employeeId: hFemme.id, period: new Date('2026-08-01'), baseSalary: 400000, netSalary: 320000 },
            { employeeId: hHomme.id, period: new Date('2026-08-01'), baseSalary: 500000, netSalary: 400000 }
        ]
    });

    const eq = faireRes();
    await ctrl('equityController').getPayEquityData({ user }, eq);
    const service = (eq.corps?.departments || []).find(d => d.department === 'Équité');
    const genreLu = service && service.countWomen === 1 && service.countMen === 1;
    console.log(`  ${genreLu ? '✅' : '❌'} genre lu sur la fiche, non deviné  → ${service?.countWomen} F / ${service?.countMen} H`);
    if (!genreLu) echecs++;

    const ecartJuste = service && Math.abs(service.payGap - 20) < 0.5;
    console.log(`  ${ecartJuste ? '✅' : '❌'} écart conforme aux salaires réels  → ${service?.payGap?.toFixed(1)} %`);
    if (!ecartJuste) echecs++;

    const couvertureDite = !!eq.corps?.couverture;
    console.log(`  ${couvertureDite ? '✅' : '❌'} portée de l'analyse rapportée`);
    if (!couvertureDite) echecs++;

    console.log('\n=== Parcours d\'intégration ===');
    const tplCtrl = ctrl('taskTemplateController');
    const { construireTachesIntegration } = require(path.join(racine, 'data/onboardingTemplates'));

    const sansModele = faireRes();
    await tplCtrl.getTemplates({ user }, sansModele);
    const surCode = sansModele.corps?.sourceAppliquee === 'FICHIER_DE_CODE';
    console.log(`  ${surCode ? '✅' : '❌'} sans modèle actif : le socle livré s'applique`);
    if (!surCode) echecs++;

    // Le repli sur le fichier de code est ce qui garantit qu'une base vide ne
    // prive jamais une arrivée de ses formalités.
    const tachesSocle = await construireTachesIntegration({ id: emp.id, department: 'Tech / IT' }, prisma);
    const socleNonVide = tachesSocle.length > 0;
    console.log(`  ${socleNonVide ? '✅' : '❌'} le socle produit des tâches  → ${tachesSocle.length}`);
    if (!socleNonVide) echecs++;

    let modele = null;
    await attendu('création d\'un modèle', 201, async r => {
        await tplCtrl.createTemplate({
            body: {
                nom: 'Parcours court', type: 'ONBOARDING',
                taches: [{ titre: 'Signer le contrat', equipe: 'Ressources Humaines', jours: 0 }]
            }, user
        }, r);
        modele = r.corps;
    });

    await attendu('activation du modèle', 200, async r => {
        await tplCtrl.updateTemplate({ params: { id: modele.id }, body: { actif: true }, user }, r);
        if (r.statut === null) r.statut = 200;
    });

    const tachesModele = await construireTachesIntegration({ id: emp.id, department: 'Commercial' }, prisma);
    const modelePrime = tachesModele.length === 1 && tachesModele[0].taskName === 'Signer le contrat';
    console.log(`  ${modelePrime ? '✅' : '❌'} un modèle actif pilote l'embauche  → ${tachesModele.length} tâche(s)`);
    if (!modelePrime) echecs++;

    await attendu('modèle sans nom refusé', 400, r => tplCtrl.createTemplate(
        { body: { nom: '', type: 'ONBOARDING' }, user }, r));
    await attendu('type de parcours inconnu refusé', 400, r => tplCtrl.createTemplate(
        { body: { nom: 'X', type: 'BIDON' }, user }, r));
    await attendu('tâche sans libellé refusée', 400, r => tplCtrl.createTemplate(
        { body: { nom: 'X', type: 'ONBOARDING', taches: [{ titre: '', equipe: 'RH' }] }, user }, r));
    await attendu('modèle inexistant en 404', 404, r => tplCtrl.updateTemplate(
        { params: { id: '00000000-0000-0000-0000-000000000000' }, body: {}, user }, r));

    await prisma.taskTemplate.deleteMany({ where: { name: { in: ['Parcours court', 'X'] } } });

    console.log('\n=== Règles internes ===');
    const polCtrl = ctrl('policyController');

    // L'assistant RH portait ses règles en dur — « 30 jours de congés » — et
    // les servait à toute entreprise. Ce qu'on vérifie ici, c'est qu'il tire
    // désormais sa matière de la base, et rien d'autre.
    const sansRegle = await polCtrl.reglesPourAssistant();
    const videAuDepart = Array.isArray(sansRegle) && sansRegle.length === 0;
    console.log(`  ${videAuDepart ? '✅' : '❌'} sans règle enregistrée, l'assistant est sans source`);
    if (!videAuDepart) echecs++;

    let regle = null;
    await attendu('création d\'une règle', 201, async r => {
        await polCtrl.createPolicy({
            body: {
                titre: 'Droit à congés annuels', categorie: 'Congés',
                contenu: 'Tout salarié acquiert 2,2 jours ouvrables par mois de service effectif.',
                source: 'Convention collective, art. 25.1'
            }, user
        }, r);
        regle = r.corps;
    });

    const avecRegle = await polCtrl.reglesPourAssistant();
    const alimente = avecRegle.length === 1 && avecRegle[0].source.includes('25.1');
    console.log(`  ${alimente ? '✅' : '❌'} la règle alimente l'assistant avec sa source`);
    if (!alimente) echecs++;

    await attendu('désactivation', 200, async r => {
        await polCtrl.updatePolicy({ params: { id: regle.id }, body: { active: false }, user }, r);
        if (r.statut === null) r.statut = 200;
    });
    const apresDesactivation = await polCtrl.reglesPourAssistant();
    const retiree = apresDesactivation.length === 0;
    console.log(`  ${retiree ? '✅' : '❌'} une règle inactive n'alimente plus l'assistant`);
    if (!retiree) echecs++;

    await attendu('règle sans titre refusée', 400, r => polCtrl.createPolicy(
        { body: { titre: '', contenu: 'x' }, user }, r));
    await attendu('règle sans contenu refusée', 400, r => polCtrl.createPolicy(
        { body: { titre: 'X', contenu: '' }, user }, r));
    await attendu('catégorie inconnue refusée', 400, r => polCtrl.createPolicy(
        { body: { titre: 'X', contenu: 'y', categorie: 'Bidon' }, user }, r));
    await attendu('règle inexistante en 404', 404, r => polCtrl.updatePolicy(
        { params: { id: '00000000-0000-0000-0000-000000000000' }, body: {}, user }, r));
    await attendu('import sans contenu refusé', 400, r => polCtrl.proposerDepuisDocument(
        { body: {}, user }, r));

    await prisma.policyRule.deleteMany({});

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
    // Les accidents partent avec leur salarié (onDelete: Cascade) ;
    // la suppression explicite couvre le cas d'un essai interrompu.
    await prisma.workAccident.deleteMany({ where: { location: { in: ['Entrepôt A', 'Quai'] } } });
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
