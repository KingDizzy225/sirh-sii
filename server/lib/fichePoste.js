const PDFDocument = require('pdfkit');

/**
 * Fiche de poste, à la trame en usage dans l'entreprise.
 *
 * L'application produisait un bloc de texte libre : ni structure, ni PDF, ni
 * rattachement au salarié. Les fiches continuaient donc d'être rédigées dans un
 * traitement de texte, imprimées, signées à la main, puis classées.
 *
 * Les rubriques ci-dessous reprennent l'ordre exact des fiches existantes.
 * L'ordre n'est pas cosmétique : c'est celui que les salariés et les managers
 * ont l'habitude de parcourir, et le changer rendrait les fiches nouvelles
 * étrangères aux anciennes.
 */

const organisation = () => process.env.ORGANISATION_NAME || 'SII';

const dateFr = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

/** Les trois visas portés au bas de la fiche. */
const VISAS = [
    { code: 'DE', libelle: 'DE' },
    { code: 'DRH', libelle: 'DRH' },
    { code: 'AG', libelle: 'AG' }
];

const enListe = (valeur) => {
    if (Array.isArray(valeur)) return valeur.filter((x) => String(x || '').trim());
    if (typeof valeur === 'string') {
        return valeur.split('\n').map((l) => l.trim()).filter(Boolean);
    }
    return [];
};

function titreRubrique(doc, texte) {
    if (doc.y > 700) doc.addPage();
    doc.moveDown(0.6);
    const y = doc.y;
    doc.rect(50, y, 495, 16).fill('#e2e8f0');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5)
       .text(texte, 55, y + 4, { width: 485 });
    doc.fillColor('#1e293b').font('Helvetica');
    doc.y = y + 22;
}

function puces(doc, items) {
    for (const item of items) {
        if (doc.y > 730) doc.addPage();
        doc.fontSize(9.5).fillColor('#1e293b')
           .text(`•  ${item}`, 60, doc.y, { width: 480, align: 'justify', lineGap: 1.5 });
        doc.moveDown(0.15);
    }
    if (items.length === 0) {
        // Une rubrique vide se dit : la laisser blanche laisserait croire à un
        // oubli de mise en page plutôt qu'à une information manquante.
        doc.fontSize(9).fillColor('#94a3b8').text('Non renseigné', 60, doc.y);
        doc.moveDown(0.15);
    }
}

function paragraphe(doc, texte) {
    if (texte && String(texte).trim()) {
        doc.fontSize(9.5).fillColor('#1e293b')
           .text(String(texte).trim(), 60, doc.y, { width: 480, align: 'justify', lineGap: 1.5 });
    } else {
        doc.fontSize(9).fillColor('#94a3b8').text('Non renseigné', 60, doc.y);
    }
    doc.moveDown(0.2);
}

/** Écrit la fiche dans un document PDF ouvert. */
function ecrireFiche(doc, fiche) {
    doc.fontSize(15).fillColor('#0f172a').font('Helvetica-Bold')
       .text('FICHE DE POSTE', { align: 'center' });
    doc.moveDown(1);

    // En-tête
    const ligne = (etiquette, valeur) => {
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
           .text(`${etiquette} : `, 50, doc.y, { continued: true });
        doc.font('Helvetica').fillColor('#1e293b').text(valeur || '');
        doc.moveDown(0.25);
    };

    ligne('Nom', fiche.salarieNom);
    ligne('Intitulé du poste', fiche.title);
    ligne('Direction', fiche.direction || fiche.department);
    ligne('Lieu', fiche.lieu);
    ligne('Catégorie', fiche.categorie);
    ligne('Supérieur hiérarchique direct', fiche.superieurHierarchique);
    ligne('Date de début', dateFr(fiche.dateDebut));

    titreRubrique(doc, 'DESCRIPTION ET MISSION(S) PRINCIPALE(S)');
    paragraphe(doc, fiche.mission);

    titreRubrique(doc, 'TÂCHES ET ATTRIBUTIONS');
    puces(doc, enListe(fiche.taches));

    titreRubrique(doc, 'RELATIONS');
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Interne : ', 60, doc.y, { continued: true });
    doc.font('Helvetica').fillColor('#1e293b').text(fiche.relationsInterne || 'Non renseigné');
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Externe : ', 60, doc.y, { continued: true });
    doc.font('Helvetica').fillColor('#1e293b').text(fiche.relationsExterne || 'Non renseigné');
    doc.moveDown(0.2);

    titreRubrique(doc, "RAPPORTS D'ACTIVITÉS");
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Destinataires : ', 60, doc.y, { continued: true });
    doc.font('Helvetica').fillColor('#1e293b').text(fiche.rapportsDestinataires || 'Non renseigné');
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Fréquences : ', 60, doc.y, { continued: true });
    doc.font('Helvetica').fillColor('#1e293b').text(fiche.rapportsFrequences || 'Non renseigné');
    doc.moveDown(0.2);

    titreRubrique(doc, 'MOYENS TECHNIQUES MIS À DISPOSITION');
    puces(doc, enListe(fiche.moyensTechniques));

    titreRubrique(doc, 'COMPÉTENCES REQUISES');
    for (const [etiquette, valeur] of [
        ['Savoir', fiche.savoir], ['Savoir-faire', fiche.savoirFaire], ['Savoir-être', fiche.savoirEtre]
    ]) {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a').text(etiquette, 55, doc.y);
        doc.moveDown(0.15);
        doc.font('Helvetica');
        puces(doc, enListe(valeur));
    }

    if (doc.y > 690) doc.addPage();
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Formation / Diplôme / Expérience : ', 55, doc.y, { continued: true });
    doc.font('Helvetica').fillColor('#1e293b').text(fiche.formation || 'Non renseigné');
    doc.moveDown(0.3);

    titreRubrique(doc, "À QUOI S'EXPOSE-T-ON LORSQUE LE POSTE EST MAL TENU");
    puces(doc, enListe(fiche.risquesPoste));

    titreRubrique(doc, "À QUOI S'EXPOSE-T-ON LORSQUE LE MATÉRIEL DE TRAVAIL EST MAL TENU");
    puces(doc, enListe(fiche.risquesMateriel));

    // --- Visas ---
    //
    // Le bloc occupe environ 120 points. Une page A4 mesure 841,89 points, soit
    // 791,89 utilisables sous la marge basse : le seuil est calé là-dessus.
    // Il valait auparavant 620, chiffre repris du format Lettre, et le bloc
    // partait en deuxième page alors qu'il restait cent soixante points libres.
    if (doc.y > 660) doc.addPage();
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a')
       .text('Date et signature agent', 50, doc.y);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(8).fillColor('#64748b')
       .text("Le collaborateur reconnaît avoir pris connaissance de la présente fiche.", 50, doc.y, { width: 240 });

    const yAgent = doc.y + 6;
    doc.moveTo(50, yAgent + 44).lineTo(250, yAgent + 44).strokeColor('#cbd5e1').stroke();

    // Les trois visas, côte à côte. Un visa sans signataire reste vierge : la
    // fiche part alors pour être signée à la main, et cela se voit.
    const visas = Array.isArray(fiche.visas) ? fiche.visas : [];
    let x = 300;
    for (const v of VISAS) {
        const rempli = visas.find((s) => s && s.code === v.code && s.image);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text(v.libelle, x, yAgent - 12);
        if (rempli) {
            try {
                doc.image(rempli.image, x, yAgent, { fit: [70, 32] });
            } catch (e) {
                console.error('[FICHE] Visa non rendu :', e.message);
            }
            doc.font('Helvetica').fontSize(6.5).fillColor('#475569')
               .text(rempli.nom || '', x, yAgent + 34, { width: 78 });
        }
        doc.moveTo(x, yAgent + 44).lineTo(x + 78, yAgent + 44).strokeColor('#cbd5e1').stroke();
        x += 85;
    }

    doc.y = yAgent + 56;
    doc.font('Helvetica').fontSize(7).fillColor('#94a3b8')
       .text(`${organisation()} — fiche établie le ${new Date().toLocaleDateString('fr-FR')}.`,
             50, doc.y, { width: 495 });
}

function nouvelleFiche(fiche) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    ecrireFiche(doc, fiche);
    return doc;
}

module.exports = { VISAS, enListe, ecrireFiche, nouvelleFiche };
