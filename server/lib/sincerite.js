const prisma = require('../prismaClient');

/**
 * Contrôles de sincérité de l'effectif.
 *
 * `lib/dossier.js` vérifie que les mentions obligatoires sont **renseignées**,
 * jamais qu'elles sont **cohérentes entre elles**. Rien n'empêchait donc :
 *
 *  - deux salariés de partager un compte bancaire ou un numéro de téléphone ;
 *  - un numéro CNPS d'être porté par deux dossiers ;
 *  - un salarié d'être payé pendant des mois sans un seul pointage, congé ou
 *    document — le « salarié fantôme » ;
 *  - un salarié dont la sortie est datée de rester actif, donc payable.
 *
 * Aucun de ces constats n'est une accusation : un ménage peut partager un
 * compte, un salarié sédentaire ne pointe pas. Ils désignent ce qui mérite
 * d'être regardé, avec de quoi le lever d'un coup d'œil.
 */

const MOIS_SANS_ACTIVITE = parseInt(process.env.SINCERITE_MOIS_SANS_ACTIVITE || '3', 10);

/** Comparaison utile : les espaces, points et tirets d'un RIB ne font pas deux comptes. */
const normaliser = (v) => String(v || '').replace(/[\s.\-/]/g, '').toUpperCase();

const nommer = (s) => `${s.lastName} ${s.firstName}`.trim();

/** Salariés partageant une même valeur, hors valeurs vides. */
function doublons(salaries, champ) {
    const groupes = new Map();
    for (const s of salaries) {
        const cle = normaliser(s[champ]);
        if (!cle) continue;
        if (!groupes.has(cle)) groupes.set(cle, []);
        groupes.get(cle).push(s);
    }
    return [...groupes.entries()]
        .filter(([, liste]) => liste.length > 1)
        .map(([cle, liste]) => ({ valeur: cle, salaries: liste }));
}

async function controler(reference = new Date()) {
    const salaries = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' } },
        select: {
            id: true, firstName: true, lastName: true, department: true, positionTitle: true,
            matricule: true, cnpsNumber: true, bankAccount: true, bankName: true, phone: true,
            hireDate: true, exitDate: true, status: true
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    const controles = [];
    const ajouter = (gravite, code, libelle, detail, concernes) => controles.push({
        gravite, code, libelle, detail,
        salaries: concernes.map((s) => ({ id: s.id, nom: nommer(s), service: s.department }))
    });

    // --- Doublons entre dossiers ---
    for (const groupe of doublons(salaries, 'bankAccount')) {
        ajouter('alerte', 'COMPTE_PARTAGE',
            `${groupe.salaries.length} salariés déclarent le même compte bancaire`,
            'Un virement de paie partirait plusieurs fois vers le même compte. '
            + 'Légitime entre conjoints, à vérifier sinon.',
            groupe.salaries);
    }
    for (const groupe of doublons(salaries, 'cnpsNumber')) {
        ajouter('alerte', 'CNPS_DUPLIQUE',
            `${groupe.salaries.length} salariés portent le même numéro CNPS`,
            'La déclaration sociale serait rejetée, ou imputée à la mauvaise personne.',
            groupe.salaries);
    }
    for (const groupe of doublons(salaries, 'matricule')) {
        ajouter('alerte', 'MATRICULE_DUPLIQUE',
            `${groupe.salaries.length} salariés portent le même matricule`,
            'Les écritures comptables et les exports se confondraient.',
            groupe.salaries);
    }
    for (const groupe of doublons(salaries, 'phone')) {
        ajouter('avertissement', 'TELEPHONE_PARTAGE',
            `${groupe.salaries.length} salariés déclarent le même téléphone`,
            'Le guichet WhatsApp identifie le salarié par son numéro : il répondrait '
            + "au premier dossier trouvé, et l'autre n'aurait jamais de réponse.",
            groupe.salaries);
    }

    // --- Sortie datée mais dossier encore actif ---
    const sortisActifs = salaries.filter((s) => s.exitDate && new Date(s.exitDate) < reference);
    if (sortisActifs.length > 0) {
        ajouter('alerte', 'SORTI_ENCORE_ACTIF',
            `${sortisActifs.length} salarié(s) ont une date de sortie passée mais un dossier actif`,
            'Ils restent proposés à la paie et comptés dans l’effectif.',
            sortisActifs);
    }

    // --- Payés sans coordonnées bancaires ---
    const identifiants = salaries.map((s) => s.id);
    const debutFenetre = new Date(Date.UTC(
        reference.getUTCFullYear(), reference.getUTCMonth() - MOIS_SANS_ACTIVITE, 1
    ));

    const [paiements, pointages, conges, absences, documents] = await Promise.all([
        prisma.payroll.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, period: { gte: debutFenetre } },
            _count: { _all: true }
        }),
        prisma.timeLog.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, timestamp: { gte: debutFenetre } },
            _count: { _all: true }
        }),
        prisma.leave.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, endDate: { gte: debutFenetre } },
            _count: { _all: true }
        }),
        prisma.absence.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, date: { gte: debutFenetre } },
            _count: { _all: true }
        }),
        prisma.employeeDocument.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, createdAt: { gte: debutFenetre } },
            _count: { _all: true }
        })
    ]);

    const ensemble = (groupes) => new Set(groupes.map((g) => g.employeeId));
    const payes = ensemble(paiements);
    const actifs = new Set([
        ...ensemble(pointages), ...ensemble(conges), ...ensemble(absences), ...ensemble(documents)
    ]);

    const payesSansCompte = salaries.filter((s) => payes.has(s.id) && !normaliser(s.bankAccount));
    if (payesSansCompte.length > 0) {
        ajouter('avertissement', 'PAYE_SANS_COMPTE',
            `${payesSansCompte.length} salarié(s) payé(s) sans coordonnées bancaires au dossier`,
            'Le paiement se fait donc hors de l’application, sans trace vérifiable.',
            payesSansCompte);
    }

    const fantomes = salaries.filter((s) => payes.has(s.id) && !actifs.has(s.id));
    if (fantomes.length > 0) {
        ajouter('alerte', 'SANS_TRACE_ACTIVITE',
            `${fantomes.length} salarié(s) payé(s) sans aucune trace d’activité depuis ${MOIS_SANS_ACTIVITE} mois`,
            'Ni pointage, ni congé, ni absence, ni document déposé. À confirmer poste par poste : '
            + 'un salarié sédentaire peut ne jamais pointer.',
            fantomes);
    }

    const alertes = controles.filter((c) => c.gravite === 'alerte');
    return {
        controleLe: reference,
        effectif: salaries.length,
        fenetreMois: MOIS_SANS_ACTIVITE,
        controles,
        resume: {
            alertes: alertes.length,
            avertissements: controles.length - alertes.length,
            salariesConcernes: new Set(controles.flatMap((c) => c.salaries.map((s) => s.id))).size
        }
    };
}

module.exports = { controler, doublons, normaliser, MOIS_SANS_ACTIVITE };
