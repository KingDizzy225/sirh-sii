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

// Helper function to generate PDF
const generatePayslipPDF = async (payroll, employee) => {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `payslip_${payroll.id}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            const doc = new PDFDocument({ margin: 50 });
            
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // --- HEADER ---
            doc.fontSize(20).text('FICHE DE PAIE', { align: 'center' });
            doc.moveDown();
            
            // Company Info
            doc.fontSize(10).text('Société: SIRH-SII', 50, 100);
            doc.text('Adresse: 123 Avenue des Champs-Élysées, 75008 Paris');
            doc.text('SIRET: 123 456 789 00012');
            
            // Employee Info
            doc.text(`Employé: ${employee.firstName} ${employee.lastName}`, 350, 100);
            doc.text(`Poste: ${employee.positionTitle}`, 350, 115);
            doc.text(`Département: ${employee.department}`, 350, 130);
            
            doc.moveDown(3);
            
            // Period
            const periodDate = new Date(payroll.period);
            const periodStr = periodDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            doc.fontSize(12).text(`Période de paie : ${periodStr.toUpperCase()}`, { align: 'center', underline: true });
            doc.moveDown(2);
            
            // --- TABLE ---
            const startY = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', 50, startY);
            doc.text('Base', 250, startY);
            doc.text('Taux', 350, startY);
            doc.text('Montant', 450, startY);
            
            doc.moveTo(50, startY + 15).lineTo(500, startY + 15).stroke();
            
            let currentY = startY + 25;
            doc.font('Helvetica');
            
            // Base Salary
            doc.text('Salaire de base', 50, currentY);
            doc.text(payroll.baseSalary.toFixed(2) + ' €', 250, currentY);
            doc.text('-', 350, currentY);
            doc.text(payroll.baseSalary.toFixed(2) + ' €', 450, currentY);
            currentY += 20;
            
            let grossSalary = payroll.baseSalary;
            
            // Variables
            if (payroll.overtimeHours > 0) {
                const overtimeAmount = (payroll.baseSalary / 151.67) * 1.25 * payroll.overtimeHours;
                doc.text(`Heures Supplémentaires (${payroll.overtimeHours}h)`, 50, currentY);
                doc.text(payroll.overtimeHours.toString(), 250, currentY);
                doc.text('+25%', 350, currentY);
                doc.text(overtimeAmount.toFixed(2) + ' €', 450, currentY);
                grossSalary += overtimeAmount;
                currentY += 20;
            }
            
            if (payroll.leaveDays > 0) {
                const leaveDeduction = (payroll.baseSalary / 22) * payroll.leaveDays;
                doc.text(`Absences/Congés (${payroll.leaveDays}j)`, 50, currentY);
                doc.text(payroll.leaveDays.toString(), 250, currentY);
                doc.text('-', 350, currentY);
                doc.text('-' + leaveDeduction.toFixed(2) + ' €', 450, currentY);
                grossSalary -= leaveDeduction;
                currentY += 20;
            }
            
            if (payroll.bonus > 0) {
                doc.text('Primes Exceptionnelles', 50, currentY);
                doc.text('-', 250, currentY);
                doc.text('-', 350, currentY);
                doc.text(payroll.bonus.toFixed(2) + ' €', 450, currentY);
                grossSalary += payroll.bonus;
                currentY += 20;
            }
            
            // Gross Salary Footer
            doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
            currentY += 10;
            doc.font('Helvetica-Bold');
            doc.text('SALAIRE BRUT', 50, currentY);
            doc.text(grossSalary.toFixed(2) + ' €', 450, currentY);
            currentY += 20;
            
            // Contributions
            doc.font('Helvetica');
            doc.text('Cotisations Salariales (URSSAF, Retraite...)', 50, currentY);
            doc.text(grossSalary.toFixed(2) + ' €', 250, currentY);
            doc.text('22%', 350, currentY);
            doc.text('-' + payroll.employeeContributions.toFixed(2) + ' €', 450, currentY);
            currentY += 20;
            
            if (payroll.deductions > 0) {
                doc.text('Autres Retenues', 50, currentY);
                doc.text('-', 250, currentY);
                doc.text('-', 350, currentY);
                doc.text('-' + payroll.deductions.toFixed(2) + ' €', 450, currentY);
                currentY += 20;
            }
            
            // Net Salary Footer
            doc.moveTo(50, currentY).lineTo(500, currentY).stroke();
            currentY += 10;
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('NET A PAYER', 50, currentY);
            doc.text(payroll.netSalary.toFixed(2) + ' €', 400, currentY);
            
            // End
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
        const { payrolls } = req.body; // Array of payroll objects
        const results = [];
        
        for (let p of payrolls) {
            const employee = await prisma.employee.findUnique({ where: { id: p.employeeId }});
            if (!employee) continue;

            // Variables & calculations
            const base = parseFloat(p.baseSalary) || 0;
            const overtime = parseFloat(p.overtimeHours) || 0;
            const leaves = parseFloat(p.leaveDays) || 0;
            const bonus = parseFloat(p.bonus) || 0;
            const additionalDeductions = parseFloat(p.deductions) || 0;

            const overtimeVal = (base / 151.67) * 1.25 * overtime;
            const leaveDeduction = (base / 22) * leaves;
            let gross = base + overtimeVal - leaveDeduction + bonus;
            
            // Taxes
            const empContrib = gross * 0.22;
            const employerContrib = gross * 0.45;
            let net = gross - empContrib - additionalDeductions;
            
            // Create payroll record
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

            // Generate PDF
            const pdfPath = await generatePayslipPDF({ 
                ...pr, 
                bonus, 
                deductions: additionalDeductions, 
                overtimeHours: overtime, 
                leaveDays: leaves, 
                employeeContributions: empContrib, 
                netSalary: net,
                baseSalary: base
            }, employee);
            
            // Update PDF Path
            pr = await prisma.payroll.update({
                where: { id: pr.id },
                data: { pdfPath }
            });
            
            results.push(pr);
        }
        res.status(201).json({ message: 'Payroll run successfully', count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPayrolls, getMyPayrolls, runPayroll };
