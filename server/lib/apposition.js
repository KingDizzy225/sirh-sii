const QRCode = require('qrcode');
const prisma = require('../prismaClient');
const sceau = require('./sceau');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Apposition de la signature de l'employeur sur les documents émis.
 *
 * Les documents produits par l'application sortaient sans signature. Ils
 * étaient donc imprimés, signés à la main, puis rescannés : trois
 * manipulations, un délai d'un jour ou deux, et un fichier de moins bonne
 * qualité que l'original — pour un résultat qui, lui, ne prouve rien de plus
 * qu'un trait recopié.
 *
 * Ce qui remplace l'autorité de la signature manuscrite n'est pas l'image du
 * trait, qui se copie sans peine. C'est le sceau : le document porte un
 * manifeste — qui l'a émis, pour qui, quand — scellé par une clé que seul ce
 * serveur détient, et vérifiable par quiconque a la clé publique. Le trait
 * reste, parce que les destinataires l'attendent ; la preuve est ailleurs.
 */

/** Signataire à retenir : celui demandé, à défaut celui par défaut. */
async function choisirSignataire(signataireId) {
    if (signataireId) {
        const choisi = await prisma.signataire.findUnique({ where: { id: signataireId } });
        if (choisi && choisi.actif) return choisi;
    }
    return prisma.signataire.findFirst({
        where: { actif: true },
        orderBy: [{ parDefaut: 'desc' }, { createdAt: 'asc' }]
    });
}

/** Convertit une data URL en tampon d'image, ou null. */
function imageDepuisDataUrl(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    if (!base64 || base64 === dataUrl) {
        // Pas de préfixe reconnu : on n'essaie pas de deviner un format.
        if (!/^[A-Za-z0-9+/=]+$/.test(dataUrl)) return null;
    }
    try {
        const tampon = Buffer.from(base64, 'base64');
        return tampon.length > 0 ? tampon : null;
    } catch {
        return null;
    }
}

/**
 * Scelle un document émis et dessine le bloc de signature.
 *
 * @param {PDFDocument} doc  document PDF ouvert
 * @param {object} options   signataire, registre (IssuedDocument), employé
 * @returns {Promise<{signataire:object|null, sceau:object|null}>}
 */
async function scellerDocument(registre, { signataire, typeDocument } = {}) {
    if (!registre) return null;

    const manifeste = sceau.manifeste({
        documentId: registre.id,
        titre: typeDocument || registre.type,
        empreinte: registre.token,
        signataire: signataire ? `${signataire.nom} — ${signataire.fonction}` : null,
        signataireId: signataire ? signataire.id : null,
        horodatage: registre.issuedAt || new Date(),
        ip: null,
        methode: 'EMISSION_EMPLOYEUR'
    });
    const resultat = await sceau.sceller(manifeste);

    await prisma.issuedDocument.update({
        where: { id: registre.id },
        data: {
            signataireNom: signataire ? signataire.nom : null,
            signataireFonction: signataire ? signataire.fonction : null,
            manifeste,
            sceau: resultat.sceau,
            sceauKeyId: resultat.keyId
        }
    }).catch((e) => console.error('[SCEAU] Enregistrement du sceau :', e.message));

    return { manifeste, ...resultat };
}

async function apposer(doc, { signataire, registre, employe, typeDocument }) {
    // Le scellement est séparé du dessin : le bulletin de paie a sa propre mise
    // en page et n'utilise que la première moitié.
    const scelle = await scellerDocument(registre, { signataire, typeDocument });

    // --- Bloc visuel ---
    const hautDuBloc = Math.min(doc.y + 10, 600);
    let x = 50;

    if (registre) {
        const url = `${getPublicAppUrl()}/verify/${registre.token}`;
        const qr = await QRCode.toDataURL(url, { margin: 1, width: 220 }).catch(() => null);
        const tamponQr = qr ? Buffer.from(qr.split(',')[1], 'base64') : null;
        if (tamponQr) {
            doc.image(tamponQr, x, hautDuBloc, { width: 80, height: 80 });
            doc.fontSize(7).fillColor('#64748b')
               .text("Vérifier l'authenticité", x, hautDuBloc + 84, { width: 80, align: 'center' });
            x += 110;
        }
    }

    // Le trait, quand il existe. Son absence ne bloque rien : un document
    // scellé sans image reste vérifiable, l'inverse ne l'est pas.
    const image = signataire ? imageDepuisDataUrl(signataire.signatureImage) : null;
    if (image) {
        try {
            doc.image(image, x, hautDuBloc, { fit: [150, 60] });
        } catch (e) {
            console.error('[SIGNATURE] Image de signature illisible :', e.message);
        }
    }

    const cachet = signataire ? imageDepuisDataUrl(signataire.cachetImage) : null;
    if (cachet) {
        try {
            doc.image(cachet, x + 160, hautDuBloc - 5, { fit: [80, 80] });
        } catch (e) {
            console.error('[SIGNATURE] Image de cachet illisible :', e.message);
        }
    }

    const yTexte = hautDuBloc + 64;
    doc.fontSize(10).fillColor('#0f172a')
       .text(signataire ? signataire.nom : "Document émis sans signataire désigné", x, yTexte);
    if (signataire) {
        doc.fontSize(9).fillColor('#475569').text(signataire.fonction, x, yTexte + 13);
    }

    if (scelle) {
        doc.fontSize(7).fillColor('#94a3b8').text(
            `Document signé électroniquement et scellé (${scelle.algorithme}, clé ${scelle.keyId}). ` +
            "Le sceau permet de vérifier l'origine et l'intégrité de ce document sans le comparer à un original papier.",
            50, Math.min(yTexte + 34, 720), { width: 495 }
        );
    } else {
        // Ne jamais laisser croire à une garantie absente.
        doc.fontSize(7).fillColor('#b45309').text(
            "Document non scellé : son origine ne peut pas être vérifiée par voie électronique.",
            50, Math.min(yTexte + 34, 720), { width: 495 }
        );
    }

    return { signataire: signataire || null, sceau: scelle };
}

module.exports = { choisirSignataire, apposer, scellerDocument, imageDepuisDataUrl };
