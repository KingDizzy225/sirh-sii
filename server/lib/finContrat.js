const PDFDocument = require('pdfkit');

/**
 * Documents de fin de contrat.
 *
 * Les courriers de rupture produits par l'application annonçaient au salarié
 * que « votre solde de tout compte, votre certificat de travail et votre
 * attestation vous seront remis à l'issue de votre contrat ». Aucun des trois
 * n'existait. La promesse était écrite, signée, remise contre décharge — et
 * c'est au dernier jour, devant la personne, qu'on découvrait qu'il fallait
 * les rédiger à la main.
 *
 * Trois pièces, trois objets distincts qu'il ne faut pas confondre :
 *
 *  - le **certificat de travail** atteste de l'emploi occupé et des dates. Il
 *    est dû à toute sortie, quelle qu'en soit la cause, et ne doit porter
 *    aucune appréciation ni aucun motif : c'est la pièce que le salarié
 *    présentera à son prochain employeur, et une mention défavorable y ferait
 *    un tort durable. Le motif de la rupture n'est pas transmis à cette
 *    fonction — la garantie est structurelle, non affaire de vigilance ;
 *  - l'**attestation de cessation d'emploi** sert les démarches
 *    administratives. Elle porte les identifiants (matricule, numéro CNPS) et
 *    la nature de la rupture, parce que c'est ce que l'administration demande ;
 *  - le **reçu pour solde de tout compte** est l'état des sommes versées, que
 *    le salarié signe. Il n'est produit qu'à partir d'un décompte arrêté
 *    (lib/soldeToutCompte.js), jamais d'un calcul refait à l'impression.
 */

const dateFr = (v) => {
    const d = v ? new Date(v) : null;
    if (!d || isNaN(d.getTime())) return '—';
    const texte = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    // « du 1 mars » se lit mal sur une pièce que le salarié présentera ailleurs.
    return d.getDate() === 1 ? texte.replace(/^1 /, '1er ') : texte;
};

/**
 * Rend un texte imprimable par pdfkit.
 *
 * Les polices standard de pdfkit sont encodées en WinAnsi, où l'espace fine
 * insécable qu'insère `toLocaleString('fr-FR')` entre les milliers n'existe
 * pas : elle sortait à l'impression sous la forme d'une barre oblique, et
 * « 1 046 500 FCFA » devenait « 1/046/500 FCFA » sur le reçu remis au salarié.
 * Le signe moins typographique subissait le même sort.
 *
 * Le défaut ne se voit pas dans le code, ni dans les données : seulement sur
 * le papier. Toute chaîne dessinée dans ce fichier passe donc par ici.
 */
const imprimable = (v) => String(v == null ? '' : v)
    .replace(/[\u202f\u2009\u00a0]/g, ' ')  // espaces fines et insécables
    .replace(/\u2212/g, '-');                 // signe moins typographique

const fcfa = (n) => imprimable(`${Math.round(Number(n) || 0).toLocaleString('fr-FR')} FCFA`);

const organisation = () => process.env.ORGANISATION_NAME || 'SIRH-SII';
const ville = () => process.env.ORGANISATION_VILLE || 'Abidjan';

/** Nature de rupture en clair. Le code interne n'a pas sa place sur un papier. */
const NATURES = {
    LICENCIEMENT: 'licenciement',
    DEMISSION: 'démission',
    RUPTURE_ESSAI: "rupture de la période d'essai",
    FIN_CDD: 'arrivée du terme du contrat à durée déterminée',
    RETRAITE: 'départ à la retraite',
    SANCTION: 'sanction disciplinaire'
};
const natureEnClair = (code) => NATURES[code] || (code ? code.toLowerCase().replace(/_/g, ' ') : null);

/** En-tête commun : émetteur, ville et date, titre. */
function entete(doc, titre) {
    doc.fontSize(11).fillColor('#0f172a').text(organisation(), { align: 'left' });
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#475569')
       .text(`${ville()}, le ${dateFr(new Date())}`, { align: 'right' });
    doc.moveDown(2);
    doc.fontSize(15).fillColor('#0f172a').text(titre, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).fillColor('#1e293b');
}

const paragraphe = (doc, texte, options = {}) => {
    doc.fontSize(11).fillColor('#1e293b')
       .text(imprimable(texte), { align: 'justify', lineGap: 2, ...options });
    doc.moveDown(0.8);
};

/**
 * CERTIFICAT DE TRAVAIL
 *
 * Ne reçoit ni motif, ni appréciation, ni montant : seulement l'identité, les
 * dates et les emplois occupés. Les emplois viennent de l'historisation des
 * situations quand elle existe — c'est là qu'un salarié promu retrouve les
 * deux postes qu'il a tenus, au lieu du seul dernier.
 */
function certificatTravail({ salarie, emplois }) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    entete(doc, 'CERTIFICAT DE TRAVAIL');

    paragraphe(doc,
        `Je soussigné, représentant de ${organisation()}, certifie que ` +
        `M./Mme ${salarie.nom}${salarie.dateNaissance ? `, né(e) le ${dateFr(salarie.dateNaissance)}` : ''}, ` +
        `a été employé(e) dans notre entreprise du ${dateFr(salarie.dateEmbauche)} ` +
        `au ${dateFr(salarie.dateSortie)}.`
    );

    if (emplois && emplois.length > 1) {
        paragraphe(doc, "Au cours de cette période, l'intéressé(e) a occupé successivement les emplois suivants :");
        for (const e of emplois) {
            doc.fontSize(11).fillColor('#0f172a').text(
                imprimable(
                    `•  ${e.poste}${e.departement ? ` (${e.departement})` : ''} — ` +
                    `du ${dateFr(e.du)} au ${e.au ? dateFr(e.au) : dateFr(salarie.dateSortie)}`
                ),
                { indent: 12, lineGap: 2 }
            );
        }
        doc.moveDown(1);
    } else {
        paragraphe(doc,
            `L'intéressé(e) a occupé l'emploi de ${salarie.poste || 'non précisé'}` +
            `${salarie.departement ? `, au sein du service ${salarie.departement}` : ''}.`
        );
    }

    // Aucune appréciation, aucun motif : le certificat n'a pas à dire pourquoi
    // le contrat a pris fin, et le dire nuirait au salarié sans servir personne.
    paragraphe(doc,
        "L'intéressé(e) est libre de tout engagement envers notre entreprise à compter " +
        `du ${dateFr(salarie.dateSortie)}.`
    );
    paragraphe(doc, "Le présent certificat est délivré pour servir et valoir ce que de droit.");

    doc.moveDown(1);
    return { doc, titre: 'Certificat de travail' };
}

/**
 * ATTESTATION DE CESSATION D'EMPLOI
 *
 * Celle-ci porte les identifiants et la nature de la rupture : c'est ce que
 * demandent la caisse et l'administration. Elle se distingue en cela du
 * certificat, et c'est pourquoi ce sont deux documents et non un seul.
 */
function attestationCessation({ salarie, rupture }) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    entete(doc, "ATTESTATION DE CESSATION D'EMPLOI");

    paragraphe(doc,
        `Je soussigné, représentant de ${organisation()}, atteste que ` +
        `M./Mme ${salarie.nom} a cessé de faire partie du personnel de notre entreprise ` +
        `le ${dateFr(salarie.dateSortie)}.`
    );

    const mentions = [
        ['Matricule interne', salarie.matricule],
        ['Numéro CNPS', salarie.cnps],
        ["Date d'embauche", dateFr(salarie.dateEmbauche)],
        ['Date de cessation', dateFr(salarie.dateSortie)],
        ['Dernier emploi occupé', salarie.poste],
        ['Nature du contrat', salarie.typeContrat],
        ['Cause de la cessation', natureEnClair(rupture && rupture.nature)]
    ];

    const gauche = 60;
    for (const [libelle, valeur] of mentions) {
        const y = doc.y;
        doc.fontSize(10).fillColor('#475569').text(`${libelle} :`, gauche, y, { width: 180 });
        doc.fontSize(10).fillColor('#0f172a')
           .text(imprimable(valeur || 'Non renseigné'), gauche + 190, y, { width: 290 });
        doc.moveDown(0.6);
    }
    doc.x = 50;
    doc.moveDown(1.2);

    // Une mention absente est signalée comme telle plutôt que passée sous
    // silence : c'est la RH qui doit savoir que l'attestation partira incomplète.
    const manquantes = mentions.filter(([, v]) => !v).map(([l]) => l);
    if (manquantes.length > 0) {
        doc.fontSize(8.5).fillColor('#b45309').text(
            `Mentions non renseignées au dossier : ${manquantes.join(', ')}. ` +
            "Elles peuvent être exigées lors du dépôt.",
            50, doc.y, { width: 495 }
        );
        doc.moveDown(1);
    }

    paragraphe(doc, "La présente attestation est délivrée pour servir et valoir ce que de droit.");
    doc.moveDown(1);
    return { doc, titre: "Attestation de cessation d'emploi" };
}

/**
 * REÇU POUR SOLDE DE TOUT COMPTE
 *
 * Établi depuis le décompte arrêté, dont les montants ne bougent plus. La date
 * de l'arrêté et son auteur figurent sur le document : si le décompte est
 * repris, c'est ce couple qui distingue les deux versions.
 */
function recuSoldeToutCompte({ salarie, arrete, detail }) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    entete(doc, 'REÇU POUR SOLDE DE TOUT COMPTE');

    paragraphe(doc,
        `Je soussigné, M./Mme ${salarie.nom}, employé(e) de ${organisation()} ` +
        `du ${dateFr(salarie.dateEmbauche)} au ${dateFr(salarie.dateSortie)}, ` +
        `reconnais avoir reçu les sommes détaillées ci-dessous, pour solde de tout compte.`
    );
    doc.moveDown(0.5);

    // --- Tableau des sommes ---
    const x = 50, largeur = 495, colonneMontant = 345, largeurMontant = 192;
    let y = doc.y;

    doc.rect(x, y, largeur, 20).fillColor('#f1f5f9').fill();
    doc.fontSize(9).fillColor('#475569')
       .text('DÉSIGNATION', x + 8, y + 6)
       .text('MONTANT', colonneMontant, y + 6, { width: largeurMontant, align: 'right' });
    y += 20;

    for (const ligne of (detail.lignes || [])) {
        const hauteur = ligne.detail ? 30 : 20;
        doc.fontSize(10).fillColor('#0f172a')
           .text(imprimable(ligne.libelle), x + 8, y + 5, { width: 280 });
        if (ligne.detail) {
            doc.fontSize(8).fillColor('#64748b')
               .text(imprimable(ligne.detail), x + 8, y + 18, { width: 280 });
        }
        doc.fontSize(10).fillColor(ligne.sens === 'debit' ? '#b91c1c' : '#0f172a')
           .text(`${ligne.sens === 'debit' ? '- ' : ''}${fcfa(ligne.montant)}`,
                 colonneMontant, y + 5, { width: largeurMontant, align: 'right' });
        y += hauteur;
        doc.rect(x, y, largeur, 0.5).fillColor('#e2e8f0').fill();
    }

    doc.rect(x, y, largeur, 26).fillColor('#0f172a').fill();
    doc.fontSize(11).fillColor('#ffffff')
       .text('NET À PAYER', x + 8, y + 8)
       .text(fcfa(arrete.netArrete), colonneMontant, y + 8, { width: largeurMontant - 8, align: 'right' });
    y += 40;
    doc.x = 50;
    doc.y = y;

    if (arrete.observations) {
        doc.fontSize(9).fillColor('#475569').text('Observations :', 50, doc.y);
        doc.fontSize(10).fillColor('#1e293b')
           .text(imprimable(arrete.observations), 50, doc.y + 2, { width: 495, align: 'justify' });
        doc.moveDown(1);
    }

    doc.fontSize(8.5).fillColor('#64748b').text(
        `Décompte arrêté le ${dateFr(arrete.arreteLe)}` +
        `${arrete.arretePar ? ` par ${arrete.arretePar}` : ''}. ` +
        "Les montants portés au présent reçu sont ceux de cet arrêté ; ils ne sont pas recalculés à l'impression.",
        50, doc.y, { width: 495 }
    );
    doc.moveDown(1.5);

    // Décharge du salarié. Le reçu ne vaut que signé de sa main : c'est cette
    // signature-là, et non celle de l'employeur, qui en fait une décharge.
    const yD = doc.y;
    doc.rect(50, yD, 250, 90).strokeColor('#cbd5e1').stroke();
    doc.fontSize(9).fillColor('#475569')
       .text('Reçu le : ______________________', 60, yD + 12)
       .text('Mention « pour solde de tout compte »', 60, yD + 34)
       .text('et signature du salarié :', 60, yD + 48);
    doc.y = yD + 100;

    return { doc, titre: 'Reçu pour solde de tout compte' };
}

module.exports = {
    certificatTravail, attestationCessation, recuSoldeToutCompte,
    dateFr, natureEnClair, imprimable, NATURES
};
