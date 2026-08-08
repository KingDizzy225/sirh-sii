const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ----------------------------------------------------------------------------
// AGENT COMPTABLE IA — Fédération Ivoirienne de Football Américain
// Analyse les pièces comptables (factures, reçus...) reçues par email ou
// déposées manuellement, propose les écritures au journal (SYSCOHADA révisé)
// et des échéanciers de paiement.
// ----------------------------------------------------------------------------

const MODEL_NAME = 'gemini-2.5-flash';

function getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: MODEL_NAME });
}

const EXTRACTION_PROMPT = `Tu es l'Agent Comptable IA de la Fédération Ivoirienne de Football Américain (Côte d'Ivoire).
La comptabilité est tenue en Francs CFA (XOF) selon le référentiel SYSCOHADA révisé (OHADA).

Analyse la pièce comptable jointe (facture, reçu, note de frais, relevé...) et renvoie UNIQUEMENT un JSON strict (pas de texte autour, pas de bloc \`\`\`) au format suivant :
{
  "docType": "FACTURE_FOURNISSEUR" | "FACTURE_CLIENT" | "RECU" | "NOTE_DE_FRAIS" | "RELEVE_BANCAIRE" | "AUTRE",
  "vendor": "Nom du fournisseur ou de l'émetteur de la pièce",
  "invoiceNumber": "Numéro de la facture ou de la pièce (ou null)",
  "invoiceDate": "Date de la pièce au format YYYY-MM-DD (ou null)",
  "dueDate": "Date d'échéance de paiement au format YYYY-MM-DD (ou null si non précisée)",
  "currency": "Code devise (XOF par défaut)",
  "amountHT": montant hors taxes en nombre (ou null),
  "amountTVA": montant de la TVA en nombre (0 si exonéré, TVA CI = 18%),
  "amountTTC": montant total TTC en nombre,
  "category": "Équipements Sportifs" | "Déplacements" | "Arbitrage" | "Compétitions" | "Subventions" | "Salaires & Primes" | "Fonctionnement" | "Médical" | "Autre",
  "summary": "Résumé en 1 ou 2 phrases de la pièce et de son objet",
  "confidence": nombre entre 0 et 1 indiquant ta confiance dans l'extraction,
  "journal": "ACH" | "VTE" | "BQ" | "CAI" | "OD",
  "entryLabel": "Libellé court de l'écriture comptable",
  "lines": [
    { "accountCode": "compte SYSCOHADA (ex: 604, 6181, 4011, 4452, 521, 7071, 758...)", "accountLabel": "Intitulé du compte", "debit": nombre, "credit": nombre }
  ]
}
Règles pour "lines" (écriture en partie double, total débit = total crédit = montant TTC concerné) :
- Facture fournisseur : débit compte(s) de charge classe 6 (HT) + débit 4452 (TVA récupérable) si TVA, crédit 4011 Fournisseurs (TTC).
- Facture client / subvention à recevoir : débit 4111 Clients ou 4581, crédit compte de produit classe 7 (ex: 7071, 758, 71 subventions).
- Reçu / paiement comptant : contrepartie 521 Banque ou 571 Caisse selon la pièce.
Si une information est illisible ou absente, mets null (ou 0 pour les montants de TVA) sans inventer.`;

function toNumber(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}

function toDate(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Analyse une pièce comptable avec Gemini et enregistre :
 *  - les métadonnées extraites sur le document
 *  - une écriture de journal en brouillon (partie double SYSCOHADA)
 * @param {string} documentId id du AccountingDocument
 * @returns le document mis à jour (avec écritures)
 */
async function analyzeAndBook(documentId) {
    const aiModel = getModel();
    if (!aiModel) {
        throw new Error("La clé d'API GEMINI_API_KEY n'est pas configurée dans le backend (.env).");
    }

    const doc = await prisma.accountingDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error('Pièce comptable introuvable');

    const fullPath = path.join(__dirname, '..', doc.filePath);
    if (!fs.existsSync(fullPath)) throw new Error('Fichier de la pièce introuvable sur le serveur');

    const fileContent = fs.readFileSync(fullPath).toString('base64');

    let parsed;
    try {
        const result = await aiModel.generateContent([
            EXTRACTION_PROMPT,
            { inlineData: { data: fileContent, mimeType: doc.mimeType } }
        ]);
        const textRes = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(textRes);
    } catch (e) {
        console.error('[AGENT COMPTABLE] Échec analyse IA:', e.message);
        await prisma.accountingDocument.update({
            where: { id: documentId },
            data: { status: 'ERREUR', aiSummary: `Échec de l'analyse IA : ${e.message}` }
        });
        throw new Error("L'IA n'a pas pu analyser la pièce correctement.");
    }

    const amountTTC = toNumber(parsed.amountTTC);

    const updated = await prisma.accountingDocument.update({
        where: { id: documentId },
        data: {
            status: 'ANALYSE',
            docType: parsed.docType || 'AUTRE',
            vendor: parsed.vendor || null,
            invoiceNumber: parsed.invoiceNumber || null,
            invoiceDate: toDate(parsed.invoiceDate),
            dueDate: toDate(parsed.dueDate),
            currency: parsed.currency || 'XOF',
            amountHT: toNumber(parsed.amountHT),
            amountTVA: toNumber(parsed.amountTVA) || 0,
            amountTTC,
            category: parsed.category || 'Autre',
            aiSummary: parsed.summary || null,
            aiConfidence: toNumber(parsed.confidence),
            analyzedAt: new Date()
        }
    });

    // Écriture de journal en brouillon si l'IA a proposé des lignes équilibrées
    const lines = Array.isArray(parsed.lines) ? parsed.lines
        .map(l => ({
            accountCode: String(l.accountCode || '').trim(),
            accountLabel: String(l.accountLabel || '').trim(),
            debit: toNumber(l.debit) || 0,
            credit: toNumber(l.credit) || 0
        }))
        .filter(l => l.accountCode && (l.debit > 0 || l.credit > 0)) : [];

    if (lines.length >= 2) {
        const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
        const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
        const balanced = Math.abs(totalDebit - totalCredit) < 1; // tolérance d'arrondi en FCFA

        await prisma.journalEntry.create({
            data: {
                documentId,
                entryDate: toDate(parsed.invoiceDate) || new Date(),
                journal: ['ACH', 'VTE', 'BQ', 'CAI', 'OD'].includes(parsed.journal) ? parsed.journal : 'OD',
                reference: parsed.invoiceNumber || null,
                label: parsed.entryLabel || parsed.summary || `Pièce ${doc.fileName}`,
                status: 'BROUILLON',
                createdBy: balanced ? 'Agent Comptable IA' : 'Agent Comptable IA (à vérifier : écriture déséquilibrée)',
                lines: { create: lines }
            }
        });
    }

    return prisma.accountingDocument.findUnique({
        where: { id: updated.id },
        include: { journalEntries: { include: { lines: true } } }
    });
}

/**
 * Génère les échéances d'un échéancier de paiement.
 * @param {number} totalAmount montant total à répartir
 * @param {number} numInstallments nombre d'échéances
 * @param {Date} firstDueDate date de la première échéance
 * @param {string} frequency 'MENSUEL' | 'TRIMESTRIEL' | 'HEBDOMADAIRE'
 */
function buildInstallments(totalAmount, numInstallments, firstDueDate, frequency = 'MENSUEL') {
    const count = Math.max(1, parseInt(numInstallments, 10) || 1);
    const base = Math.floor((totalAmount / count) * 100) / 100;
    const installments = [];
    let allocated = 0;

    for (let i = 0; i < count; i++) {
        const due = new Date(firstDueDate);
        if (frequency === 'HEBDOMADAIRE') due.setDate(due.getDate() + 7 * i);
        else if (frequency === 'TRIMESTRIEL') due.setMonth(due.getMonth() + 3 * i);
        else due.setMonth(due.getMonth() + i);

        // La dernière échéance absorbe le reliquat d'arrondi
        const amount = i === count - 1 ? Math.round((totalAmount - allocated) * 100) / 100 : base;
        allocated += amount;

        installments.push({ position: i + 1, dueDate: due, amount, status: 'A_PAYER' });
    }
    return installments;
}

module.exports = { analyzeAndBook, buildInstallments, getModel };
