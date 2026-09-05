const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { evaluerDepense, PLAFONDS } = require('../data/expensePolicy');

const receiptDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, receiptDir),
    filename: (req, file, cb) => cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`)
});
exports.upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
}});


// Get expenses (all for admin/manager, personal for employee)
exports.getExpenses = async (req, res) => {
    try {
        const { role, email } = req.user; // from JWT token

        // Find the matching Employee record
        const employee = await prisma.employee.findUnique({ where: { email } });
        
        let expenses = [];
        if (role === 'ADMIN' || role === 'MANAGER' || role === 'HR') {
            expenses = await prisma.expense.findMany({
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
        } else {
            if (!employee) return res.status(404).json({ error: "Employé introuvable" });
            expenses = await prisma.expense.findMany({
                where: { employeeId: employee.id },
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
        }

        // Format for frontend
        const formattedExpenses = expenses.map(exp => ({
            id: exp.id,
            employee: `${exp.employee.firstName} ${exp.employee.lastName}`,
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            merchant: exp.merchant || '-',
            date: new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: exp.status,
            rejectionReason: exp.rejectionReason,
            receiptPath: exp.receiptPath,
            exceedsPolicy: exp.exceedsPolicy
        }));

        res.json(formattedExpenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Create a new expense
exports.createExpense = async (req, res) => {
    try {
        const { amount, currency, category, merchant, date } = req.body;
        const { email } = req.user;

        const employee = await prisma.employee.findUnique({ where: { email } });
        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        // Anti-Duplicate Shield
        const existing = await prisma.expense.findFirst({
            where: {
                employeeId: employee.id,
                amount: parseFloat(amount),
                merchant: merchant || null,
                date: date ? new Date(date) : new Date(),
            }
        });

        if (existing) {
            return res.status(400).json({ error: "Cette dépense semble déjà avoir été enregistrée (doublon détecté)." });
        }

        // Contrôle des plafonds. Une justification manquante est bloquante — la
        // demander maintenant évite un aller-retour avec le valideur. Un
        // dépassement de plafond ne l'est pas : la dépense peut être légitime,
        // elle est enregistrée et signalée pour que le valideur l'examine.
        const controle = evaluerDepense(category, amount, req.body.justification || merchant);
        if (controle.justificationRequise) {
            return res.status(400).json({ error: controle.message });
        }

        const newExpense = await prisma.expense.create({
            data: {
                employeeId: employee.id,
                amount: parseFloat(amount),
                currency: currency || 'FCFA',
                category,
                merchant,
                date: date ? new Date(date) : new Date(),
                status: 'En attente',
                receiptPath: req.file ? `/uploads/receipts/${req.file.filename}` : null,
                exceedsPolicy: controle.depassement
            }
        });

        res.status(201).json({ ...newExpense, controlePolitique: controle });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Update status (Approve/Reject)
exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: { status, rejectionReason }
        });

        res.json(updatedExpense);
    } catch (error) {
        console.error("Error updating expense status:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const { getGenerativeModel } = require("../lib/claudeAI");
const aiModel = getGenerativeModel();

exports.scanReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }
        if (!aiModel) {
            return res.status(500).json({ error: 'Service IA non disponible' });
        }

        const mimeType = req.file.mimetype;
        const fileContent = fs.readFileSync(req.file.path).toString("base64");

        const prompt = `Tu es un expert en comptabilité. Analyse ce ticket de caisse et extrais les données suivantes sous forme de JSON strict:
{
  "amount": "Le montant total TTC (uniquement des chiffres ou décimales, pas de devise)",
  "merchant": "Le nom du commerçant ou restaurant",
  "date": "La date du reçu au format YYYY-MM-DD",
  "category": "Choisis l'une de ces catégories : 'Repas', 'Déplacement', 'Hébergement', 'Équipement', 'Autre'"
}
Ne renvoie QUE le JSON, pas de texte autour ni de blocs \`\`\`json.`;

        const result = await aiModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: fileContent,
                    mimeType: mimeType
                }
            }
        ]);
        const response = await result.response;
        const textRes = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(textRes);
        } catch(e) {
            console.error("Réponse IA non analysable en JSON", textRes);
            return res.status(500).json({ error: "L'IA n'a pas pu extraire les informations proprement." });
        }

        // Return parsed data to frontend (don't save to DB yet, let user confirm)
        res.json({
            amount: parsed.amount || '',
            merchant: parsed.merchant || '',
            date: parsed.date || '',
            category: parsed.category || 'Autre',
            receiptPath: `/uploads/receipts/${req.file.filename}`
        });

    } catch (error) {
        console.error("Error scanning receipt with AI:", error);
        res.status(500).json({ error: "Erreur lors de l'analyse OCR" });
    }
};

/** Plafonds en vigueur, pour affichage dans le formulaire de saisie. */
exports.getExpensePolicy = async (req, res) => {
    res.json({
        devise: 'FCFA',
        categories: Object.entries(PLAFONDS).map(([categorie, regle]) => ({
            categorie,
            plafond: regle.plafond,
            justificationAuDela: regle.justificationAuDela
        }))
    });
};

/**
 * Export comptable des notes de frais validées.
 *
 * Les frais approuvés restaient dans l'application : quelqu'un les ressaisissait
 * à la main en comptabilité, avec le risque d'erreur que cela suppose. Le
 * format CSV point-virgule s'ouvre directement dans Excel et s'importe dans la
 * plupart des logiciels comptables.
 *
 * N'exporte que les dépenses approuvées : une note en attente n'a rien à faire
 * en comptabilité, et les plafonds garantissent que ce qui part est contrôlé.
 */
exports.exportAccounting = async (req, res) => {
    try {
        const { debut, fin } = req.query;
        const filtre = { status: { in: ['Approuvé', 'APPROVED'] } };
        if (debut || fin) {
            filtre.date = {};
            if (debut) filtre.date.gte = new Date(debut);
            if (fin) filtre.date.lte = new Date(fin);
        }

        const depenses = await prisma.expense.findMany({
            where: filtre,
            include: { employee: { select: { firstName: true, lastName: true, department: true, email: true } } },
            orderBy: { date: 'asc' }
        });

        // Le point-virgule est le séparateur attendu par Excel en configuration
        // française ; la virgule y serait interprétée comme séparateur décimal.
        const echapper = (v) => {
            const t = String(v ?? '');
            return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
        };

        const enTetes = ['Date', 'Collaborateur', 'Email', 'Département', 'Catégorie',
                         'Fournisseur', 'Montant', 'Devise', 'Hors plafond', 'Référence'];

        const lignes = depenses.map(d => [
            new Date(d.date).toLocaleDateString('fr-FR'),
            `${d.employee.lastName} ${d.employee.firstName}`,
            d.employee.email,
            d.employee.department,
            d.category,
            d.merchant || '',
            // Virgule décimale : convention comptable francophone
            String(d.amount).replace('.', ','),
            d.currency || 'FCFA',
            d.exceedsPolicy ? 'Oui' : 'Non',
            d.id.slice(0, 8).toUpperCase()
        ].map(echapper).join(';'));

        const total = depenses.reduce((s, d) => s + (d.amount || 0), 0);
        const csv = [
            enTetes.join(';'),
            ...lignes,
            '',
            `Total;;;;;;${String(total).replace('.', ',')};FCFA;;${depenses.length} ligne(s)`
        ].join('\n');

        const nom = `frais_${debut || 'debut'}_${fin || 'ce-jour'}.csv`.replace(/[^\w.-]/g, '_');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${nom}`);
        // BOM : sans lui, Excel affiche mal les accents à l'ouverture
        res.send('﻿' + csv);
    } catch (error) {
        console.error('Error exporting expenses:', error);
        res.status(500).json({ error: "Erreur lors de l'export comptable." });
    }
};
