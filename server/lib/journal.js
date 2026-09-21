const crypto = require('crypto');
const prisma = require('../prismaClient');

/**
 * Journal d'audit chaîné.
 *
 * Chaque ligne porte l'empreinte de la précédente. Effacer une ligne, changer
 * un montant ou antidater une consultation rompt la chaîne, et la rupture se
 * voit à la ligne près.
 *
 * **Ce que ça protège, et ce que ça ne protège pas.** Qui détient la base peut
 * recalculer toute la chaîne après une retouche : le chaînage seul n'arrête
 * personne. Il oblige à refaire l'histoire entière plutôt qu'une ligne — et
 * l'ancrage périodique (`ancrer`), recopié hors de la base, rend ce recalcul
 * détectable. C'est la combinaison des deux qui fait une preuve.
 *
 * Trois chemins écrivaient jusqu'ici directement dans la table ; l'un d'eux,
 * `auditTrail`, employait des noms de colonnes que Prisma refuse : ses traces
 * — congés et talents — n'étaient jamais enregistrées, l'échec étant avalé par
 * un `catch`. Tout passe désormais par ici.
 */

/** Valeur de départ de la chaîne, avant la première ligne. */
const GENESE = 'genese';
/** Identifiant du verrou consultatif PostgreSQL qui sérialise les écritures. */
const VERROU = 815160723;
/** Séparateur des champs dans le texte mis en empreinte. */
const SEPARATEUR = '|#|';

const champ = (v) => (v === null || v === undefined ? '' : String(v));

/** Empreinte d'une ligne, calculée sur un texte canonique. */
function empreinteDe(ligne, precedente) {
    const canonique = [
        ligne.numero, new Date(ligne.createdAt).toISOString(), ligne.userId, ligne.action,
        ligne.tableName, ligne.recordId, champ(ligne.oldData), champ(ligne.newData), champ(ligne.ipAddress),
        precedente || GENESE
    ].map(champ).join(SEPARATEUR);
    return crypto.createHash('sha256').update(canonique).digest('hex');
}

/**
 * Écrit une ligne dans la chaîne.
 *
 * Le verrou consultatif évite que deux écritures simultanées se voient
 * attribuer le même rang : sans lui, la chaîne se casserait d'elle-même sous
 * charge, et une rupture sans cause ne vaudrait pas mieux que pas de chaîne.
 */
async function ecrire(donnees) {
    return prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock($1)', VERROU);
        const dernier = await tx.auditLog.findFirst({
            where: { numero: { not: null } },
            orderBy: { numero: 'desc' },
            select: { numero: true, empreinte: true }
        });
        const ligne = {
            userId: champ(donnees.userId) || 'SYSTEM',
            action: champ(donnees.action),
            tableName: champ(donnees.tableName),
            recordId: champ(donnees.recordId) || 'N/A',
            oldData: donnees.oldData ?? null,
            newData: donnees.newData ?? null,
            ipAddress: donnees.ipAddress ?? null,
            createdAt: donnees.createdAt ? new Date(donnees.createdAt) : new Date(),
            numero: (dernier?.numero || 0) + 1
        };
        return tx.auditLog.create({
            data: {
                ...ligne,
                empreintePrecedente: dernier?.empreinte || null,
                empreinte: empreinteDe(ligne, dernier?.empreinte)
            }
        });
    });
}

/**
 * Même chose, sans attendre ni faire échouer l'appelant.
 *
 * Une trace manquée ne doit jamais dégrader le service rendu — mais elle se
 * journalise dans la sortie du serveur, faute de quoi l'absence de trace
 * passerait inaperçue, comme elle l'a fait pour les congés.
 */
function ecrireSansAttendre(donnees) {
    ecrire(donnees).catch((erreur) => console.error('[JOURNAL] Trace non enregistrée :', erreur.message));
}

/**
 * Parcourt la chaîne et signale la première rupture.
 * @returns {Promise<object>} état de la chaîne et des ancrages
 */
async function verifier({ depuisNumero = 0, limite = 100000 } = {}) {
    const lignes = await prisma.auditLog.findMany({
        where: { numero: { gt: depuisNumero } },
        orderBy: { numero: 'asc' },
        take: limite,
        select: {
            id: true, numero: true, empreinte: true, empreintePrecedente: true, createdAt: true,
            userId: true, action: true, tableName: true, recordId: true, oldData: true, newData: true, ipAddress: true
        }
    });
    // Les lignes écrites avant la mise en place du chaînage n'en portent pas :
    // elles ne sont ni vérifiables, ni suspectes.
    const nonChainees = await prisma.auditLog.count({ where: { numero: null } });

    let rupture = null;
    let precedente = lignes[0]?.empreintePrecedente || null;
    let attendu = lignes[0]?.numero ?? null;

    for (const ligne of lignes) {
        const motif = ligne.numero !== attendu
            ? 'MANQUANTE'
            : ligne.empreintePrecedente !== precedente
                ? 'CHAINE_ROMPUE'
                : empreinteDe(ligne, ligne.empreintePrecedente) !== ligne.empreinte
                    ? 'LIGNE_MODIFIEE'
                    : null;
        if (motif) {
            rupture = { motif, numero: ligne.numero, attendu, le: ligne.createdAt, table: ligne.tableName };
            break;
        }
        precedente = ligne.empreinte;
        attendu = ligne.numero + 1;
    }

    // Les ancrages antérieurs à la plage examinée ne s'y vérifient pas : les
    // contrôler quand même ferait porter à cette vérification le poids de
    // lignes qu'on n'a pas lues.
    const ancrages = await prisma.ancrageAudit.findMany({
        where: { numero: { gt: depuisNumero } },
        orderBy: { ancreLe: 'desc' },
        take: 50
    });
    const rompus = [];
    for (const ancrage of ancrages) {
        const ligne = await prisma.auditLog.findUnique({ where: { numero: ancrage.numero }, select: { empreinte: true } });
        if (!ligne || ligne.empreinte !== ancrage.empreinte) {
            rompus.push({
                numero: ancrage.numero,
                ancreLe: ancrage.ancreLe,
                motif: ligne ? 'EMPREINTE_DIFFERENTE' : 'LIGNE_DISPARUE'
            });
        }
    }

    return {
        chainees: lignes.length,
        nonChainees,
        intacte: rupture === null && rompus.length === 0,
        rupture,
        premiere: lignes[0] ? { numero: lignes[0].numero, le: lignes[0].createdAt } : null,
        derniere: lignes.length ? { numero: lignes[lignes.length - 1].numero, le: lignes[lignes.length - 1].createdAt } : null,
        ancrages: { verifies: ancrages.length, rompus }
    };
}

/** Fige la dernière empreinte connue. À recopier hors de la base. */
async function ancrer(auteur = 'traitement planifié') {
    const dernier = await prisma.auditLog.findFirst({
        where: { numero: { not: null } },
        orderBy: { numero: 'desc' },
        select: { numero: true, empreinte: true }
    });
    if (!dernier) return null;
    const existant = await prisma.ancrageAudit.findFirst({ where: { numero: dernier.numero } });
    if (existant) return existant;
    return prisma.ancrageAudit.create({
        data: { numero: dernier.numero, empreinte: dernier.empreinte, ancrePar: auteur }
    });
}

module.exports = { GENESE, SEPARATEUR, empreinteDe, ecrire, ecrireSansAttendre, verifier, ancrer };
