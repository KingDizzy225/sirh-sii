const crypto = require('crypto');
const prisma = require('../prismaClient');
const apposition = require('./apposition');
const identite = require('./identite');
const paie = require('./paie');

/**
 * Attestations de travail et de salaire.
 *
 * Le corps du document vivait dans le contrôleur, avec une mention qui a
 * longtemps échappé à tout le monde : « Nous soussignés, la direction de
 * SIRH-SII » — le nom du logiciel, sur une attestation remise à une banque ou
 * à une administration. Le nom vient désormais de l'identité de l'entreprise.
 *
 * Il est ici pour être partagé : la RH l'émet depuis son écran, le salarié
 * depuis son badge, et les deux produisent exactement le même document, scellé
 * de la même façon.
 *
 * **Ce que l'attestation de salaire dit, et ne dit pas.** Elle reprend les
 * bulletins enregistrés, mois par mois, et le nombre de mois qu'elle a trouvés.
 * Elle n'extrapole pas une moyenne sur des mois absents : une attestation qui
 * annoncerait un revenu que la paie n'a pas versé engagerait l'employeur.
 */

const TYPES = {
    TRAVAIL: { code: 'ATTESTATION_TRAVAIL', titre: 'ATTESTATION DE TRAVAIL', libelle: 'Attestation de travail' },
    SALAIRE: { code: 'ATTESTATION_SALAIRE', titre: 'ATTESTATION DE SALAIRE', libelle: 'Attestation de salaire' }
};

/** Nombre de mois repris par une attestation de salaire. */
const MOIS_SALAIRE = Math.max(parseInt(process.env.ATTESTATION_SALAIRE_MOIS, 10) || 3, 1);

const dateFr = (date) => {
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? 'Non précisée' : d.toLocaleDateString('fr-FR');
};
const moisFr = (date) => new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const fcfa = (n) => `${new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0))} FCFA`;

/** Inscrit le document au registre et renvoie sa ligne. */
async function enregistrer(employe, type, emisPar) {
    return prisma.issuedDocument.create({
        data: {
            token: crypto.randomBytes(24).toString('hex'),
            type: TYPES[type].code,
            employeeId: employe.id,
            issuedByEmail: emisPar || null,
            employeeName: `${employe.firstName} ${employe.lastName}`,
            positionTitle: employe.positionTitle || employe.role,
            department: employe.department,
            hireDate: employe.hireDate
        }
    });
}

/** Bulletins repris par une attestation de salaire. */
async function elementsSalaire(employeeId, combien = MOIS_SALAIRE) {
    const fiches = await prisma.payroll.findMany({
        where: { employeeId },
        orderBy: { period: 'desc' },
        take: combien,
        select: { period: true, grossSalary: true, netSalary: true, baseSalary: true }
    });
    const lignes = fiches.map((f) => ({
        periode: f.period,
        brut: f.grossSalary != null ? f.grossSalary : f.baseSalary,
        net: f.netSalary
    }));
    const brutsConnus = lignes.map((l) => l.brut).filter((m) => Number.isFinite(m) && m > 0);
    return {
        lignes: lignes.reverse(),
        moisTrouves: lignes.length,
        moisDemandes: combien,
        brutMoyen: brutsConnus.length ? brutsConnus.reduce((a, b) => a + b, 0) / brutsConnus.length : null
    };
}

/**
 * Écrit le corps de l'attestation dans un document PDF ouvert.
 *
 * Le document n'est ni créé ni terminé ici : l'appelant le dirige vers une
 * réponse ou vers un fichier, et c'est lui qui sait lequel.
 */
async function composer(pdfDoc, { employe, type, signataire, registre, salaire = null }) {
    const modele = TYPES[type];
    const societe = identite.nom();

    pdfDoc.fontSize(20).fillColor('#2563eb').text(societe, { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(16).fillColor('#0f172a').text(modele.titre, { align: 'center', underline: true });
    pdfDoc.moveDown(2);

    pdfDoc.fontSize(12).fillColor('#333333').text(`Nous soussignés, la direction de ${societe},`);
    pdfDoc.moveDown();
    pdfDoc.text(`Certifions par la présente que M./Mme ${employe.firstName} ${employe.lastName},`);
    pdfDoc.text(`exerce la fonction de ${employe.positionTitle || employe.role}`
        + `${employe.department ? ` au sein du département ${employe.department}` : ''}.`);
    pdfDoc.text(`Date d'embauche : ${dateFr(employe.hireDate)}.`);

    if (type === 'SALAIRE' && salaire) {
        pdfDoc.moveDown();
        if (salaire.moisTrouves === 0) {
            pdfDoc.fillColor('#b45309').text(
                "Aucun bulletin de paie n'est enregistré pour l'intéressé(e) : "
                + "aucun montant ne peut être certifié.");
            pdfDoc.fillColor('#333333');
        } else {
            pdfDoc.text(`Rémunération des ${salaire.moisTrouves} dernier(s) mois de paie enregistré(s) :`);
            pdfDoc.moveDown(0.5);
            for (const ligne of salaire.lignes) {
                pdfDoc.text(`    ${moisFr(ligne.periode)} — brut ${fcfa(ligne.brut)}, net payé ${fcfa(ligne.net)}`);
            }
            if (salaire.brutMoyen != null) {
                pdfDoc.moveDown(0.5);
                pdfDoc.text(`Soit un salaire brut mensuel moyen de ${fcfa(salaire.brutMoyen)}.`);
            }
            // Dire combien de mois manquent vaut mieux que de présenter une
            // moyenne sur deux mois comme si elle en couvrait trois.
            if (salaire.moisTrouves < salaire.moisDemandes) {
                pdfDoc.fontSize(10).fillColor('#64748b').text(
                    `Cette attestation porte sur ${salaire.moisTrouves} mois : les autres ne sont pas `
                    + `enregistrés dans le système de paie.`);
                pdfDoc.fontSize(12).fillColor('#333333');
            }
        }
    }

    pdfDoc.moveDown();
    pdfDoc.text("Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.");

    pdfDoc.moveDown(4);
    pdfDoc.text(`Fait numériquement, le ${dateFr(new Date())}`);
    pdfDoc.moveDown(3);

    await apposition.apposer(pdfDoc, {
        signataire,
        registre,
        employe,
        typeDocument: modele.libelle
    });

    pdfDoc.fontSize(7).fillColor('#94a3b8')
        .text(`Référence : ${registre.token.slice(0, 12).toUpperCase()}`, 400, 700);

    return registre;
}

module.exports = { TYPES, MOIS_SALAIRE, enregistrer, elementsSalaire, composer, dateFr, fcfa };
