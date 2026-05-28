const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/payslips');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper: Calcul de l'ITS (Impôt sur Traitement et Salaires) Côte d'Ivoire
// Barème simplifié sur le salaire net imposable (après déduction CNPS, CMU)
const calculateITS = (netImposable) => {
    if (netImposable <= 75000) return 0;
    if (netImposable <= 240000) return (netImposable - 75000) * 0.16;
    if (netImposable <= 800000) return 26400 + (netImposable - 240000) * 0.21;
    return 144000 + (netImposable - 800000) * 0.24;
};

const formatFCFA = (amount) => {
    return new Intl.NumberFormat('fr-CI').format(Math.round(amount)) + ' FCFA';
};

// Helper function to generate PDF
const generatePayslipPDF = async (payroll, employee) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `payslip_${payroll.id}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const gross = payroll.grossSalary || payroll.baseSalary;

            // --- Cotisations Ivoiriennes ---
            const cnps = gross * 0.063;          // CNPS Retraite salarié : 6.3%
            const cmu = 1000;                     // CMU : forfait 1000 FCFA/mois
            const netImposable = gross - cnps - cmu;
            const its = calculateITS(netImposable); // ITS : barème progressif CI
            const totalDeductions = cnps + cmu + its + (payroll.deductions || 0);
            const net = gross - totalDeductions;

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
            addRow('Salaire Brut de Base', '-', '-', formatFCFA(payroll.baseSalary));
            if ((payroll.bonus || 0) > 0) addRow('Prime / Bonus', '-', '-', formatFCFA(payroll.bonus));
            doc.moveTo(50, y).lineTo(545, y).strokeColor('#d1d5db').stroke(); y += 8;
            addRow('SALAIRE BRUT', '-', '-', formatFCFA(gross), true);
            y += 6;

            // Retenues
            doc.fillColor('#b91c1c').font('Helvetica-Bold').fontSize(8).text('▸ COTISATIONS ET RETENUES SALARIALES', 50, y); y += 14;
            addRow('CNPS – Retraite (Salarié)', formatFCFA(gross), '6,30 %', '- ' + formatFCFA(cnps));
            addRow('CMU – Couverture Maladie', 'Forfait', '—', '- ' + formatFCFA(cmu));
            addRow('ITS – Impôt sur Traitement et Salaire', formatFCFA(netImposable), 'Barème CI', '- ' + formatFCFA(its));
            if ((payroll.deductions || 0) > 0) addRow('Autres Retenues', '-', '-', '- ' + formatFCFA(payroll.deductions));
            
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
            const signatureData = arguments[2] || payroll.signature;
            if (signatureData) {
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

            const base = parseFloat(p.baseSalary) || 0;
            const overtime = parseFloat(p.overtimeHours) || 0;
            const leaves = parseFloat(p.leaveDays) || 0;
            const bonus = parseFloat(p.bonus) || 0;
            const additionalDeductions = parseFloat(p.deductions) || 0;

            // Calculs ivoiriens
            const overtimeVal = (base / 173.33) * 1.15 * overtime;  // 173.33h/mois standard CI
            const leaveDeduction = (base / 26) * leaves;             // 26j ouvrés en CI
            const gross = base + overtimeVal - leaveDeduction + bonus;

            // Cotisations salariales CI
            const cnps = gross * 0.063;                              // CNPS Retraite : 6.3%
            const cmu = 1000;                                        // CMU : forfait CI
            const netImposable = gross - cnps - cmu;
            const its = calculateITS(netImposable);                  // ITS Barème progressif
            const empContrib = cnps + cmu + its;
            const employerContrib = gross * 0.15;                    // Part patronale CNPS ~15%
            const net = gross - empContrib - additionalDeductions;
            
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
                    baseSalary: base,
                    bonus,
                    deductions: additionalDeductions,
                    overtimeHours: overtime,
                    leaveDays: leaves,
                    employerContributions: employerContrib,
                    employeeContributions: empContrib,
                    netSalary: net,
                    status: 'APPROVED'
                }
            });

            const pdfPath = await generatePayslipPDF({ 
                ...pr, 
                grossSalary: gross,
                bonus, 
                deductions: additionalDeductions, 
                overtimeHours: overtime, 
                leaveDays: leaves, 
                netSalary: net,
                baseSalary: base
            }, employee);
            
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

        const updatedPayroll = await prisma.payroll.update({
            where: { id },
            data: {
                signature,
                signedAt: new Date(),
                status: 'SIGNED'
            }
        });

        // Régénérer le PDF avec la signature
        const newPath = await generatePayslipPDF({
            ...updatedPayroll,
            grossSalary: updatedPayroll.baseSalary + updatedPayroll.overtimeHours + updatedPayroll.bonus, // Simplification pour le payload
        }, payroll.employee, signature);
        
        await prisma.payroll.update({ where: { id }, data: { pdfPath: newPath } });

        res.json({ success: true, message: 'Fiche de paie signée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const exportSage = async (req, res) => {
    try {
        const { period } = req.query; // ex: 2026-05
        
        // Find all payrolls for the given period
        const payrolls = await prisma.payroll.findMany({
            where: {
                period: period || { startsWith: new Date().toISOString().substring(0, 7) }
            },
            include: { employee: true }
        });

        if (payrolls.length === 0) {
            return res.status(404).json({ error: "Aucune fiche de paie trouvée pour cette période." });
        }

        // Generate PNM format for Sage (Format paramétrable: Matricule;Nom;Rubrique;Montant)
        // Ceci est une simulation basique de l'export Sage Ligne 100
        let csvContent = "MATRICULE;NOM;PRENOM;CODE_RUBRIQUE;MONTANT\n";
        
        payrolls.forEach(p => {
            const emp = p.employee;
            const gross = p.baseSalary + (p.overtimeHours || 0) + (p.bonus || 0);
            
            // Salaire de base (Rubrique 1000)
            csvContent += `${emp.id};${emp.lastName};${emp.firstName};1000;${p.baseSalary}\n`;
            
            // Primes (Rubrique 2000)
            if (p.bonus > 0) {
                csvContent += `${emp.id};${emp.lastName};${emp.firstName};2000;${p.bonus}\n`;
            }

            // Heures supp (Rubrique 3000)
            if (p.overtimeHours > 0) {
                csvContent += `${emp.id};${emp.lastName};${emp.firstName};3000;${p.overtimeHours}\n`;
            }

            // CNPS (Rubrique 4000)
            const cnps = gross * 0.063;
            csvContent += `${emp.id};${emp.lastName};${emp.firstName};4000;${Math.round(cnps)}\n`;

            // CMU (Rubrique 4010)
            csvContent += `${emp.id};${emp.lastName};${emp.firstName};4010;1000\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`export_sage_${period || 'current'}.csv`);
        res.send(csvContent);

    } catch (error) {
        console.error("Sage Export Error:", error);
        res.status(500).json({ error: "Erreur lors de l'export Sage." });
    }
};

module.exports = { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, getPayslip, signPayroll, exportSage };
