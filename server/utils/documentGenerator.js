const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère une attestation de travail au format PDF
 * @param {Object} employee - Données de l'employé
 * @param {Object} companyInfo - Informations de l'entreprise
 * @returns {Promise<string>} - Chemin vers le fichier PDF généré
 */
exports.generateEmploymentCertificate = (employee, companyInfo = { name: "SIRH SII Côte d'Ivoire", address: "Abidjan, Côte d'Ivoire" }) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            
            // S'assurer que le dossier uploads/documents existe
            const dir = path.join(__dirname, '../uploads/documents');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const fileName = `Attestation_${employee.firstName}_${employee.lastName}_${Date.now()}.pdf`;
            const filePath = path.join(dir, fileName);
            const relativePath = `/uploads/documents/${fileName}`;

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // En-tête
            doc.fontSize(20).font('Helvetica-Bold').text(companyInfo.name, { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(companyInfo.address, { align: 'center' });
            doc.moveDown(3);

            // Titre du document
            doc.fontSize(16).font('Helvetica-Bold').text('ATTESTATION DE TRAVAIL', { align: 'center', underline: true });
            doc.moveDown(3);

            // Corps du texte
            const hireDate = employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'une date non spécifiée';
            
            doc.fontSize(12).font('Helvetica').text(`Nous soussignés, ${companyInfo.name}, certifions par la présente que :`, { align: 'left' });
            doc.moveDown();
            
            doc.font('Helvetica-Bold').text(`M./Mme ${employee.firstName} ${employee.lastName}`, { align: 'center' });
            doc.moveDown();
            
            doc.font('Helvetica').text(`Est employé(e) au sein de notre structure en qualité de `, { continued: true });
            doc.font('Helvetica-Bold').text(`${employee.positionTitle || 'Collaborateur'}`, { continued: true });
            doc.font('Helvetica').text(`, depuis le ${hireDate}.`);
            doc.moveDown(2);

            doc.text(`Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`);
            doc.moveDown(4);

            // Signature
            const today = new Date().toLocaleDateString('fr-FR');
            doc.text(`Fait à Abidjan, le ${today}`, { align: 'right' });
            doc.moveDown(2);
            doc.font('Helvetica-Bold').text(`La Direction des Ressources Humaines`, { align: 'right' });

            doc.end();

            writeStream.on('finish', () => {
                resolve(relativePath);
            });
            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};
