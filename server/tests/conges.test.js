#!/usr/bin/env node
/**
 * Essai d'intégration : compteurs de congés, dossiers administratifs, corbeille
 * et guichet WhatsApp.
 *
 *   createdb sirh_essai
 *   DATABASE_URL="postgresql://user@localhost:5432/sirh_essai" npm run test:conges
 *
 * Ce que ces contrôles protègent :
 *
 *  - Le solde de congés était un forfait de 30 jours posé par le schéma, que ni
 *    la création ni l'import ne renseignaient. Il est valorisé en francs au
 *    départ du salarié : un compteur faux est une somme fausse.
 *  - L'export déclaratif reprenait l'identifiant technique du salarié comme
 *    matricule — un UUID que la CNPS ne reconnaît pas.
 *  - Supprimer un salarié efface une trentaine de tables en cascade. La copie
 *    prise avant suppression doit pouvoir tout rendre.
 *  - L'adresse du webhook WhatsApp est publique : sans vérification de
 *    signature, un tiers pourrait poser un congé au nom d'un salarié.
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

const conges = require(path.join(racine, 'lib', 'conges'));
const dossier = require(path.join(racine, 'lib', 'dossier'));
const corbeille = require(path.join(racine, 'lib', 'corbeille'));
const passerelle = require(path.join(racine, 'lib', 'whatsapp'));
const employeeController = require(path.join(racine, 'controllers', 'employeeController'));

let echecs = 0;
let controles = 0;

const verifier = (libelle, condition, detail = '') => {
    controles++;
    if (condition) {
        console.log(`  ✅ ${libelle}`);
    } else {
        echecs++;
        console.log(`  ❌ ${libelle}${detail ? ` — ${detail}` : ''}`);
    }
};

const egal = (libelle, obtenu, attendu) =>
    verifier(libelle, obtenu === attendu, `obtenu ${JSON.stringify(obtenu)}, attendu ${JSON.stringify(attendu)}`);

const faireRes = () => {
    const r = { statut: 200, corps: null };
    r.status = (c) => { r.statut = c; return r; };
    r.json = (d) => { r.corps = d; return r; };
    r.send = (d) => { r.corps = d; return r; };
    r.sendStatus = (c) => { r.statut = c; return r; };
    r.header = () => r; r.attachment = () => r;
    return r;
};

const marque = `essai-conges-${Date.now()}`;
const courriel = (suffixe) => `${marque}.${suffixe}@essai.local`;

async function main() {
    const ref = new Date('2026-09-07T12:00:00Z');

    // ---------------------------------------------------------------
    console.log('\n▸ Calcul des droits à congés\n');

    egal('Aucun mois révolu le jour de l\'embauche',
        conges.soldeOuverture({ hireDate: ref, reference: ref }).solde, 0);

    egal('Sept mois d\'ancienneté valent 15,4 jours',
        conges.soldeOuverture({ hireDate: '2026-01-15', reference: ref }).solde, 15.4);

    // Le défaut d'origine : 30 jours crédités d'emblée. Un salarié arrivé
    // depuis trois mois ne doit jamais s'en approcher.
    verifier('Trois mois d\'ancienneté restent loin des 30 jours du forfait',
        conges.soldeOuverture({ hireDate: '2026-06-07', reference: ref }).solde < 10);

    // Compter depuis l'embauche donnerait 303 jours à un ancien de dix ans,
    // que le plafond ramènerait à 60 — un nombre inventé.
    verifier('Un ancien de dix ans n\'est pas calculé depuis son embauche',
        conges.soldeOuverture({ hireDate: '2015-03-01', reference: ref }).solde < 25);

    egal('Le mois n\'est acquis que s\'il est révolu',
        conges.moisRevolus('2026-08-20', new Date('2026-09-05')), 0);

    egal('Majoration d\'ancienneté à dix ans', conges.majorationAnciennete('2015-03-01', ref), 2);
    egal('Aucune majoration avant cinq ans', conges.majorationAnciennete('2024-03-01', ref), 0);
    egal('Deux enfants à charge, mère : quatre jours',
        conges.majorationEnfants({ gender: 'Femme', childrenCount: 2 }), 4);
    egal('Genre non renseigné : aucune majoration supposée',
        conges.majorationEnfants({ gender: null, childrenCount: 2 }), 0);

    const repris = conges.soldeOuverture({ hireDate: '2015-03-01', soldeRepris: 12.5, reference: ref });
    egal('Un solde repris fait foi', repris.solde, 12.5);
    egal('...et son origine est tracée', repris.source, 'REPRISE');
    egal('Un solde repris à zéro n\'est pas confondu avec une absence de valeur',
        conges.soldeOuverture({ hireDate: '2015-03-01', soldeRepris: 0, reference: ref }).solde, 0);

    verifier('Les congés déjà pris sont déduits',
        conges.soldeOuverture({ hireDate: '2026-01-15', joursPris: 5, reference: ref }).solde === 10.4);

    verifier('Le solde ne devient jamais négatif',
        conges.soldeOuverture({ hireDate: '2026-01-15', joursPris: 99, reference: ref }).solde === 0);

    // ---------------------------------------------------------------
    console.log('\n▸ Création d\'un salarié\n');

    const req = (corps, params = {}, user = { email: 'rh@essai.local' }) =>
        ({ body: corps, params, query: {}, user });

    let res = faireRes();
    await employeeController.createEmployee(req({
        firstName: 'Awa', lastName: marque, email: courriel('awa'),
        department: 'Production', positionTitle: 'Opératrice',
        hireDate: '2026-05-01', gender: 'Femme', childrenCount: 1,
        matricule: `${marque}-001`, cnpsNumber: '1234567890',
        bankName: 'NSIA', bankAccount: 'CI0010001'
    }), res);
    egal('Création acceptée', res.statut, 201);

    const awa = res.corps;
    verifier('Le solde n\'est plus le forfait de 30 jours', awa && awa.annualLeaveBalance !== 30,
        `solde ${awa && awa.annualLeaveBalance}`);
    verifier('Le solde est celui du calcul', awa && awa.annualLeaveBalance > 0 && awa.annualLeaveBalance < 15,
        `solde ${awa && awa.annualLeaveBalance}`);
    egal('L\'origine du solde est enregistrée', awa && awa.leaveBalanceSource, 'CALCUL');
    egal('Le dossier administratif est enregistré', awa && awa.cnpsNumber, '1234567890');

    res = faireRes();
    await employeeController.createEmployee(req({
        firstName: 'Koffi', lastName: marque, email: courriel('koffi'),
        department: 'Production', positionTitle: 'Chef d\'équipe',
        hireDate: '2019-02-01', soldeRepris: 17
    }), res);
    egal('Création avec solde repris acceptée', res.statut, 201);
    egal('Le solde repris est conservé tel quel', res.corps && res.corps.annualLeaveBalance, 17);
    egal('...et marqué comme repris', res.corps && res.corps.leaveBalanceSource, 'REPRISE');
    const koffi = res.corps;

    // Le matricule est désormais unique : un doublon doit être refusé pour ce
    // qu'il est, et non présenté comme un email en double.
    res = faireRes();
    await employeeController.createEmployee(req({
        firstName: 'Doublon', lastName: marque, email: courriel('doublon'),
        department: 'Production', positionTitle: 'Opérateur',
        matricule: `${marque}-001`
    }), res);
    egal('Un matricule en double est refusé', res.statut, 400);
    verifier('...et le message désigne le matricule',
        /matricule/i.test((res.corps && res.corps.error) || ''), res.corps && res.corps.error);

    // ---------------------------------------------------------------
    console.log('\n▸ Import en masse\n');

    res = faireRes();
    await employeeController.importBulkEmployees(req({
        employees: [
            { prenom: 'Mariam', nom: marque, email: courriel('mariam'),
              'date d\'embauche': '2026-03-01', 'solde congés': '9,5',
              matricule: `${marque}-010`, cnps: '9988776655' },
            { prenom: 'Yao', nom: marque, email: courriel('yao'),
              'date d\'embauche': '2026-03-01' }
        ]
    }), res);
    egal('Import accepté', res.statut, 201);
    egal('Deux salariés importés', res.corps && res.corps.count, 2);
    egal('Un solde repris du fichier', res.corps && res.corps.soldes.repris, 1);
    egal('Un solde calculé', res.corps && res.corps.soldes.calcules, 1);

    const mariam = await prisma.employee.findUnique({ where: { email: courriel('mariam') } });
    egal('Le solde du fichier est repris, virgule comprise', mariam.annualLeaveBalance, 9.5);
    egal('Le matricule du fichier est repris', mariam.matricule, `${marque}-010`);
    const yao = await prisma.employee.findUnique({ where: { email: courriel('yao') } });
    verifier('Le salarié sans solde au fichier n\'hérite pas de 30 jours',
        yao.annualLeaveBalance !== 30, `solde ${yao.annualLeaveBalance}`);

    // ---------------------------------------------------------------
    console.log('\n▸ Conformité des dossiers\n');

    const bilan = dossier.synthese([
        { id: 'a', firstName: 'A', lastName: 'A', matricule: 'M1', cnpsNumber: '1',
          birthDate: new Date(), nationality: 'Ivoirienne', contractType: 'CDI', bankAccount: 'X' },
        { id: 'b', firstName: 'B', lastName: 'B', matricule: null, cnpsNumber: null,
          birthDate: null, nationality: null, contractType: null, bankAccount: null }
    ]);
    egal('Un dossier complet est compté comme tel', bilan.complets, 1);
    egal('Un dossier sans matricule ni CNPS n\'est pas déclarable', bilan.nonDeclarables, 1);
    verifier('Chaque mention manquante dit ce qu\'elle empêche',
        bilan.parMention.every((m) => typeof m.pourquoi === 'string' && m.pourquoi.length > 20));

    res = faireRes();
    await employeeController.getConformite(req({}), res);
    verifier('L\'écran de conformité répond', res.corps && Array.isArray(res.corps.salaries));
    verifier('...et voit le salarié importé sans matricule',
        res.corps.salaries.some((s) => s.nom.includes(marque) && !s.declarable));

    // ---------------------------------------------------------------
    console.log('\n▸ Export déclaratif\n');

    const { exportSage } = require(path.join(racine, 'controllers', 'payrollController'));
    // Période distincte de celles des autres essais (2026-08) : ces contrôles
    // portent sur le refus d'un export incomplet, et un bulletin laissé par un
    // essai précédent y ferait entrer un salarié qui n'est pas le nôtre.
    await prisma.payroll.create({
        data: {
            employeeId: yao.id, period: new Date('2026-11-01'),
            baseSalary: 300000, netSalary: 250000, status: 'APPROVED'
        }
    });

    res = faireRes();
    await exportSage({ query: { period: '2026-11' }, user: { email: 'rh@essai.local' } }, res);
    egal('L\'export refuse un fichier que la CNPS rejetterait', res.statut, 409);
    verifier('...en nommant les salariés à compléter',
        res.corps && Array.isArray(res.corps.salaries) && res.corps.salaries.length > 0);

    await prisma.employee.update({
        where: { id: yao.id },
        data: { matricule: `${marque}-020`, cnpsNumber: '5544332211' }
    });
    res = faireRes();
    await exportSage({ query: { period: '2026-11' }, user: { email: 'rh@essai.local' } }, res);
    verifier('Une fois le dossier complet, l\'export produit le fichier',
        typeof res.corps === 'string' && res.corps.includes('MATRICULE'));
    verifier('...avec le vrai matricule, non l\'identifiant technique',
        typeof res.corps === 'string' && res.corps.includes(`${marque}-020`) && !res.corps.includes(yao.id),
        'la colonne MATRICULE reprenait auparavant l\'UUID du salarié');

    // ---------------------------------------------------------------
    console.log('\n▸ Corbeille\n');

    // Un dossier avec de quoi être perdu : une paie, un congé, un subordonné.
    await prisma.leave.create({
        data: {
            employeeId: koffi.id, type: 'Congé Annuel',
            startDate: new Date('2026-07-01'), endDate: new Date('2026-07-05'),
            durationDays: 5, status: 'APPROVED'
        }
    });
    await prisma.payroll.create({
        data: {
            employeeId: koffi.id, period: new Date('2026-07-01'),
            baseSalary: 450000, netSalary: 380000, status: 'PAID'
        }
    });
    await prisma.employee.update({ where: { id: awa.id }, data: { managerId: koffi.id } });

    res = faireRes();
    await employeeController.deleteEmployee(req({}, { id: koffi.id }), res);
    egal('Suppression effectuée', res.statut, 204);
    egal('Le salarié a bien disparu de l\'effectif',
        await prisma.employee.count({ where: { id: koffi.id } }), 0);
    egal('Sa paie aussi', await prisma.payroll.count({ where: { employeeId: koffi.id } }), 0);

    res = faireRes();
    await employeeController.getCorbeille(req({}), res);
    const entree = res.corps.dossiers.find((d) => d.employeeId === koffi.id);
    verifier('Le dossier figure dans la corbeille', Boolean(entree));
    verifier('...avec le nombre de lignes qu\'il emportait', entree && entree.relatedCount >= 2,
        entree && `relatedCount = ${entree.relatedCount}`);
    verifier('...et le délai restant avant purge', entree && entree.joursRestants > 0);
    verifier('...et l\'auteur de la suppression', entree && entree.deletedBy === 'rh@essai.local');

    res = faireRes();
    await employeeController.restoreEmployee(req({}, { id: entree.id }), res);
    verifier('Restauration acceptée', res.statut === 200, JSON.stringify(res.corps));
    egal('Aucune ligne perdue', (res.corps.echecs || []).length, 0);
    egal('Le salarié est revenu', await prisma.employee.count({ where: { id: koffi.id } }), 1);
    egal('Sa paie est revenue', await prisma.payroll.count({ where: { employeeId: koffi.id } }), 1);
    egal('Son congé est revenu', await prisma.leave.count({ where: { employeeId: koffi.id } }), 1);

    const rattache = await prisma.employee.findUnique({ where: { id: awa.id } });
    egal('Son subordonné lui est rendu', rattache.managerId, koffi.id);

    const restaure = await prisma.employee.findUnique({ where: { id: koffi.id } });
    egal('Son solde de congés est intact', restaure.annualLeaveBalance, 17);

    res = faireRes();
    await employeeController.restoreEmployee(req({}, { id: entree.id }), res);
    egal('Une seconde restauration est refusée', res.statut, 409);

    // ---------------------------------------------------------------
    console.log('\n▸ Guichet WhatsApp\n');

    const secretInitial = process.env.WHATSAPP_APP_SECRET;
    process.env.WHATSAPP_APP_SECRET = 'secret-essai';
    const corps = Buffer.from(JSON.stringify({ entry: [] }));
    const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', 'secret-essai').update(corps).digest('hex');

    verifier('Une signature valide est acceptée', passerelle.signatureValide(corps, signature));
    verifier('Une signature falsifiée est refusée',
        !passerelle.signatureValide(corps, 'sha256=' + '0'.repeat(64)));
    verifier('Une requête sans signature est refusée', !passerelle.signatureValide(corps, null));
    verifier('Un corps modifié invalide la signature',
        !passerelle.signatureValide(Buffer.from('{"entry":[{}]}'), signature));

    process.env.WHATSAPP_APP_SECRET = '';
    verifier('Sans secret configuré, aucune signature n\'est acceptée',
        !passerelle.signatureValide(corps, signature),
        'un guichet non configuré ne doit pas accepter n\'importe quel appel');
    process.env.WHATSAPP_APP_SECRET = secretInitial || '';

    const messages = passerelle.extraireMessages({
        entry: [{ changes: [{ value: {
            messages: [
                { id: 'wamid.1', from: '2250102030405', type: 'text', text: { body: '!solde' } },
                { id: 'wamid.2', from: '2250102030405', type: 'image' }
            ]
        } }] }]
    });
    egal('Les messages entrants sont extraits', messages.length, 2);
    egal('Le texte est lu', messages[0].texte, '!solde');
    egal('Une image n\'a pas de texte', messages[1].texte, null);

    const etat = passerelle.etatConfiguration();
    verifier('L\'état du raccordement distingue réception et envoi',
        typeof etat.receptionActive === 'boolean' && typeof etat.envoiActif === 'boolean');

    // Réception refusée tant que la signature ne peut pas être vérifiée : sans
    // ce refus, l'URL étant publique, un tiers poserait des congés.
    const whatsappController = require(path.join(racine, 'controllers', 'whatsappController'));
    res = faireRes();
    await whatsappController.recevoirWebhook(
        { rawBody: corps, body: { entry: [] }, get: () => null }, res);
    egal('Un appel non signé au webhook est rejeté', res.statut, 403);
}

async function nettoyer() {
    const salaries = await prisma.employee.findMany({
        where: { lastName: { contains: marque } }, select: { id: true, email: true }
    });
    for (const s of salaries) {
        await prisma.payroll.deleteMany({ where: { employeeId: s.id } });
        await prisma.leave.deleteMany({ where: { employeeId: s.id } });
        await prisma.onboardingTask.deleteMany({ where: { employeeId: s.id } });
        await prisma.notification.deleteMany({ where: { employeeId: s.id } });
    }
    await prisma.employee.updateMany({
        where: { managerId: { in: salaries.map((s) => s.id) } }, data: { managerId: null }
    });
    await prisma.employee.deleteMany({ where: { lastName: { contains: marque } } });
    await prisma.user.deleteMany({ where: { email: { contains: marque } } });
    await prisma.deletedEmployee.deleteMany({ where: { lastName: { contains: marque } } });
}

main()
    .catch((e) => { echecs++; console.error('\n❌ Interruption :', e.message, '\n', e.stack); })
    .finally(async () => {
        await nettoyer().catch((e) => console.error('Nettoyage incomplet :', e.message));
        await prisma.$disconnect();
        console.log(`\n${controles} contrôle(s), ${echecs} échec(s).\n`);
        process.exit(echecs > 0 ? 1 : 0);
    });
