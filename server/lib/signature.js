const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Signature électronique des documents.
 *
 * L'implémentation précédente présentait comme probant un dispositif qui ne
 * l'était pas :
 *
 *  - la route publique de signature ne vérifiait aucun jeton — son propre
 *    commentaire l'indiquait — si bien que quiconque disposait de
 *    l'identifiant d'un document pouvait signer au nom du salarié ;
 *  - le fichier produit ne contenait que la page de certificat, et remplaçait
 *    le document en base : après signature, le contrat n'était plus attaché au
 *    dossier ;
 *  - rien ne reliait la signature au contenu, et le certificat annonçait
 *    pourtant « signature électronique avancée » et « valeur légale ».
 *
 * Un document qui se présente comme probant sans l'être est pire qu'un document
 * non signé : on s'y fie.
 *
 * Ce module fournit ce qui manquait — un jeton à usage unique, une empreinte du
 * document signé, un certificat distinct — et nomme le résultat pour ce qu'il
 * est : une signature électronique simple, assortie d'une preuve d'intégrité.
 * Aller au-delà suppose un prestataire de certification, qui est une décision
 * d'entreprise et non une ligne de code.
 */

// Durée de validité du lien de signature. Un lien qui ne périme pas circule et
// finit par être réutilisé.
const VALIDITE_HEURES = parseInt(process.env.SIGNATURE_LIEN_VALIDITE_HEURES, 10) || 72;

const nouveauJeton = () => crypto.randomBytes(32).toString('hex');

const expiration = (depuis = new Date()) =>
    new Date(depuis.getTime() + VALIDITE_HEURES * 3600 * 1000);

/** Chemin absolu d'un fichier enregistré, quel que soit le format du chemin stocké. */
function cheminAbsolu(filePath) {
    const racine = path.join(__dirname, '..');
    const relatif = String(filePath || '').replace(/^\/+/, '');
    const complet = path.resolve(racine, relatif);
    // Le chemin vient de la base, mais la vérification coûte moins cher que la
    // confiance : un chemin remontant l'arborescence donnerait accès au serveur.
    if (!complet.startsWith(path.resolve(racine))) return null;
    return complet;
}

/**
 * Empreinte SHA-256 du document.
 *
 * C'est elle qui relie la signature au contenu : sans empreinte, une signature
 * n'atteste que d'un geste, jamais de ce qui a été accepté.
 * @returns {string|null} null si le fichier est introuvable.
 */
function empreinte(filePath) {
    const complet = cheminAbsolu(filePath);
    if (!complet || !fs.existsSync(complet)) return null;
    return crypto.createHash('sha256').update(fs.readFileSync(complet)).digest('hex');
}

/**
 * Produit le certificat de signature, dans un fichier distinct du document.
 *
 * @returns {Promise<{chemin:string, taille:number}>}
 */
async function ecrireCertificat({
    document, employe, signatureDataUrl, hash, signePar, ip, dossier
}) {
    if (!fs.existsSync(dossier)) fs.mkdirSync(dossier, { recursive: true });

    const nom = `certificat_${document.id}_${Date.now()}.pdf`;
    const complet = path.join(dossier, nom);

    const base64 = String(signatureDataUrl || '').replace(/^data:image\/\w+;base64,/, '');
    const image = Buffer.from(base64, 'base64');

    const pdf = new PDFDocument({ margin: 50, size: 'A4' });
    const sortie = fs.createWriteStream(complet);

    const termine = new Promise((resolve, reject) => {
        sortie.on('finish', resolve);
        sortie.on('error', reject);
        // Sans écouteur d'erreur sur le document lui-même, une image invalide
        // émet un événement 'error' que rien ne recueille — et le processus
        // s'arrête.
        pdf.on('error', reject);
    });

    pdf.pipe(sortie);

    pdf.fontSize(15).fillColor('#0f172a')
       .text('CERTIFICAT DE SIGNATURE ÉLECTRONIQUE', { align: 'center' });
    pdf.moveDown(0.3);
    pdf.fontSize(9).fillColor('#64748b')
       .text('Signature électronique simple, assortie d\'une preuve d\'intégrité', { align: 'center' });
    pdf.moveDown(2);

    const ligne = (etiquette, valeur) => {
        pdf.fontSize(10).fillColor('#64748b').text(etiquette, { continued: true });
        pdf.fillColor('#0f172a').text(`  ${valeur}`);
        pdf.moveDown(0.3);
    };

    ligne('Document', document.title);
    ligne('Référence', document.id);
    ligne('Signataire', employe ? `${employe.firstName} ${employe.lastName}` : (signePar || '—'));
    ligne('Signé le', new Date().toLocaleString('fr-FR'));
    ligne('Adresse IP', ip || 'non relevée');
    pdf.moveDown(0.6);

    pdf.fontSize(10).fillColor('#64748b').text('Empreinte SHA-256 du document signé :');
    pdf.fontSize(8).fillColor('#0f172a').font('Courier')
       .text(hash || 'document introuvable au moment de la signature', { width: 495 });
    pdf.font('Helvetica');
    pdf.moveDown(1.5);

    if (image.length > 0) {
        pdf.fontSize(10).fillColor('#64748b').text('Signature apposée :');
        pdf.moveDown(0.5);
        pdf.image(image, { fit: [280, 100] });
        pdf.moveDown(1);
    }

    pdf.moveDown(2);
    pdf.fontSize(8).fillColor('#64748b').text(
        "Ce certificat atteste qu'une signature a été apposée sur le document identifié ci-dessus, " +
        "à la date indiquée, au moyen d'un lien à usage unique adressé au signataire. L'empreinte " +
        "permet de vérifier que le document n'a pas été modifié depuis : recalculée sur le fichier, " +
        "elle doit être identique.",
        { width: 495, align: 'justify' }
    );
    pdf.moveDown(0.6);
    pdf.fontSize(8).fillColor('#94a3b8').text(
        "Il ne s'agit pas d'une signature électronique qualifiée au sens d'un prestataire de " +
        "certification agréé : ce certificat n'emporte pas par lui-même la présomption de fiabilité " +
        "attachée à celle-ci.",
        { width: 495, align: 'justify' }
    );

    pdf.end();
    await termine;

    return { chemin: `/uploads/signatures/${nom}`, taille: fs.statSync(complet).size };
}

module.exports = {
    VALIDITE_HEURES, nouveauJeton, expiration, empreinte, cheminAbsolu, ecrireCertificat
};
