const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const accountingAgent = require('../services/accountingAgent');
const accountingInbox = require('../services/accountingInboxService');

const accountingDir = path.join(__dirname, '../uploads/accounting');
if (!fs.existsSync(accountingDir)) fs.mkdirSync(accountingDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, accountingDir),
    filename: (req, file, cb) => cb(null, `piece_${Date.now()}${path.extname(file.originalname)}`)
});
exports.upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
}});

// ------------------------------------------------------------------
// TABLEAU DE BORD
// ------------------------------------------------------------------
exports.getDashboard = async (req, res) => {
    try {
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [docsTotal, docsToReview, docsAnalyzed, entriesDraft, upcoming, overdue, expensesByCat] = await Promise.all([
            prisma.accountingDocument.count(),
            prisma.accountingDocument.count({ where: { status: 'RECU' } }),
            prisma.accountingDocument.count({ where: { status: { in: ['ANALYSE', 'VALIDE'] } } }),
            prisma.journalEntry.count({ where: { status: 'BROUILLON' } }),
            prisma.paymentInstallment.findMany({
                where: { status: 'A_PAYER', dueDate: { gte: now, lte: in30Days }, schedule: { status: 'ACTIF' } },
                include: { schedule: true },
                orderBy: { dueDate: 'asc' },
                take: 10
            }),
            prisma.paymentInstallment.findMany({
                where: { status: { in: ['A_PAYER', 'EN_RETARD'] }, dueDate: { lt: now }, schedule: { status: 'ACTIF' } },
                include: { schedule: true },
                orderBy: { dueDate: 'asc' }
            }),
            prisma.accountingDocument.groupBy({
                by: ['category'],
                where: { amountTTC: { not: null }, docType: { in: ['FACTURE_FOURNISSEUR', 'RECU', 'NOTE_DE_FRAIS'] } },
                _sum: { amountTTC: true }
            })
        ]);

        const totalPayable = upcoming.concat(overdue).reduce((s, i) => s + i.amount, 0);

        res.json({
            documents: { total: docsTotal, aTraiter: docsToReview, analyses: docsAnalyzed },
            journal: { brouillons: entriesDraft },
            echeances: {
                aVenir30j: upcoming.map(i => ({
                    id: i.id, dueDate: i.dueDate, amount: i.amount,
                    schedule: i.schedule.title, counterparty: i.schedule.counterparty
                })),
                enRetard: overdue.map(i => ({
                    id: i.id, dueDate: i.dueDate, amount: i.amount,
                    schedule: i.schedule.title, counterparty: i.schedule.counterparty
                })),
                totalAPayer: totalPayable
            },
            depensesParCategorie: expensesByCat.map(c => ({ category: c.category || 'Autre', total: c._sum.amountTTC || 0 })),
            inbox: accountingInbox.getStatus()
        });
    } catch (error) {
        console.error('[COMPTA] Erreur dashboard:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ------------------------------------------------------------------
// PIÈCES COMPTABLES (boîte de réception)
// ------------------------------------------------------------------
exports.getDocuments = async (req, res) => {
    try {
        const { status } = req.query;
        const documents = await prisma.accountingDocument.findMany({
            where: status ? { status } : undefined,
            include: { journalEntries: { include: { lines: true } }, paymentSchedules: { include: { installments: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        console.error('[COMPTA] Erreur liste pièces:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

        const doc = await prisma.accountingDocument.create({
            data: {
                source: 'UPLOAD',
                fileName: req.file.originalname,
                filePath: `/uploads/accounting/${req.file.filename}`,
                mimeType: req.file.mimetype,
                fileSize: req.file.size,
                status: 'RECU'
            }
        });

        // Analyse automatique en arrière-plan (non bloquante pour l'upload)
        accountingAgent.analyzeAndBook(doc.id).catch(err =>
            console.error(`[COMPTA] Analyse auto échouée pour ${doc.id}:`, err.message)
        );

        res.status(201).json(doc);
    } catch (error) {
        console.error('[COMPTA] Erreur upload pièce:', error);
        res.status(500).json({ error: 'Erreur serveur lors du dépôt de la pièce' });
    }
};

exports.analyzeDocument = async (req, res) => {
    try {
        const updated = await accountingAgent.analyzeAndBook(req.params.id);
        res.json(updated);
    } catch (error) {
        console.error('[COMPTA] Erreur analyse pièce:', error);
        res.status(500).json({ error: error.message || "Erreur lors de l'analyse IA" });
    }
};

exports.updateDocumentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['RECU', 'ANALYSE', 'VALIDE', 'REJETE'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }
        const doc = await prisma.accountingDocument.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(doc);
    } catch (error) {
        console.error('[COMPTA] Erreur maj statut pièce:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const doc = await prisma.accountingDocument.findUnique({ where: { id: req.params.id } });
        if (!doc) return res.status(404).json({ error: 'Pièce introuvable' });

        await prisma.accountingDocument.delete({ where: { id: req.params.id } });

        const fullPath = path.join(__dirname, '..', doc.filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

        res.status(204).send();
    } catch (error) {
        console.error('[COMPTA] Erreur suppression pièce:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ------------------------------------------------------------------
// BOÎTE EMAIL (réception des pièces)
// ------------------------------------------------------------------
exports.getInboxStatus = (req, res) => {
    res.json(accountingInbox.getStatus());
};

exports.checkInbox = async (req, res) => {
    try {
        const result = await accountingInbox.checkNow();
        res.json(result);
    } catch (error) {
        console.error('[COMPTA] Erreur relève boîte mail:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la relève de la boîte mail' });
    }
};

// ------------------------------------------------------------------
// JOURNAL COMPTABLE
// ------------------------------------------------------------------
exports.getJournalEntries = async (req, res) => {
    try {
        const entries = await prisma.journalEntry.findMany({
            include: { lines: true, document: { select: { fileName: true, vendor: true, filePath: true } } },
            orderBy: { entryDate: 'desc' }
        });
        res.json(entries);
    } catch (error) {
        console.error('[COMPTA] Erreur journal:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateEntryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['BROUILLON', 'VALIDEE'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }
        const entry = await prisma.journalEntry.update({
            where: { id: req.params.id },
            data: { status },
            include: { lines: true }
        });

        // Une écriture validée valide aussi sa pièce d'origine
        if (status === 'VALIDEE' && entry.documentId) {
            await prisma.accountingDocument.update({
                where: { id: entry.documentId },
                data: { status: 'VALIDE' }
            }).catch(() => {});
        }

        res.json(entry);
    } catch (error) {
        console.error('[COMPTA] Erreur maj écriture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        await prisma.journalEntry.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        console.error('[COMPTA] Erreur suppression écriture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// ------------------------------------------------------------------
// ÉCHÉANCIERS DE PAIEMENT
// ------------------------------------------------------------------
exports.getSchedules = async (req, res) => {
    try {
        const schedules = await prisma.paymentSchedule.findMany({
            include: {
                installments: { orderBy: { position: 'asc' } },
                document: { select: { fileName: true, vendor: true, invoiceNumber: true, filePath: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Marquage automatique des échéances en retard
        const now = new Date();
        const overdueIds = [];
        for (const s of schedules) {
            for (const i of s.installments) {
                if (i.status === 'A_PAYER' && new Date(i.dueDate) < now) {
                    i.status = 'EN_RETARD';
                    overdueIds.push(i.id);
                }
            }
        }
        if (overdueIds.length > 0) {
            await prisma.paymentInstallment.updateMany({
                where: { id: { in: overdueIds } },
                data: { status: 'EN_RETARD' }
            });
        }

        res.json(schedules);
    } catch (error) {
        console.error('[COMPTA] Erreur échéanciers:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { documentId, title, counterparty, totalAmount, numInstallments, firstDueDate, frequency, notes } = req.body;

        let doc = null;
        if (documentId) {
            doc = await prisma.accountingDocument.findUnique({ where: { id: documentId } });
            if (!doc) return res.status(404).json({ error: 'Pièce comptable introuvable' });
        }

        const amount = parseFloat(totalAmount) || doc?.amountTTC;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant total invalide' });

        const scheduleTitle = title || (doc ? `Échéancier ${doc.vendor || doc.fileName}` : null);
        const scheduleCounterparty = counterparty || doc?.vendor;
        if (!scheduleTitle || !scheduleCounterparty) {
            return res.status(400).json({ error: 'Titre et bénéficiaire requis' });
        }

        const start = firstDueDate ? new Date(firstDueDate) : (doc?.dueDate || new Date());
        const installments = accountingAgent.buildInstallments(amount, numInstallments || 1, start, frequency || 'MENSUEL');

        const schedule = await prisma.paymentSchedule.create({
            data: {
                documentId: documentId || null,
                title: scheduleTitle,
                counterparty: scheduleCounterparty,
                totalAmount: amount,
                currency: doc?.currency || 'XOF',
                notes: notes || null,
                createdBy: req.user?.email || 'Agent Comptable IA',
                installments: { create: installments }
            },
            include: { installments: { orderBy: { position: 'asc' } } }
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error('[COMPTA] Erreur création échéancier:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.payInstallment = async (req, res) => {
    try {
        const { paymentMethod, reference } = req.body;
        const installment = await prisma.paymentInstallment.update({
            where: { id: req.params.installmentId },
            data: {
                status: 'PAYE',
                paidAt: new Date(),
                paymentMethod: paymentMethod || null,
                reference: reference || null
            }
        });

        // Si toutes les échéances sont payées, l'échéancier est soldé
        const remaining = await prisma.paymentInstallment.count({
            where: { scheduleId: installment.scheduleId, status: { not: 'PAYE' } }
        });
        if (remaining === 0) {
            await prisma.paymentSchedule.update({
                where: { id: installment.scheduleId },
                data: { status: 'SOLDE' }
            });
        }

        res.json({ installment, scheduleStatus: remaining === 0 ? 'SOLDE' : 'ACTIF' });
    } catch (error) {
        console.error('[COMPTA] Erreur paiement échéance:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.cancelSchedule = async (req, res) => {
    try {
        const schedule = await prisma.paymentSchedule.update({
            where: { id: req.params.id },
            data: { status: 'ANNULE' }
        });
        res.json(schedule);
    } catch (error) {
        console.error('[COMPTA] Erreur annulation échéancier:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
