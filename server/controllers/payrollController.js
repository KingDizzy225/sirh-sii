const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { hasRole } = require('../middleware/roleMiddleware');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { getPublicAppUrl } = require('../lib/publicUrl');
const { calculerPaie, decomposer, intervalleMois, TAUX } = require('../lib/paie');

// Une fiche de paie n'est lisible que par la RH/l'administration
// ou par l'employé concerné lui-même.
const canAccessPayroll = async (user, payroll) => {
    if (hasRole(user, ['ADMIN', 'HR'])) return true;
    if (!user || !user.email || !payroll) return false;
    const employee = await prisma.employee.findUnique({ where: { email: user.email } });
    return Boolean(employee && employee.id === payroll.employeeId);
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/payslips');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Le barème ITS et les taux de cotisation vivent désormais dans lib/paie.js :
// ils étaient dupliqués ici, dans l'export comptable et dans le frontend, avec
// des valeurs qui avaient fini par diverger.

const formatFCFA = (amount) => {
    return new Intl.NumberFormat('fr-CI').format(Math.round(amount)) + ' FCFA';
};

// Helper function to generate PDF
/**
 * Jeton de vérification du bulletin, réutilisé s'il existe déjà : régénérer le
 * PDF ne doit pas invalider les QR codes des bulletins déjà remis.
 */
const getOrCreatePayslipToken = async (payroll, employee) => {
    const existant = await prisma.issuedDocument.findFirst({
        where: { type: 'BULLETIN_PAIE', sourceId: payroll.id }
    });
    if (existant) return existant.token;

    const cree = await prisma.issuedDocument.create({
        data: {
            token: crypto.randomBytes(24).toString('hex'),
            type: 'BULLETIN_PAIE',
            employeeId: employee.id,
            sourceId: payroll.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            positionTitle: employee.positionTitle || null,
            department: employee.department || null,
            hireDate: employee.hireDate || null
        }
    });
    return cree.token;
};

// `signatureOverride` est un paramètre explicite. Il était auparavant lu dans
// `arguments[2]`, ce qui ne pouvait pas fonctionner : une fonction fléchée n'a
// pas de `arguments` propre et remontait à celui du module CommonJS, dont le
// troisième élément est l'objet `module`. Toujours défini, jamais une chaîne :
// la branche de signature s'exécutait sur chaque bulletin et échouait à chaque
// fois, si bien qu'aucun bulletin signé n'a jamais porté sa signature.
const generatePayslipPDF = async (payroll, employee, signatureOverride) => {
    // Le QR est préparé avant le rendu : le corps du PDF est synchrone.
    let qrBuffer = null;
    let reference = null;
    try {
        const token = await getOrCreatePayslipToken(payroll, employee);
        reference = token.slice(0, 12).toUpperCase();
        const url = `${getPublicAppUrl()}/verify/${token}`;
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
        qrBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
    } catch (err) {
        // Un bulletin doit pouvoir être produit même si la vérification échoue
        console.error('[PAIE] QR de vérification non généré :', err.message);
    }

    return new Promise((resolve, reject) => {
        try {
            const fileName = `payslip_${payroll.id}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Le bulletin est lu, non recalculé : régénérer le PDF d'une fiche
            // ancienne ne doit pas produire des montants différents de ceux du
            // document déjà remis au salarié.
            const b = decomposer(payroll);
            const gross = b.grossSalary;
            const cnps = b.cnpsEmployee;
            const cmu = b.cmu;
            const netImposable = b.taxableIncome;
            const its = b.its;
            const totalDeductions = b.employeeContributions + (b.deductions || 0);
            const net = b.netSalary;

            // ---- LOGO ----
            const logoPath = path.join(__dirname, '../../public/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 40, { width: 100 });
            }

            // ---- HEADER ----
            doc.fontSize(18).fillColor('#1e3a8a').font('Helvetica-Bold')
               .text('BULLETIN DE PAIE', { align: 'center' });
            doc.fontSize(10).fillColor('#64748b').font('Helvetica')
               .text('Document Officiel – Côte d\'Ivoire', { align: 'center' });
            doc.moveDown(0.5);

            // Ligne séparatrice
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1e3a8a').stroke();
            doc.moveDown(0.8);

            // ---- INFO ENTREPRISE & EMPLOYÉ ----
            const topY = doc.y;
            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9).text('EMPLOYEUR', 50, topY);
            doc.fillColor('#374151').font('Helvetica').fontSize(9)
               .text('SII Côte d\'Ivoire', 50, topY + 13)
               .text('Abidjan, Plateau – Côte d\'Ivoire', 50, topY + 25)
               .text('N° Employeur CNPS : [À RENSEIGNER]', 50, topY + 37);

            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9).text('EMPLOYÉ(E)', 320, topY);
            doc.fillColor('#374151').font('Helvetica').fontSize(9)
               .text(`${employee.firstName} ${employee.lastName}`, 320, topY + 13)
               .text(`Poste : ${employee.positionTitle || 'N/A'}`, 320, topY + 25)
               .text(`Département : ${employee.department || 'N/A'}`, 320, topY + 37);

            doc.moveDown(4.5);

            // ---- PÉRIODE ----
            const periodDate = new Date(payroll.period);
            const periodStr = periodDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
            doc.roundedRect(50, doc.y, 495, 24, 4).fill('#eff6ff');
            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(11)
               .text(`PÉRIODE : ${periodStr}`, 50, doc.y - 20, { align: 'center' });
            doc.moveDown(1.5);

            // ---- TABLEAU DES ÉLÉMENTS ----
            const tableTop = doc.y;
            const col = [50, 250, 350, 450];
            
            // En-têtes colonnes
            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9);
            doc.text('LIBELLÉ', col[0], tableTop);
            doc.text('BASE', col[1], tableTop);
            doc.text('TAUX', col[2], tableTop);
            doc.text('MONTANT', col[3], tableTop, { width: 95, align: 'right' });
            doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor('#1e3a8a').lineWidth(1.5).stroke();
            doc.lineWidth(0.5);
            let y = tableTop + 22;

            const addRow = (label, base, taux, montant, bold = false) => {
                doc.fillColor(bold ? '#111827' : '#374151').font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
                doc.text(label, col[0], y, { width: 195 });
                doc.text(base || '-', col[1], y, { width: 95 });
                doc.text(taux || '-', col[2], y, { width: 95 });
                doc.text(montant, col[3], y, { width: 95, align: 'right' });
                y += 18;
            };

            // Gains
            doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(8).text('▸ GAINS', 50, y); y += 14;
            addRow('Salaire Brut de Base', '-', '-', formatFCFA(b.baseSalary));
            // Les heures supplémentaires et les absences composaient le brut
            // sans jamais apparaître : le total ne se vérifiait pas à l'œil.
            if ((b.overtimeAmount || 0) > 0) {
                addRow('Heures supplémentaires', `${b.overtimeHours} h`,
                       `+ ${Math.round((TAUX.majorationHeureSup - 1) * 100)} %`,
                       formatFCFA(b.overtimeAmount));
            }
            if ((b.bonus || 0) > 0) addRow('Prime / Bonus', '-', '-', formatFCFA(b.bonus));
            if ((b.leaveDeduction || 0) > 0) {
                addRow('Absences non rémunérées', `${b.leaveDays} j`, '-',
                       '- ' + formatFCFA(b.leaveDeduction));
            }
            doc.moveTo(50, y).lineTo(545, y).strokeColor('#d1d5db').stroke(); y += 8;
            addRow('SALAIRE BRUT', '-', '-', formatFCFA(gross), true);
            y += 6;

            // Retenues
            doc.fillColor('#b91c1c').font('Helvetica-Bold').fontSize(8).text('▸ COTISATIONS ET RETENUES SALARIALES', 50, y); y += 14;
            addRow('CNPS – Retraite (Salarié)', formatFCFA(gross),
                   (TAUX.cnpsSalarie * 100).toFixed(2).replace('.', ',') + ' %',
                   '- ' + formatFCFA(cnps));
            addRow('CMU – Couverture Maladie', 'Forfait', '—', '- ' + formatFCFA(cmu));
            addRow('ITS – Impôt sur Traitement et Salaire', formatFCFA(netImposable), 'Barème CI', '- ' + formatFCFA(its));
            if ((b.deductions || 0) > 0) addRow('Autres Retenues', '-', '-', '- ' + formatFCFA(b.deductions));
            
            doc.moveTo(50, y).lineTo(545, y).strokeColor('#d1d5db').stroke(); y += 8;

            // Net à Payer
            doc.roundedRect(50, y, 495, 30, 4).fill('#1e3a8a');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14)
               .text('NET À PAYER', 60, y + 8)
               .text(formatFCFA(net), col[3] - 40, y + 8, { width: 135, align: 'right' });
            y += 45;

            // Pied de page
            doc.fillColor('#64748b').font('Helvetica').fontSize(8)
               .text(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}`, 50, y)
               .text('Ce bulletin de paie doit être conservé sans limitation de durée.', { align: 'center' });
            
            // Render Signature
            const signatureData = signatureOverride || payroll.signature;
            if (typeof signatureData === 'string' && signatureData.length > 0) {
                try {
                    const base64Data = signatureData.replace(/^data:image\/(png|jpeg);base64,/, "");
                    const sigBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(sigBuffer, 350, y - 40, { width: 120, fit: [120, 60] });
                    doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(8)
                       .text('Signé Électroniquement', 350, y + 20);
                } catch (e) {
                    console.error("Failed to render signature image:", e);
                }
            }

            // QR de vérification : permet à une banque ou un bailleur de
            // confirmer que ce bulletin a bien été émis par l'employeur, sans
            // qu'aucun montant ne soit exposé par la page de vérification.
            if (qrBuffer) {
                try {
                    doc.image(qrBuffer, 50, 700, { width: 70, height: 70 });
                    doc.fillColor('#64748b').font('Helvetica').fontSize(6)
                       .text('Scannez pour vérifier', 50, 774, { width: 70, align: 'center' })
                       .text(`Réf. ${reference}`, 50, 782, { width: 70, align: 'center' });
                } catch (e) {
                    console.error('[PAIE] QR non inséré dans le PDF :', e.message);
                }
            }

            doc.end();
            writeStream.on('finish', () => {
                resolve(`/uploads/payslips/${fileName}`);
            });
            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

const getPayrolls = async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({
            include: { employee: true },
            orderBy: { period: 'desc' }
        });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyPayrolls = async (req, res) => {
    try {
        const user = req.user;
        const employee = await prisma.employee.findUnique({ where: { email: user.email }});
        if (!employee) return res.status(404).json({ error: 'Employee profile not found' });
        
        const payrolls = await prisma.payroll.findMany({
            where: { employeeId: employee.id, status: 'APPROVED' },
            orderBy: { period: 'desc' }
        });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const runPayroll = async (req, res) => {
    try {
        const { payrolls } = req.body;
        const results = [];
        
        const employeeIds = payrolls.map(p => p.employeeId);
        const employees = await prisma.employee.findMany({ where: { id: { in: employeeIds } } });
        const employeeMap = employees.reduce((acc, emp) => { acc[emp.id] = emp; return acc; }, {});
        
        for (let p of payrolls) {
            const employee = employeeMap[p.employeeId];
            if (!employee) continue;

            // Un seul calcul, partagé avec le bulletin PDF, l'export comptable
            // et les déclarations sociales. Le net retranchait auparavant la
            // part patronale au lieu des retenues du salarié : sur un brut de
            // 500 000 FCFA, la base enregistrait 425 000 quand le bulletin
            // remis au salarié affichait 393 325.
            const bulletin = calculerPaie({
                baseSalary: p.baseSalary,
                bonus: p.bonus,
                overtimeHours: p.overtimeHours,
                leaveDays: p.leaveDays,
                deductions: p.deductions
            });

            // Supprimer l'ancienne paie pour cette période (éviter les doublons et les conflits de mémorisation)
            await prisma.payroll.deleteMany({
                where: {
                    employeeId: employee.id,
                    period: new Date(p.period)
                }
            });

            let pr = await prisma.payroll.create({
                data: {
                    employeeId: employee.id,
                    period: new Date(p.period),
                    baseSalary: bulletin.baseSalary,
                    bonus: bulletin.bonus,
                    deductions: bulletin.deductions,
                    overtimeHours: bulletin.overtimeHours,
                    leaveDays: bulletin.leaveDays,
                    overtimeAmount: bulletin.overtimeAmount,
                    leaveDeduction: bulletin.leaveDeduction,
                    grossSalary: bulletin.grossSalary,
                    cnpsEmployee: bulletin.cnpsEmployee,
                    cmu: bulletin.cmu,
                    taxableIncome: bulletin.taxableIncome,
                    its: bulletin.its,
                    employerContributions: bulletin.employerContributions,
                    employeeContributions: bulletin.employeeContributions,
                    netSalary: bulletin.netSalary,
                    status: 'APPROVED'
                }
            });

            const pdfPath = await generatePayslipPDF({ ...pr }, employee);
            
            pr = await prisma.payroll.update({ where: { id: pr.id }, data: { pdfPath } });
            results.push(pr);
        }
        res.status(201).json({ message: 'Paie traitée avec succès', count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await prisma.payroll.findUnique({ where: { id }, include: { employee: true } });
        if (!payroll) return res.status(404).json({ error: 'Fiche de paie introuvable' });
        if (!(await canAccessPayroll(req.user, payroll))) {
            return res.status(403).json({ error: 'Accès interdit à cette fiche de paie.' });
        }

        // Regenerate PDF on demand if not found
        const absolutePath = path.join(__dirname, '..', payroll.pdfPath || '');
        if (!payroll.pdfPath || !fs.existsSync(absolutePath)) {
            const newPath = await generatePayslipPDF(payroll, payroll.employee);
            await prisma.payroll.update({ where: { id }, data: { pdfPath: newPath } });
            return res.download(path.join(__dirname, '..', newPath));
        }
        res.download(absolutePath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await prisma.payroll.findUnique({ where: { id }, include: { employee: true } });
        if (!payroll) return res.status(404).json({ error: 'Fiche de paie introuvable' });
        if (!(await canAccessPayroll(req.user, payroll))) {
            return res.status(403).json({ error: 'Accès interdit à cette fiche de paie.' });
        }
        res.json(payroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const signPayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { signature } = req.body; // Base64 string

        const payroll = await prisma.payroll.findUnique({ where: { id }, include: { employee: true } });
        if (!payroll) return res.status(404).json({ error: 'Fiche de paie introuvable' });
        if (!(await canAccessPayroll(req.user, payroll))) {
            return res.status(403).json({ error: 'Vous ne pouvez signer que votre propre fiche de paie.' });
        }

        const updatedPayroll = await prisma.payroll.update({
            where: { id },
            data: {
                signature,
                signedAt: new Date(),
                status: 'SIGNED'
            }
        });

        // Régénérer le PDF avec la signature. Le brut n'est plus reconstitué
        // ici : la « simplification » additionnait un nombre d'heures à des
        // francs et produisait un bulletin signé différent de l'original.
        const newPath = await generatePayslipPDF(updatedPayroll, payroll.employee, signature);
        
        await prisma.payroll.update({ where: { id }, data: { pdfPath: newPath } });

        res.json({ success: true, message: 'Fiche de paie signée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const exportSage = async (req, res) => {
    try {
        const { period } = req.query; // ex: 2026-05
        const mois = intervalleMois(period);

        const payrolls = await prisma.payroll.findMany({
            where: { period: { gte: mois.gte, lt: mois.lt } },
            include: { employee: true },
            orderBy: { employee: { lastName: 'asc' } }
        });

        if (payrolls.length === 0) {
            return res.status(404).json({ error: `Aucune fiche de paie trouvée pour ${mois.libelle}.` });
        }

        // Generate PNM format for Sage (Format paramétrable: Matricule;Nom;Rubrique;Montant)
        // Ceci est une simulation basique de l'export Sage Ligne 100
        let csvContent = "MATRICULE;NOM;PRENOM;CODE_RUBRIQUE;MONTANT\n";
        
        payrolls.forEach(p => {
            const emp = p.employee;
            // Les montants proviennent de la fiche enregistrée. L'assiette était
            // auparavant reconstituée ici par `baseSalary + overtimeHours + bonus`,
            // qui additionnait un nombre d'heures à des francs : dix heures
            // supplémentaires ajoutaient dix FCFA à l'assiette CNPS.
            const b = decomposer(p);
            const ligne = (rubrique, montant) => {
                csvContent += `${emp.id};${emp.lastName};${emp.firstName};${rubrique};${Math.round(montant)}\n`;
            };

            ligne(1000, b.baseSalary);                               // Salaire de base
            if (b.bonus > 0) ligne(2000, b.bonus);                   // Primes
            if (b.overtimeAmount > 0) ligne(3000, b.overtimeAmount); // Heures supp (en montant)
            if (b.leaveDeduction > 0) ligne(3500, -b.leaveDeduction);// Absences non rémunérées
            ligne(4000, b.cnpsEmployee);                             // CNPS part salariale
            ligne(4010, b.cmu);                                      // CMU
            ligne(4020, b.its);                                      // ITS
            ligne(4100, b.employerContributions);                    // CNPS part patronale
            ligne(5000, b.netSalary);                                // Net à payer
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`export_sage_${mois.libelle}.csv`);
        res.send(csvContent);

    } catch (error) {
        console.error("Sage Export Error:", error);
        res.status(500).json({ error: "Erreur lors de l'export Sage." });
    }
};

module.exports = { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, getPayslip, signPayroll, exportSage };
