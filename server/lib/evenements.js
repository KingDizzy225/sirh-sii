const crypto = require('crypto');
const prisma = require('../prismaClient');

/**
 * Événements sortants (webhooks).
 *
 * L'écran des paramètres proposait trois événements ; un seul était émis,
 * `EMPLOYEE_CREATED`. Un webhook enregistré sur « Paie validée » ou « Demande
 * de congé » ne recevait jamais rien, et rien ne le disait. Trois autres défauts :
 *
 *  - le « secret HMAC » était envoyé **en clair** dans un en-tête : il ne
 *    prouvait rien, et quiconque lisait une requête pouvait le rejouer ;
 *  - une réponse 500 du destinataire était journalisée comme un succès, faute
 *    de contrôler le statut ;
 *  - la création d'un salarié transmettait sa fiche entière — salaire, compte
 *    bancaire, numéro CNPS — à un outil de messagerie.
 *
 * Désormais : un **catalogue** des seuls événements réellement émis, qui sert
 * aussi à l'écran ; une **signature** HMAC-SHA256 du corps ; un délai et un
 * contrôle du statut ; des charges **minimales**, sans rémunération.
 *
 * Vérification côté destinataire : recalculer
 * `sha256=` + HMAC-SHA256(corps brut, secret) et comparer à `X-SIRH-Signature`.
 */

const CATALOGUE = {
    EMPLOYEE_CREATED: { libelle: "Création d'un dossier salarié" },
    LEAVE_REQUESTED: { libelle: 'Demande de congé déposée' },
    LEAVE_DECIDED: { libelle: 'Congé validé ou refusé' },
    // « Paie validée » était proposé sans jamais être émis : les webhooks déjà
    // enregistrés sous ce nom reçoivent la clôture, qui en tient lieu.
    PAYROLL_CLOSED: { libelle: 'Paie du mois clôturée', alias: ['PAYROLL_APPROVED'] },
    CONTRACT_RENEWED: { libelle: 'CDD renouvelé' },
    DOCUMENT_REMIS: { libelle: 'Document remis à un salarié par lien' }
};

const DELAI_MS = parseInt(process.env.WEBHOOK_DELAI_MS || '5000', 10);

/** Signature du corps, telle qu'envoyée dans `X-SIRH-Signature`. */
const signer = (corps, secret) => 'sha256=' + crypto.createHmac('sha256', secret).update(corps).digest('hex');

/** Ce qu'un événement dit d'un salarié : de quoi le reconnaître, rien de plus. */
const salarie = (e) => (e ? {
    id: e.id,
    nom: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
    service: e.department || null,
    poste: e.positionTitle || null
} : null);

/** Types acceptés à l'enregistrement d'un webhook : le catalogue et ses alias. */
const typesAcceptes = () => new Set(Object.entries(CATALOGUE).flatMap(([t, d]) => [t, ...(d.alias || [])]));

async function emettre(type, donnees) {
    const definition = CATALOGUE[type];
    if (!definition) {
        // Un événement hors catalogue serait proposé nulle part et reçu par personne.
        console.error(`[ÉVÉNEMENTS] Type non déclaré au catalogue : ${type}`);
        return { envoyes: 0, echecs: 0 };
    }

    const points = await prisma.webhookEndpoint.findMany({
        where: { eventType: { in: [type, ...(definition.alias || [])] }, isActive: true }
    });
    if (points.length === 0) return { envoyes: 0, echecs: 0 };

    const corps = JSON.stringify({ event: type, timestamp: new Date().toISOString(), data: donnees });

    const resultats = await Promise.allSettled(points.map(async (point) => {
        const entetes = { 'Content-Type': 'application/json', 'X-SIRH-Event': type };
        if (point.secret) entetes['X-SIRH-Signature'] = signer(corps, point.secret);
        const reponse = await fetch(point.url, {
            method: 'POST', headers: entetes, body: corps, signal: AbortSignal.timeout(DELAI_MS)
        });
        if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
    }));

    let echecs = 0;
    resultats.forEach((r, i) => {
        if (r.status === 'rejected') {
            echecs++;
            console.error(`[ÉVÉNEMENTS] ${type} → ${points[i].url} : ${r.reason?.message || r.reason}`);
        }
    });
    return { envoyes: resultats.length - echecs, echecs };
}

/** Émission sans attendre : un destinataire lent ou en panne ne bloque jamais l'action RH. */
function emettreSansAttendre(type, donnees) {
    emettre(type, donnees).catch((e) => console.error(`[ÉVÉNEMENTS] ${type} : ${e.message}`));
}

module.exports = { CATALOGUE, DELAI_MS, signer, salarie, typesAcceptes, emettre, emettreSansAttendre };
