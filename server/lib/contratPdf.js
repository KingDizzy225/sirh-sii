const PDFDocument = require('pdfkit');

/**
 * Contrat de travail en PDF, signé côté employeur.
 *
 * Le studio de contrats composait le document dans le navigateur et l'exportait
 * par la boîte d'impression : il fallait imprimer, faire signer, puis rescanner
 * — c'est-à-dire exactement le geste que la signature électronique doit
 * supprimer. Le contrat est désormais rendu par le serveur, signé et scellé.
 *
 * Les clauses sont produites ici, à partir des paramètres, et non reçues du
 * navigateur : un contrat dont le texte serait dicté par le client ne serait
 * pas reproductible, et rien ne garantirait que le PDF signé dise ce que l'écran
 * affichait.
 */

const organisation = () => process.env.ORGANISATION_NAME || "SII Côte d'Ivoire";
const ville = () => process.env.ORGANISATION_VILLE || 'Abidjan';

const dateFr = (v) => {
    const d = v ? new Date(v) : new Date();
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

/**
 * Articles du contrat.
 * @returns {{titre:string, texte:string}[]}
 */
function articles({ employe, contractType, baseSalary, probationMonths, nonConcurrence, teletravail }) {
    const nom = `${employe.firstName} ${employe.lastName}`;
    const liste = [
        {
            titre: 'ARTICLE 1 — ENGAGEMENT ET FONCTIONS',
            texte: `Le collaborateur est engagé en qualité de ${employe.positionTitle || 'Collaborateur'} ` +
                   `au sein du département ${employe.department || 'Ressources Humaines'}` +
                   (employe.hireDate ? `, à compter du ${dateFr(employe.hireDate)}` : '') + '.'
        },
        {
            titre: 'ARTICLE 2 — RÉMUNÉRATION',
            texte: `En contrepartie de ses prestations, M./Mme ${nom} percevra une rémunération ` +
                   `mensuelle brute de ${baseSalary} FCFA.`
        },
        {
            titre: "ARTICLE 3 — PÉRIODE D'ESSAI",
            texte: `Le présent contrat comporte une période d'essai de ${probationMonths} mois, ` +
                   `renouvelable une fois conformément à la législation en vigueur.`
        }
    ];

    if (nonConcurrence) {
        liste.push({
            titre: 'ARTICLE 4 — CLAUSE DE NON-CONCURRENCE',
            texte: "Pendant une durée de 12 mois suivant la fin du contrat, le collaborateur s'engage " +
                   "à ne pas exercer d'activité concurrente directe sur le territoire ivoirien."
        });
    }
    if (teletravail) {
        liste.push({
            titre: `ARTICLE ${nonConcurrence ? 5 : 4} — MODALITÉS DE TÉLÉTRAVAIL`,
            texte: 'Le collaborateur bénéficie du dispositif de télétravail hybride à raison de ' +
                   '2 jours par semaine, sous réserve de validation managériale.'
        });
    }
    return liste;
}

/**
 * Écrit le contrat dans un document PDF ouvert.
 * Le bloc de signature est laissé à l'appelant, qui dispose du signataire et du
 * sceau.
 */
function ecrireContrat(doc, options) {
    const { employe, contractType, reference } = options;
    const nom = `${employe.firstName} ${employe.lastName}`;

    doc.fontSize(16).fillColor('#0f172a')
       .text(`CONTRAT DE TRAVAIL (${contractType})`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor('#64748b')
       .text(`Référence : ${reference}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text('ENTRE LES SOUSSIGNÉS :');
    doc.font('Helvetica').fillColor('#1e293b')
       .text(`La société ${organisation()}, sise à ${ville()}, représentée par la direction des ressources humaines,`,
             { align: 'justify' });
    doc.fontSize(9).fillColor('#64748b').text("D'une part,");
    doc.moveDown(1);

    doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text('ET :');
    doc.font('Helvetica').fillColor('#1e293b')
       .text(`M./Mme ${nom}, de nationalité ${employe.nationality || 'ivoirienne'}` +
             (employe.matricule ? `, matricule ${employe.matricule}` : '') + ',',
             { align: 'justify' });
    doc.fontSize(9).fillColor('#64748b').text("D'autre part.");
    doc.moveDown(1.5);

    for (const a of articles(options)) {
        doc.fontSize(10.5).fillColor('#0f172a').font('Helvetica-Bold').text(a.titre);
        doc.font('Helvetica').fontSize(10.5).fillColor('#1e293b')
           .text(a.texte, { align: 'justify', lineGap: 2 });
        doc.moveDown(0.9);
    }

    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#1e293b')
       .text(`Fait à ${ville()}, le ${dateFr(new Date())}, en deux exemplaires originaux.`);
    doc.moveDown(2);
}

/** Crée le document et y écrit le contrat. */
function nouveauContrat(options) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    ecrireContrat(doc, options);
    return doc;
}

module.exports = { articles, ecrireContrat, nouveauContrat, dateFr };
