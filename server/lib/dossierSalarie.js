const PDFDocument = require('pdfkit');
const prisma = require('../prismaClient');
const identite = require('./identite');

/**
 * Dossier complet d'un salarié, pour le droit d'accès.
 *
 * La loi ivoirienne n° 2013-450 ouvre à chacun un droit d'accès aux données
 * qui le concernent. Jusqu'ici, y répondre imposait de parcourir à la main une
 * quarantaine de tables : personne ne l'aurait fait dans les délais, et un
 * dossier incomplet vaut refus.
 *
 * **Ce que l'export contient** : tout ce que la base sait de la personne, y
 * compris qui a consulté son dossier et quand.
 *
 * **Ce qu'il ne contient pas**, et le dit :
 *  - les fichiers eux-mêmes — bulletins, pièces, certificats — qui se
 *    remettent par les liens de remise ; seule leur liste figure ici ;
 *  - les conclusions médicales rédigées par le médecin du travail : leur
 *    communication relève de lui, pas du service des ressources humaines ;
 *  - les appréciations nominatives d'autres salariés le concernant, lorsque
 *    les livrer reviendrait à livrer les données d'un tiers.
 */

const AVERTISSEMENT = "Cet état rassemble les données détenues par le système d'information RH au sujet de la "
    + 'personne nommée. Les fichiers (bulletins, pièces, certificats) ne sont pas incorporés : seule leur liste '
    + "figure ici, et ils se remettent par lien. Les conclusions du médecin du travail en sont exclues : leur "
    + 'communication relève de lui.';

const jour = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
const mois = (d) => (d ? new Date(d).toISOString().slice(0, 7) : null);

/** Rassemble le dossier. Une section vide reste vide : rien n'est inventé. */
async function rassembler(employeeId) {
    const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!salarie) return null;

    const [
        payrolls, leaves, absences, timeLogs, documents, pieces, prets, avances,
        participations, kudosRecus, kudosEnvoyes, badges, remises, emis, situations,
        carriere, remunerations, procedures, visites, notifications, acces, cdd, preAccueil
    ] = await Promise.all([
        prisma.payroll.findMany({ where: { employeeId }, orderBy: { period: 'asc' } }),
        prisma.leave.findMany({ where: { employeeId }, orderBy: { startDate: 'asc' } }),
        prisma.absence.findMany({ where: { employeeId }, orderBy: { date: 'asc' } }),
        prisma.timeLog.findMany({ where: { employeeId }, orderBy: { timestamp: 'asc' } }),
        prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { createdAt: 'asc' } }),
        prisma.pieceSalarie.findMany({ where: { employeeId }, orderBy: { createdAt: 'asc' } }),
        prisma.pret.findMany({ where: { employeeId }, orderBy: { accordeLe: 'asc' } }),
        prisma.salaryAdvance.findMany({ where: { employeeId }, orderBy: { requestedAt: 'asc' } }),
        prisma.trainingParticipation.findMany({ where: { employeeId }, include: { session: true } }),
        prisma.kudo.findMany({ where: { receiverId: employeeId }, include: { sender: { select: { firstName: true } } } }),
        prisma.kudo.findMany({ where: { senderId: employeeId }, include: { receiver: { select: { firstName: true } } } }),
        prisma.badgeSalarie.findMany({ where: { employeeId }, orderBy: { emisLe: 'asc' } }),
        prisma.remiseDocument.findMany({ where: { employeeId }, orderBy: { remisLe: 'asc' } }),
        prisma.issuedDocument.findMany({ where: { employeeId }, orderBy: { issuedAt: 'asc' } }),
        prisma.situationEmployee.findMany({ where: { employeeId }, orderBy: { effectiveFrom: 'asc' } }).catch(() => []),
        prisma.careerHistory.findMany({ where: { employeeId }, orderBy: { eventDate: 'asc' } }),
        prisma.salaryChange.findMany({ where: { employeeId }, orderBy: { effectiveFrom: 'asc' } }),
        prisma.procedure.findMany({ where: { employeeId }, orderBy: { ouverteLe: 'asc' } }).catch(() => []),
        prisma.medicalVisit.findMany({ where: { employeeId }, orderBy: { visitDate: 'asc' } }).catch(() => []),
        prisma.notification.findMany({ where: { employeeId }, orderBy: { createdAt: 'asc' } }),
        prisma.auditLog.findMany({ where: { recordId: employeeId }, orderBy: { createdAt: 'asc' }, take: 2000 }),
        prisma.periodeCdd.findMany({ where: { employeeId }, orderBy: { debut: 'asc' } }),
        prisma.preAccueil.findUnique({ where: { employeeId } })
    ]);

    const joursPointes = new Set(timeLogs.filter((t) => t.type === 'CLOCK_IN').map((t) => jour(t.timestamp)));

    return {
        avertissement: AVERTISSEMENT,
        genereLe: new Date().toISOString(),
        organisation: identite.nom(),
        identite: {
            nom: `${salarie.firstName} ${salarie.lastName}`,
            email: salarie.email,
            telephone: salarie.phone,
            adresse: salarie.address,
            dateNaissance: jour(salarie.birthDate),
            nationalite: salarie.nationality,
            genre: salarie.gender,
            enfantsACharge: salarie.childrenCount,
            matricule: salarie.matricule,
            numeroCnps: salarie.cnpsNumber,
            banque: salarie.bankName,
            compteBancaire: salarie.bankAccount
        },
        contrat: {
            fonction: salarie.positionTitle,
            departement: salarie.department,
            type: salarie.contractType,
            dateEmbauche: jour(salarie.hireDate),
            finPeriodeEssai: jour(salarie.trialPeriodEndDate),
            finContrat: jour(salarie.contractEndDate),
            dateSortie: jour(salarie.exitDate),
            statut: salarie.status,
            periodesCdd: cdd.map((p) => ({ nature: p.nature, debut: jour(p.debut), fin: jour(p.fin), motif: p.motif }))
        },
        remuneration: {
            salaireDeReference: salarie.baseSalary,
            effetAu: jour(salarie.salaryEffectiveFrom),
            decisions: remunerations.map((r) => ({
                effetAu: jour(r.effectiveFrom), montant: r.amount, montantPrecedent: r.previousAmount, motif: r.motif
            }))
        },
        bulletins: payrolls.map((p) => ({
            periode: mois(p.period), brut: p.grossSalary, net: p.netSalary,
            cnpsSalarie: p.cnpsEmployee, its: p.its, statut: p.status
        })),
        conges: {
            soldeActuel: salarie.annualLeaveBalance,
            origineSolde: salarie.leaveBalanceSource,
            demandes: leaves.map((l) => ({
                type: l.type, du: jour(l.startDate), au: jour(l.endDate), jours: l.durationDays, statut: l.status, motif: l.reason
            }))
        },
        absences: absences.map((a) => ({ type: a.type, date: jour(a.date), minutes: a.durationMinutes, statut: a.status })),
        pointages: {
            nombre: timeLogs.length,
            joursPointes: joursPointes.size,
            premier: timeLogs[0] ? timeLogs[0].timestamp : null,
            dernier: timeLogs.length ? timeLogs[timeLogs.length - 1].timestamp : null,
            detail: timeLogs.map((t) => ({
                type: t.type, horodatage: t.timestamp, site: t.workSiteId,
                latitude: t.latitude, longitude: t.longitude, dansPerimetre: t.withinPerimeter
            }))
        },
        formations: participations.map((p) => ({
            intitule: p.session?.title, date: jour(p.session?.date), heures: p.session?.durationHours, statut: p.completionStatus
        })),
        documents: documents.map((d) => ({ titre: d.title, type: d.type, depose: jour(d.createdAt), deposePar: d.uploadedBy, signeLe: jour(d.signedAt) })),
        pieces: pieces.map((p) => ({ type: p.type, reference: p.reference, delivreeLe: jour(p.delivreeLe), expireLe: jour(p.expireLe), statut: p.statut })),
        documentsRemis: remises.map((r) => ({ titre: r.titre, remisLe: jour(r.remisLe), ouvertLe: jour(r.ouvertLe), telechargements: r.telechargements })),
        documentsEmis: emis.map((d) => ({ type: d.type, emisLe: jour(d.issuedAt), signataire: d.signataireNom, revoqueLe: jour(d.revokedAt) })),
        badges: badges.map((b) => ({ emisLe: jour(b.emisLe), expireLe: jour(b.expireLe), revoqueLe: jour(b.revoqueLe), verifications: b.verifications })),
        prets: prets.map((p) => ({ montant: p.montant, mensualite: p.mensualite, motif: p.motif, statut: p.statut, accordeLe: jour(p.accordeLe) })),
        avances: avances.map((a) => ({ montant: a.amount, motif: a.reason, statut: a.status, demandeeLe: jour(a.requestedAt) })),
        reconnaissance: {
            recus: kudosRecus.map((k) => ({ de: k.sender?.firstName || null, categorie: k.category, message: k.message, le: jour(k.createdAt) })),
            envoyes: kudosEnvoyes.map((k) => ({ pour: k.receiver?.firstName || null, categorie: k.category, le: jour(k.createdAt) }))
        },
        carriere: carriere.map((c) => ({ type: c.type, date: jour(c.eventDate), avant: c.previousValue, apres: c.newValue, commentaire: c.comment })),
        situations: situations.map((s) => ({
            fonction: s.positionTitle, departement: s.department, typeContrat: s.contractType,
            statut: s.status, du: jour(s.effectiveFrom), au: jour(s.effectiveTo), source: s.source
        })),
        // Le motif et la sanction figurent ; les pièces du dossier disciplinaire
        // se remettent séparément, comme les autres fichiers.
        procedures: procedures.map((p) => ({ type: p.type, ouverteLe: jour(p.ouverteLe), clotureeLe: jour(p.clotureeLe), statut: p.statut, motif: p.motif })),
        // Dates et aptitude seulement : restrictions, notes et nom du médecin
        // restent chez lui — les livrer ici reviendrait à diffuser un avis
        // médical par le service du personnel.
        visitesMedicales: visites.map((v) => ({ date: jour(v.visitDate), expireLe: jour(v.expiryDate), resultat: v.result })),
        preAccueil: preAccueil ? { creeLe: jour(preAccueil.creeLe), ouvertLe: jour(preAccueil.ouvertLe), ouvertures: preAccueil.ouvertures } : null,
        notifications: notifications.map((n) => ({ le: jour(n.createdAt), message: n.message, lue: n.isRead })),
        acces: acces.map((a) => ({ le: a.createdAt, action: a.action, par: a.userId, ressource: a.tableName }))
    };
}

/** Compte les éléments d'une section, quelle que soit sa forme. */
const compter = (valeur) => {
    if (Array.isArray(valeur)) return valeur.length;
    if (valeur && typeof valeur === 'object') return Object.values(valeur).reduce((t, v) => t + (Array.isArray(v) ? v.length : 0), 0);
    return 0;
};

const SECTIONS = [
    ['bulletins', 'Bulletins de paie'],
    ['conges', 'Congés'],
    ['absences', 'Absences et retards'],
    ['formations', 'Formations'],
    ['documents', 'Documents du dossier'],
    ['pieces', 'Titres et habilitations'],
    ['documentsRemis', 'Documents remis'],
    ['documentsEmis', 'Documents émis (attestations, bulletins scellés)'],
    ['badges', 'Badges numériques'],
    ['prets', 'Prêts'],
    ['avances', 'Avances sur salaire'],
    ['reconnaissance', 'Remerciements'],
    ['carriere', 'Événements de carrière'],
    ['procedures', 'Procédures disciplinaires'],
    ['visitesMedicales', 'Visites médicales (dates et natures)'],
    ['notifications', 'Notifications reçues'],
    ['acces', 'Consultations et modifications du dossier']
];

/**
 * Récapitulatif en PDF : lisible par la personne, avec le détail des sections
 * qui se lisent en quelques lignes. Le fichier JSON reste l'état complet.
 */
function versPdf(dossier) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const titre = (t) => doc.moveDown(0.8).fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text(t);
    const ligne = (t) => doc.fontSize(9.5).fillColor('#1e293b').font('Helvetica').text(t);

    doc.fontSize(17).fillColor('#0f172a').font('Helvetica-Bold').text('Dossier personnel');
    doc.fontSize(10).fillColor('#64748b').font('Helvetica')
        .text(`${dossier.organisation} — état arrêté le ${jour(dossier.genereLe)}`);
    doc.moveDown(0.5).fontSize(8.5).fillColor('#64748b').text(dossier.avertissement, { align: 'justify' });

    titre('Identité');
    for (const [cle, valeur] of Object.entries(dossier.identite)) {
        if (valeur !== null && valeur !== undefined && valeur !== '') ligne(`${cle} : ${valeur}`);
    }

    titre('Contrat');
    for (const [cle, valeur] of Object.entries(dossier.contrat)) {
        if (Array.isArray(valeur)) continue;
        if (valeur !== null && valeur !== undefined && valeur !== '') ligne(`${cle} : ${valeur}`);
    }

    titre('Rémunération');
    ligne(`salaire de référence : ${dossier.remuneration.salaireDeReference ?? 'non renseigné'}`);
    for (const d of dossier.remuneration.decisions) {
        ligne(`${d.effetAu} : ${d.montantPrecedent ?? '—'} → ${d.montant}${d.motif ? ` (${d.motif})` : ''}`);
    }

    titre('Présence');
    ligne(`${dossier.pointages.nombre} pointage(s) sur ${dossier.pointages.joursPointes} journée(s)`);

    titre('Ce que contient le dossier');
    for (const [cle, libelle] of SECTIONS) {
        ligne(`${libelle} : ${compter(dossier[cle])}`);
    }

    doc.moveDown(1).fontSize(8.5).fillColor('#64748b')
        .text("Le détail de chaque section figure dans le fichier de données joint, au format JSON. "
            + "Pour obtenir un document lui-même (bulletin, attestation, pièce), en demander la remise au service "
            + 'des ressources humaines.', { align: 'justify' });
    return doc;
}

module.exports = { AVERTISSEMENT, SECTIONS, rassembler, compter, versPdf };
