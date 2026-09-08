const crypto = require('crypto');
const prisma = require('../prismaClient');

/**
 * Sceau cryptographique des signatures.
 *
 * La signature précédente établissait l'intégrité du document — une empreinte
 * conservée — mais rien n'attestait de l'enregistrement lui-même : le
 * certificat affirmait qu'une signature avait eu lieu, et il fallait croire le
 * système sur parole. Une ligne modifiée en base aurait produit un certificat
 * aussi convaincant.
 *
 * Le sceau referme cet écart. Le serveur signe, avec une clé privée Ed25519, un
 * manifeste décrivant l'acte : quel document, quelle empreinte, quel signataire,
 * quand, comment identifié. Un tiers muni de la clé publique vérifie ce
 * manifeste sans rien demander à l'application — et sans pouvoir le fabriquer.
 *
 * Ce que ce sceau est : la preuve que ce système a enregistré cette signature,
 * sur ce document, à cette date. C'est un cachet de serveur.
 *
 * Ce qu'il n'est pas : un certificat délivré au salarié par une autorité de
 * certification. Une signature qualifiée suppose que le signataire détienne sa
 * propre clé, sous son seul contrôle, et qu'un prestataire agréé en réponde.
 * Cela ne s'écrit pas dans une application : cela se contracte.
 */

const ALGORITHME = 'ed25519';

let cache = null;

/**
 * Clé de scellement.
 *
 * D'abord l'environnement — c'est là qu'une clé privée doit vivre. À défaut,
 * une clé est produite une fois et conservée en base : moins protégée, mais
 * stable. Une clé éphémère serait le pire choix : les sceaux d'hier
 * deviendraient invérifiables aujourd'hui, sans que rien ne le signale.
 */
async function cle() {
    if (cache) return cache;

    const pemEnv = (process.env.SIGNATURE_SEAL_PRIVATE_KEY || '').trim();
    if (pemEnv) {
        // La clé peut être fournie en PEM direct ou en base64, les variables
        // d'environnement supportant mal les retours à la ligne.
        const pem = pemEnv.includes('BEGIN')
            ? pemEnv.replace(/\\n/g, '\n')
            : Buffer.from(pemEnv, 'base64').toString('utf8');

        const privee = crypto.createPrivateKey(pem);
        const publique = crypto.createPublicKey(privee);
        cache = {
            keyId: (process.env.SIGNATURE_SEAL_KEY_ID || 'env').trim(),
            privee,
            publiquePem: publique.export({ type: 'spki', format: 'pem' }),
            origine: 'environnement'
        };
        return cache;
    }

    const existante = await prisma.signingKey.findFirst({
        where: { active: true }, orderBy: { createdAt: 'desc' }
    });
    if (existante) {
        cache = {
            keyId: existante.keyId,
            privee: crypto.createPrivateKey(existante.privateKeyPem),
            publiquePem: existante.publicKeyPem,
            origine: 'base de données'
        };
        return cache;
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync(ALGORITHME);
    const keyId = `sirh-${crypto.randomBytes(6).toString('hex')}`;
    const enregistree = await prisma.signingKey.create({
        data: {
            keyId,
            publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
            privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
            algorithm: ALGORITHME
        }
    });
    console.warn(
        `[SCEAU] Clé de scellement produite et conservée en base (${keyId}). ` +
        'Pour une protection supérieure, la déclarer dans SIGNATURE_SEAL_PRIVATE_KEY.'
    );
    cache = {
        keyId,
        privee: crypto.createPrivateKey(enregistree.privateKeyPem),
        publiquePem: enregistree.publicKeyPem,
        origine: 'base de données'
    };
    return cache;
}

/**
 * Manifeste de l'acte de signature, sous forme canonique.
 *
 * Les clés sont ordonnées et le texte figé : c'est cette chaîne exacte qui est
 * scellée, et c'est elle qu'il faudra reproduire pour vérifier. Régénérer le
 * manifeste depuis des données réordonnées invaliderait un sceau pourtant
 * légitime.
 */
function manifeste({
    documentId, titre, empreinte, signataire, signataireId,
    horodatage, ip, methode, organisation
}) {
    const contenu = {
        version: 1,
        acte: 'signature-document',
        documentId,
        titre,
        empreinteDocument: empreinte,
        algorithmeEmpreinte: 'sha256',
        signataire,
        signataireId,
        methodeIdentification: methode,
        horodatage: new Date(horodatage).toISOString(),
        ip: ip || null,
        organisation: organisation || process.env.ORGANISATION_NAME || 'SIRH-SII'
    };
    // Sérialisation stable : clés triées, aucun espace superflu.
    return JSON.stringify(contenu, Object.keys(contenu).sort());
}

/** Scelle un manifeste. */
async function sceller(texteManifeste) {
    const k = await cle();
    const signature = crypto.sign(null, Buffer.from(texteManifeste, 'utf8'), k.privee);
    return {
        sceau: signature.toString('base64'),
        keyId: k.keyId,
        algorithme: ALGORITHME,
        origineCle: k.origine
    };
}

/**
 * Vérifie un sceau.
 * @returns {Promise<{valide:boolean, motif:string|null}>}
 */
async function verifier(texteManifeste, sceauBase64, keyId) {
    if (!texteManifeste || !sceauBase64) {
        return { valide: false, motif: 'Manifeste ou sceau absent.' };
    }

    let publiquePem = null;
    const k = await cle();
    if (!keyId || keyId === k.keyId) {
        publiquePem = k.publiquePem;
    } else {
        // Une clé remplacée depuis ne doit pas invalider les sceaux passés :
        // les anciennes restent consultables pour la seule vérification.
        const ancienne = await prisma.signingKey.findUnique({ where: { keyId } });
        if (!ancienne) {
            return { valide: false, motif: `Clé de scellement « ${keyId} » inconnue de ce système.` };
        }
        publiquePem = ancienne.publicKeyPem;
    }

    try {
        const ok = crypto.verify(
            null,
            Buffer.from(texteManifeste, 'utf8'),
            crypto.createPublicKey(publiquePem),
            Buffer.from(sceauBase64, 'base64')
        );
        return {
            valide: ok,
            motif: ok ? null : "Le sceau ne correspond pas au manifeste : l'un des deux a été modifié."
        };
    } catch (erreur) {
        return { valide: false, motif: `Vérification impossible : ${erreur.message}` };
    }
}

/** Clé publique, à publier pour permettre une vérification indépendante. */
async function clePublique() {
    const k = await cle();
    return { keyId: k.keyId, algorithme: ALGORITHME, publiquePem: k.publiquePem, origine: k.origine };
}

// Pour les essais : oublier la clé mise en cache.
function reinitialiser() { cache = null; }

module.exports = { ALGORITHME, manifeste, sceller, verifier, clePublique, reinitialiser };
