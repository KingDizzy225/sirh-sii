const prisma = require('../prismaClient');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
        }

        const { title, type, employeeId } = req.body;
        const { name } = req.user; // HR uploader name

        if (!title || !type || !employeeId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Titre, type et employé sont obligatoires.' });
        }

        const newDoc = await prisma.employeeDocument.create({
            data: {
                employeeId,
                title,
                type,
                filePath: `/uploads/documents/${req.file.filename}`,
                fileSize: req.file.size,
                uploadedBy: name
            }
        });

        res.status(201).json(newDoc);
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'upload." });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const { id, role } = req.user;
        let documents;

        if (role === 'ADMIN' || role === 'HR') {
            documents = await prisma.employeeDocument.findMany({
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            documents = await prisma.employeeDocument.findMany({
                where: { 
                    OR: [
                        { employeeId: id },
                        { type: 'Entreprise' },
                        { type: 'Autre' }
                    ]
                },
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.status(200).json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await prisma.employeeDocument.findUnique({ where: { id } });
        
        if (!doc) return res.status(404).json({ error: 'Document non trouvé' });

        const fullPath = path.join(__dirname, '..', doc.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await prisma.employeeDocument.delete({ where: { id } });

        res.status(200).json({ message: 'Document supprimé' });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: 'Erreur suppression' });
    }
};

exports.generateAndSignDocument = async (req, res) => {
    try {
        console.log("=> [GENERATE API] Called by:", req.user?.email);
        const { type, signatureDataUrl } = req.body;
        
        const employee = await prisma.employee.findFirst({ where: { email: req.user.email } });
        
        if (!employee) {
            console.error('Employé introuvable pour email:', req.user.email);
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        let signatureBuffer = null;
        if (signatureDataUrl) {
            const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
            signatureBuffer = Buffer.from(base64Data, 'base64');
        }

        const docTitle = `${type} - ${employee.firstName} ${employee.lastName}`;
        const fileName = `generated_${Date.now()}.pdf`;
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
        pdfDoc.fontSize(24).fillColor('#2563eb').text('SIRH-SII', { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.fontSize(16).fillColor('#0f172a').text(type === 'Contrat' ? 'CONTRAT DE TRAVAIL' : 'ATTESTATION DE TRAVAIL', { align: 'center', underline: true });
        pdfDoc.moveDown(2);

        // Body
        pdfDoc.fontSize(12).text(`Nous soussignés, la direction de SIRH-SII,`);
        pdfDoc.moveDown();
        if (type === 'Attestation') {
            pdfDoc.text(`Certifions par la présente que M./Mme ${employee.firstName} ${employee.lastName},`);
            pdfDoc.text(`Exerce la fonction de ${employee.positionTitle || employee.role} au sein du département ${employee.department}.`);
            pdfDoc.text(`Date d'embauche : ${new Date(employee.hireDate).toLocaleDateString('fr-FR')}.`);
            pdfDoc.moveDown();
            pdfDoc.text(`Cette attestation est délivrée pour servir et valoir ce que de droit.`);
        } else {
            pdfDoc.text(`Engageons M./Mme ${employee.firstName} ${employee.lastName} au poste de ${employee.positionTitle || employee.role}.`);
            pdfDoc.text(`Département : ${employee.department}`);
            pdfDoc.text(`Date d'embauche officielle : ${new Date(employee.hireDate).toLocaleDateString('fr-FR')}.`);
            pdfDoc.moveDown();
            pdfDoc.text(`Le présent document stipule l'accord des deux parties listées ci-dessous concernant les termes de l'emploi en vigueur au sein de l'entreprise.`);
        }

        pdfDoc.moveDown(4);
        pdfDoc.text(`Fait numériquement, le ${new Date().toLocaleDateString('fr-FR')}`);
        pdfDoc.moveDown(3);

        // Signatures area
        const signatureY = pdfDoc.y;
        pdfDoc.text('Direction RH', 50, signatureY);
        pdfDoc.text('Signature de l\'Employé', 350, signatureY);

        if (signatureBuffer) {
            try {
                pdfDoc.image(signatureBuffer, 350, signatureY + 20, { width: 150 });
            } catch (imgErr) {
                console.error("Invalid signature image format:", imgErr);
            }
        }

        pdfDoc.end();

        writeStream.on('finish', async () => {
             try {
                 console.log("=> [GENERATE API] File stream finished. Writing to DB...");
                 const stats = fs.statSync(fullPath);
                 const newDoc = await prisma.employeeDocument.create({
                     data: {
                         employeeId: employee.id,
                         title: docTitle,
                         type: type === 'Contrat' ? 'Contrat' : 'Entreprise',
                         filePath,
                         fileSize: stats.size,
                         uploadedBy: 'Générateur Automatique'
                     }
                 });
                 console.log("=> [GENERATE API] Success!");
                 res.status(201).json(newDoc);
             } catch(dbErr) {
                 console.log("=> [GENERATE API] DB Error:", dbErr);
                 res.status(500).json({ error: 'Database exception after write' });
             }
        });

        writeStream.on('error', (err) => {
            console.error("=> [GENERATE API] FS Write Error:", err);
            res.status(500).json({ error: 'Erreur physique génération PDF' });
        });

    } catch (error) {
        console.error("=> [GENERATE API] Catch Error:", error);
        res.status(500).json({ error: `Erreur interne: ${error.message}` });
    }
};

exports.generateAttestation = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        const pdfDoc = new PDFDocument({ margin: 50 });
        const fileName = `Attestation_${employee.lastName}_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        pdfDoc.pipe(res);

        // Header
        pdfDoc.fontSize(24).fillColor('#2563eb').text('SIRH-SII', { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.fontSize(16).fillColor('#0f172a').text('ATTESTATION DE TRAVAIL', { align: 'center', underline: true });
        pdfDoc.moveDown(2);

        // Body
        pdfDoc.fontSize(12).fillColor('#333333').text(`Nous soussignés, la direction de SIRH-SII,`);
        pdfDoc.moveDown();
        pdfDoc.text(`Certifions par la présente que M./Mme ${employee.firstName} ${employee.lastName},`);
        pdfDoc.text(`Exerce la fonction de ${employee.positionTitle || employee.role} au sein du département ${employee.department}.`);
        pdfDoc.text(`Date d'embauche : ${new Date(employee.hireDate).toLocaleDateString('fr-FR')}.`);
        pdfDoc.moveDown();
        pdfDoc.text(`Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`);
        
        pdfDoc.moveDown(4);
        pdfDoc.text(`Fait numériquement, le ${new Date().toLocaleDateString('fr-FR')}`);
        pdfDoc.moveDown(3);

        // Fake QR Code box for "Authenticity"
        const qrSize = 80;
        const qrX = 50;
        const qrY = pdfDoc.y;
        pdfDoc.rect(qrX, qrY, qrSize, qrSize).stroke('#2563eb');
        pdfDoc.fontSize(8).fillColor('#2563eb').text('SCAN VERIF', qrX + 15, qrY + 35);
        
        pdfDoc.fontSize(12).fillColor('#333333').text('Direction RH SIRH-SII', 350, qrY + 20);

        pdfDoc.end();

    } catch (error) {
        console.error("Error generating attestation PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Erreur lors de la génération de l'attestation" });
        }
    }
};

// GET /api/documents/employee/:employeeId — Documents du dossier personnel
exports.getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const docs = await prisma.employeeDocument.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(docs);
    } catch (error) {
        console.error('Error fetching employee documents:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// POST /api/documents/employee/:employeeId/upload — Upload dans le dossier personnel
exports.uploadEmployeeDocument = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { title, type } = req.body;

        if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });
        if (!title || !type) return res.status(400).json({ error: 'Titre et type requis' });

        const doc = await prisma.employeeDocument.create({
            data: {
                employeeId,
                title,
                type,
                filePath: `/uploads/documents/${req.file.filename}`,
                fileSize: req.file.size,
                uploadedBy: req.user?.name || req.user?.email || 'RH'
            }
        });

        res.status(201).json(doc);
    } catch (error) {
        console.error('Error uploading employee document:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
};
