const prisma = require('../prismaClient');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
try {
    const { GoogleGenAI } = require('@google/genai');
    var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch(e) {
    var ai = null;
}

exports.generateAIDocument = async (req, res) => {
    if (!process.env.GEMINI_API_KEY || !ai) {
         return res.status(500).json({ error: 'La clé d\'API GEMINI_API_KEY n\'est pas configurée dans le backend (.env).' });
    }

    try {
        console.log("=> [AI GENERATE] Called by:", req.user?.email);
        const { type, formData } = req.body;
        
        const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
        
        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        // 1. Build the prompt for Gemini
        let prompt = `Rédige un document RH officiel pour l'entreprise ivoirienne SII.\nAdapte strictement le contenu au Code du Travail de la Côte d'Ivoire (les termes, devises en FCFA, etc.).\nLe document est de type: ${type}.\n`;
        prompt += `Employé: ${employee.firstName} ${employee.lastName}, de département ${employee.department}.\n`;
        prompt += `Informations complémentaires du formulaire:\n`;
        for (const [key, val] of Object.entries(formData || {})) {
             prompt += `- ${key}: ${val}\n`;
        }
        prompt += `\nAssure-toi que le ton soit très formel, juridique et sans fioritures (pas de bla-bla d\'introduction). Le corps du texte uniquement sans objet ni destinataire ni signatures (qui seront générés dynamiquement en bas de document).`;

        // 2. Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const generatedText = response.text;

        // 3. Generate PDF
        const docTitle = `${type} - ${employee.firstName} ${employee.lastName}`;
        const fileName = `ai_generated_${Date.now()}.pdf`;
        const dirPath = path.join(__dirname, '..', 'uploads', 'documents');
        const filePath = `/uploads/documents/${fileName}`;
        const fullPath = path.join(dirPath, fileName);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const pdfDoc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(fullPath);
        pdfDoc.pipe(writeStream);

        // Header
        const logoPath = path.join(__dirname, '..', '..', 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
            pdfDoc.image(logoPath, pdfDoc.page.width / 2 - 75, 40, { width: 150 });
            pdfDoc.moveDown(5);
        } else {
            pdfDoc.fontSize(24).fillColor('#2563eb').text('SIRH-SII', { align: 'center' });
            pdfDoc.moveDown();
        }
        pdfDoc.fontSize(16).fillColor('#0f172a').text(type.toUpperCase(), { align: 'center', underline: true });
        pdfDoc.moveDown(2);

        // AI Body
        pdfDoc.fontSize(12).fillColor('#333333').text(generatedText, { align: 'justify', lineGap: 4 });
        
        pdfDoc.moveDown(3);
        pdfDoc.text(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
        pdfDoc.moveDown(4);

        // Signatures area
        const signatureY = pdfDoc.y;
        pdfDoc.text('Direction RH', 50, signatureY);
        pdfDoc.text('Signature de l\'Employé', 350, signatureY);

        pdfDoc.end();

        writeStream.on('finish', async () => {
             try {
                 const stats = fs.statSync(fullPath);
                 const newDoc = await prisma.employeeDocument.create({
                     data: {
                         employeeId: employee.id,
                         title: docTitle,
                         type: type.includes('Contrat') ? 'Contrat' : 'Entreprise',
                         filePath,
                         fileSize: stats.size,
                         uploadedBy: 'Assistant IA'
                     }
                 });
                 console.log("=> [AI GENERATE] Success!");
                 res.status(201).json(newDoc);
             } catch(dbErr) {
                 console.log("=> [AI GENERATE] DB Error:", dbErr);
                 res.status(500).json({ error: 'Database exception after write' });
             }
        });

        writeStream.on('error', (err) => {
            console.error("=> [AI GENERATE] FS Write Error:", err);
            res.status(500).json({ error: 'Erreur physique génération PDF' });
        });

    } catch (error) {
        console.error("=> [AI GENERATE] Catch Error:", error);
        res.status(500).json({ error: `Erreur IA: ${error.message}` });
    }
};
