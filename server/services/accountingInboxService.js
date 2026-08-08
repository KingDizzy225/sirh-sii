const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');

// ----------------------------------------------------------------------------
// BOÎTE EMAIL DE L'AGENT COMPTABLE IA
// Relève périodiquement une boîte IMAP dédiée (ex: comptabilite@federation.ci),
// enregistre les pièces jointes (factures, reçus, PDF, images) comme pièces
// comptables, puis déclenche l'analyse par l'Agent Comptable IA.
//
// Configuration (.env) :
//   ACCOUNTING_IMAP_HOST=imap.gmail.com
//   ACCOUNTING_IMAP_PORT=993
//   ACCOUNTING_IMAP_USER=comptabilite@federation.ci
//   ACCOUNTING_IMAP_PASS=motdepasse_application
//   ACCOUNTING_IMAP_TLS=true            (défaut: true)
//   ACCOUNTING_INBOX_POLL_MINUTES=5     (défaut: 5)
// ----------------------------------------------------------------------------

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const accountingDir = path.join(__dirname, '../uploads/accounting');

let pollTimer = null;
let isChecking = false;
let lastCheckAt = null;
let lastError = null;
let totalImported = 0;

function getConfig() {
    const { ACCOUNTING_IMAP_HOST, ACCOUNTING_IMAP_PORT, ACCOUNTING_IMAP_USER, ACCOUNTING_IMAP_PASS } = process.env;
    if (!ACCOUNTING_IMAP_HOST || !ACCOUNTING_IMAP_USER || !ACCOUNTING_IMAP_PASS) return null;
    return {
        host: ACCOUNTING_IMAP_HOST,
        port: parseInt(ACCOUNTING_IMAP_PORT, 10) || 993,
        secure: process.env.ACCOUNTING_IMAP_TLS !== 'false',
        auth: { user: ACCOUNTING_IMAP_USER, pass: ACCOUNTING_IMAP_PASS }
    };
}

function getStatus() {
    const config = getConfig();
    return {
        configured: !!config,
        address: config ? config.auth.user : null,
        polling: !!pollTimer,
        pollMinutes: parseInt(process.env.ACCOUNTING_INBOX_POLL_MINUTES, 10) || 5,
        lastCheckAt,
        lastError,
        totalImported
    };
}

/**
 * Relève la boîte IMAP : importe les pièces jointes des emails non lus
 * et lance l'analyse IA sur chaque nouvelle pièce.
 */
async function checkNow() {
    const config = getConfig();
    if (!config) {
        throw new Error("Boîte email non configurée. Renseignez ACCOUNTING_IMAP_HOST, ACCOUNTING_IMAP_USER et ACCOUNTING_IMAP_PASS dans le .env du backend.");
    }
    if (isChecking) return { imported: 0, message: 'Une relève est déjà en cours.' };

    // Dépendances optionnelles : le serveur démarre même si elles manquent
    let ImapFlow, simpleParser;
    try {
        ({ ImapFlow } = require('imapflow'));
        ({ simpleParser } = require('mailparser'));
    } catch (e) {
        throw new Error("Modules 'imapflow' et 'mailparser' non installés. Exécutez `npm install imapflow mailparser` dans le dossier server.");
    }

    isChecking = true;
    lastError = null;
    const importedDocs = [];

    const client = new ImapFlow({ ...config, logger: false });

    try {
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
            const unseenUids = await client.search({ seen: false });
            for (const uid of unseenUids || []) {
                const { content } = await client.download(String(uid), undefined, { uid: true });
                const mail = await simpleParser(content);

                const messageId = mail.messageId || `imap-${config.auth.user}-${uid}`;
                const attachments = (mail.attachments || []).filter(a =>
                    ALLOWED_MIME.includes((a.contentType || '').toLowerCase())
                );

                for (const [idx, att] of attachments.entries()) {
                    // Anti-doublon : un même email ne réimporte pas ses pièces
                    const existing = await prisma.accountingDocument.findFirst({
                        where: { emailMessageId: messageId, fileName: att.filename || `piece_${idx}` }
                    });
                    if (existing) continue;

                    if (!fs.existsSync(accountingDir)) fs.mkdirSync(accountingDir, { recursive: true });
                    const ext = path.extname(att.filename || '') || (att.contentType === 'application/pdf' ? '.pdf' : '.jpg');
                    const storedName = `email_${Date.now()}_${idx}${ext}`;
                    fs.writeFileSync(path.join(accountingDir, storedName), att.content);

                    const doc = await prisma.accountingDocument.create({
                        data: {
                            source: 'EMAIL',
                            emailFrom: mail.from?.text || null,
                            emailSubject: mail.subject || null,
                            emailReceivedAt: mail.date || new Date(),
                            emailMessageId: messageId,
                            fileName: att.filename || storedName,
                            filePath: `/uploads/accounting/${storedName}`,
                            mimeType: att.contentType,
                            fileSize: att.content.length,
                            status: 'RECU'
                        }
                    });
                    importedDocs.push(doc);
                }

                await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
            }
        } finally {
            lock.release();
        }
        await client.logout().catch(() => {});
    } catch (e) {
        lastError = e.message;
        try { await client.close(); } catch (_) { /* déjà fermé */ }
        throw new Error(`Relève IMAP échouée : ${e.message}`);
    } finally {
        isChecking = false;
        lastCheckAt = new Date();
    }

    totalImported += importedDocs.length;

    // Analyse IA en arrière-plan de chaque pièce importée
    const accountingAgent = require('./accountingAgent');
    for (const doc of importedDocs) {
        accountingAgent.analyzeAndBook(doc.id).catch(err =>
            console.error(`[COMPTA INBOX] Analyse auto échouée pour ${doc.fileName}:`, err.message)
        );
    }

    console.log(`[COMPTA INBOX] Relève terminée : ${importedDocs.length} pièce(s) importée(s).`);
    return { imported: importedDocs.length, documents: importedDocs };
}

/** Démarre la relève périodique si la boîte est configurée. */
function start() {
    const config = getConfig();
    if (!config) {
        console.log('[COMPTA INBOX] Boîte email non configurée — relève automatique désactivée (voir variables ACCOUNTING_IMAP_* dans .env).');
        return;
    }
    const minutes = parseInt(process.env.ACCOUNTING_INBOX_POLL_MINUTES, 10) || 5;
    pollTimer = setInterval(() => {
        checkNow().catch(err => console.error('[COMPTA INBOX] Relève périodique échouée:', err.message));
    }, minutes * 60 * 1000);
    pollTimer.unref();
    console.log(`[COMPTA INBOX] Relève automatique de ${config.auth.user} toutes les ${minutes} min.`);

    // Première relève au démarrage
    checkNow().catch(err => console.error('[COMPTA INBOX] Relève initiale échouée:', err.message));
}

module.exports = { start, checkNow, getStatus };
