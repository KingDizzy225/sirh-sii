const PDFDocument = require('pdfkit');

/**
 * Courriers de procédure disciplinaire et de rupture.
 *
 * Le module de procédure suivait la forme sans produire les pièces : la RH
 * consignait « convocation remise » après avoir rédigé la lettre ailleurs, en
 * reprenant un ancien dossier. Or le motif est déjà saisi dans la procédure, et
 * c'est précisément lui qui doit figurer dans la notification — une rupture
 * notifiée sans motif écrit s'expose à être jugée abusive quel que soit le fond.
 *
 * Deux règles tenues ici :
 *
 *  - Le motif est reproduit mot pour mot depuis la procédure. Le reformuler,
 *    fût-ce pour l'améliorer, ferait diverger la lettre remise au salarié du
 *    dossier qui la fonde.
 *  - Aucun article de loi n'est cité. L'application ne dit pas le droit ; une
 *    référence approximative dans un courrier remis contre décharge serait pire
 *    qu'aucune référence.
 *
 * Chaque lettre porte un bloc de décharge : c'est la preuve de remise qui fait
 * foi, pas l'envoi.
 */

const organisation = () => process.env.ORGANISATION_NAME || 'SIRH-SII';

const dateFr = (v) => {
    const d = v ? new Date(v) : new Date();
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

/**
 * Courriers disponibles par nature de procédure et par étape.
 *
 * Une étape sans courrier — l'entretien lui-même, le préavis, le solde de tout
 * compte — n'en produit pas : mieux vaut aucune lettre qu'une lettre vide de
 * sens qu'il faudrait retravailler.
 */
const COURRIERS = {
    LICENCIEMENT: {
        CONVOCATION: {
            titre: 'CONVOCATION À UN ENTRETIEN PRÉALABLE',
            corps: (c) => [
                `Nous vous prions de bien vouloir vous présenter à un entretien préalable qui se tiendra ` +
                `à partir du ${dateFr(c.entretienPossibleLe)}, dans les locaux de ${c.organisation}.`,
                `Cet entretien a pour objet de recueillir vos explications sur les faits suivants :`,
                { citation: c.motif },
                `Vous pouvez vous faire assister lors de cet entretien par la personne de votre choix ` +
                `appartenant au personnel de l'entreprise.`,
                `Aucune décision n'est prise à ce stade : la présente convocation ne préjuge pas de la suite.`
            ]
        },
        NOTIFICATION: {
            titre: 'NOTIFICATION DE LICENCIEMENT',
            corps: (c) => [
                `À la suite de l'entretien préalable qui s'est tenu le ${dateFr(c.dateEntretien)}, ` +
                `nous vous notifions par la présente votre licenciement.`,
                `Cette décision est fondée sur les motifs suivants :`,
                { citation: c.motif },
                `Votre préavis, ainsi que les conditions de son exécution, vous seront précisés séparément.`,
                `Votre solde de tout compte, votre certificat de travail et votre attestation vous seront ` +
                `remis à l'issue de votre contrat.`
            ]
        }
    },

    SANCTION: {
        EXPLICATION: {
            titre: 'DEMANDE D\'EXPLICATION ÉCRITE',
            corps: (c) => [
                `Nous avons constaté les faits suivants :`,
                { citation: c.motif },
                `Nous vous invitons à nous faire parvenir vos explications écrites ` +
                `avant le ${dateFr(c.reponseAttendueLe)}.`,
                `À défaut de réponse dans ce délai, la suite sera donnée au vu des seuls éléments en notre possession.`,
                `Aucune sanction n'est prononcée à ce stade.`
            ]
        },
        DECISION: {
            titre: 'NOTIFICATION DE SANCTION DISCIPLINAIRE',
            corps: (c) => [
                `Après avoir recueilli vos explications, nous vous notifions la sanction suivante :`,
                { citation: c.sanction || '(sanction à préciser avant remise)' },
                `Cette sanction est motivée par les faits suivants :`,
                { citation: c.motif },
                `Elle est versée à votre dossier.`
            ]
        }
    },

    RUPTURE_ESSAI: {
        NOTIFICATION: {
            titre: "NOTIFICATION DE RUPTURE DE LA PÉRIODE D'ESSAI",
            corps: (c) => [
                `Nous vous informons qu'il est mis fin à votre période d'essai.`,
                `Motif :`,
                { citation: c.motif },
                `Votre solde de tout compte, votre certificat de travail et votre attestation ` +
                `vous seront remis.`
            ]
        }
    },

    DEMISSION: {
        ECRIT: {
            titre: 'ACCUSÉ DE RÉCEPTION D\'UNE DÉMISSION',
            corps: (c) => [
                `Nous accusons réception de votre lettre de démission.`,
                `Nous en prenons acte dans les termes suivants :`,
                { citation: c.motif },
                `Les conditions d'exécution de votre préavis vous seront précisées séparément.`
            ]
        }
    }
};

/** Codes d'étape porteurs d'un courrier, pour une nature de procédure. */
function courriersDisponibles(type) {
    return Object.entries(COURRIERS[type] || {}).map(([code, c]) => ({ code, titre: c.titre }));
}

/**
 * Écrit le courrier dans un document PDF déjà ouvert.
 * @param {PDFDocument} doc
 * @param {object} contexte  motif, salarié, dates, sanction
 */
function ecrireCourrier(doc, modele, contexte) {
    const org = contexte.organisation;
    const s = contexte.salarie;

    doc.fontSize(11).fillColor('#0f172a').text(org, { align: 'left' });
    doc.moveDown(2);

    // Destinataire
    doc.fontSize(11).fillColor('#0f172a').text(s.nom, { align: 'right' });
    if (s.poste) doc.fontSize(10).fillColor('#475569').text(s.poste, { align: 'right' });
    if (s.departement) doc.fontSize(10).fillColor('#475569').text(s.departement, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(10).fillColor('#475569')
       .text(`${contexte.lieu || 'Abidjan'}, le ${dateFr(new Date())}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(13).fillColor('#0f172a').text(`Objet : ${modele.titre}`, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#64748b')
       .text('Remise contre décharge ou lettre recommandée avec accusé de réception');
    doc.moveDown(2);

    doc.fontSize(11).fillColor('#1e293b').text('Madame, Monsieur,', { align: 'left' });
    doc.moveDown(1);

    for (const bloc of modele.corps(contexte)) {
        if (typeof bloc === 'string') {
            doc.fontSize(11).fillColor('#1e293b').text(bloc, { align: 'justify', lineGap: 2 });
            doc.moveDown(0.8);
        } else if (bloc.citation) {
            // Le motif est encadré et reproduit tel qu'il figure au dossier :
            // c'est le même texte qui devra être défendu s'il est contesté.
            const y = doc.y;
            doc.rect(50, y, 495, 0.1).fillColor('#e2e8f0');
            doc.fontSize(11).fillColor('#0f172a')
               .text(bloc.citation, 65, y + 6, { width: 465, align: 'justify', lineGap: 2 });
            doc.moveDown(1.2);
        }
    }

    doc.moveDown(1);
    doc.fontSize(11).fillColor('#1e293b')
       .text("Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.",
             { align: 'justify' });
    doc.moveDown(3);

    doc.fontSize(11).fillColor('#0f172a').text('Pour la direction', { align: 'right' });
    doc.moveDown(3);

    // Bloc de décharge : la preuve de remise est ce qui fera foi.
    const yD = Math.min(doc.y, 660);
    doc.rect(50, yD, 250, 78).strokeColor('#cbd5e1').stroke();
    doc.fontSize(9).fillColor('#475569')
       .text('Reçu en main propre le : ______________', 60, yD + 12)
       .text('Nom du salarié : ______________________', 60, yD + 32)
       .text('Signature :', 60, yD + 52);

    doc.fontSize(7.5).fillColor('#94a3b8')
       .text("Document produit à partir du dossier de procédure. Le motif y est reproduit sans modification.",
             50, yD + 92, { width: 495 });
}

/**
 * Produit le courrier d'une étape.
 * @returns {PDFDocument|null} null si l'étape ne porte pas de courrier.
 */
function genererCourrier(type, code, contexte) {
    const modele = (COURRIERS[type] || {})[code];
    if (!modele) return null;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    ecrireCourrier(doc, modele, { ...contexte, organisation: contexte.organisation || organisation() });
    return { doc, titre: modele.titre };
}

module.exports = { COURRIERS, courriersDisponibles, genererCourrier, dateFr };
