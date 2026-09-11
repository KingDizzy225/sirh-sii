const prisma = require('../prismaClient');
const { intervalleMois } = require('./paie');

/**
 * Clôture mensuelle de la paie.
 *
 * Relancer la paie d'un mois supprimait ses bulletins et les recréait, sans
 * rien demander. Trois conséquences, aucune visible au moment du clic :
 *
 *  - un bulletin **signé** par le salarié disparaissait, remplacé par un
 *    bulletin non signé ;
 *  - le **lien de retrait** transmis au salarié pointait vers un identifiant
 *    effacé et répondait « Bulletin introuvable » ;
 *  - la **déclaration** déjà déposée ne correspondait plus à aucun bulletin
 *    conservé.
 *
 * Deux mécanismes y répondent :
 *
 *  - **la clôture** fige un mois : la paie ne s'y relance plus. La rouvrir est
 *    possible, mais réservé à l'administration, motivé et daté — c'est la voie
 *    du bulletin rectificatif ;
 *  - **l'archivage** conserve tout bulletin remplacé, avec son PDF et sa
 *    signature, et les liens déjà transmis continuent de mener au document
 *    que le salarié a effectivement reçu.
 */

/** Longueur minimale du motif de réouverture : « erreur » ne dit rien. */
const MOTIF_REOUVERTURE_MIN = 15;

const cleMois = (periode) => intervalleMois(periode).libelle;

/**
 * État d'un mois. La clôture est un historique d'événements, non un drapeau :
 * un mois rouvert puis clôturé de nouveau garde la trace des deux passages.
 */
async function etat(periode, client = prisma) {
    const cle = cleMois(periode);
    const historique = await client.cloturePaie.findMany({
        where: { periode: cle },
        orderBy: { clotureLe: 'desc' }
    });
    const derniere = historique[0] || null;
    return {
        periode: cle,
        cloturee: Boolean(derniere && !derniere.reouvertLe),
        derniere,
        historique
    };
}

/** Mois clôturés parmi une liste de périodes, pour refuser d'un coup. */
async function moisClotures(periodes) {
    const cles = [...new Set(periodes.map(cleMois))];
    const etats = await Promise.all(cles.map((c) => etat(c)));
    return etats.filter((e) => e.cloturee);
}

/**
 * Ce qui empêche de clôturer, et ce qui mérite d'être vu avant.
 *
 * Bloquant : ce qui rendrait la clôture fausse — aucun bulletin, ou des
 * bulletins sans décomposition qui sortiraient à zéro dans la déclaration.
 * Avertissement : ce qui peut être voulu — un salarié actif sans bulletin
 * (entrée en fin de mois, absence longue), un bulletin sans PDF.
 */
async function controler(periode) {
    const mois = intervalleMois(periode);
    const [fiches, actifs] = await Promise.all([
        prisma.payroll.findMany({
            where: { period: { gte: mois.gte, lt: mois.lt } },
            select: { id: true, employeeId: true, grossSalary: true, netSalary: true, pdfPath: true }
        }),
        prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' }, hireDate: { lt: mois.lt } },
            select: { id: true, firstName: true, lastName: true }
        })
    ]);

    const bloquantes = [];
    const avertissements = [];

    if (fiches.length === 0) {
        bloquantes.push(`Aucun bulletin sur ${mois.libelle} : la paie n'a pas été lancée.`);
    }
    const sansDetail = fiches.filter((f) => f.grossSalary == null).length;
    if (sansDetail > 0) {
        bloquantes.push(`${sansDetail} bulletin(s) sans décomposition des cotisations : `
            + 'ils seraient déclarés à zéro. Relancer la paie avant de clôturer.');
    }

    const payes = new Set(fiches.map((f) => f.employeeId));
    const oublies = actifs.filter((s) => !payes.has(s.id));
    if (oublies.length > 0) {
        const noms = oublies.slice(0, 8).map((s) => `${s.firstName} ${s.lastName}`).join(', ');
        avertissements.push(`${oublies.length} salarié(s) actif(s) sans bulletin : ${noms}`
            + (oublies.length > 8 ? '…' : '.'));
    }
    const sansPdf = fiches.filter((f) => !f.pdfPath).length;
    if (sansPdf > 0) {
        avertissements.push(`${sansPdf} bulletin(s) sans PDF : ils ne pourront pas être remis par lien.`);
    }

    return {
        periode: mois.libelle,
        effectif: fiches.length,
        masseBrute: fiches.reduce((s, f) => s + (f.grossSalary || 0), 0),
        netTotal: fiches.reduce((s, f) => s + (f.netSalary || 0), 0),
        bloquantes,
        avertissements
    };
}

/**
 * Conserve un bulletin avant qu'une relance ne le remplace.
 *
 * Les liens déjà transmis suivent le document **remis**, non son remplaçant :
 * rediriger en silence vers un autre montant ferait lire au salarié un
 * bulletin qu'on ne lui a jamais remis. Le QR du bulletin remplacé cesse, lui,
 * de le certifier : une banque qui le scanne doit apprendre qu'il a été
 * rectifié.
 */
async function archiverBulletin(ancien, auteur) {
    // La signature (une image) ne sert qu'au PDF, déjà conservé tel quel.
    // eslint-disable-next-line no-unused-vars
    const { signature, employee, ...donnees } = ancien;

    const archive = await prisma.bulletinRemplace.create({
        data: {
            payrollIdOrigine: ancien.id,
            employeeId: ancien.employeeId,
            periode: ancien.period,
            donnees: JSON.parse(JSON.stringify(donnees)),
            pdfPath: ancien.pdfPath || null,
            signeLe: ancien.signedAt || null,
            remplacePar: auteur || null
        }
    });

    const liens = await prisma.remiseDocument.updateMany({
        where: { sourceType: 'BULLETIN', sourceId: ancien.id },
        data: { sourceType: 'BULLETIN_REMPLACE', sourceId: archive.id }
    });

    await prisma.issuedDocument.updateMany({
        where: { type: 'BULLETIN_PAIE', sourceId: ancien.id, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'Remplacé par un bulletin rectificatif.' }
    });

    return { archive, liensSuivis: liens.count };
}

module.exports = {
    MOTIF_REOUVERTURE_MIN, cleMois, etat, moisClotures, controler, archiverBulletin
};
