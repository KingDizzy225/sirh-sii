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
const paie = require('../lib/paie');
const explication = require('../lib/explication');
const { salaireConnu } = require('../lib/demographie');
const dossier = require('../lib/dossier');
const apposition = require('../lib/apposition');
const remuneration = require('../lib/remuneration');
const cloture = require('../lib/cloture');
const preparationPaie = require('../lib/preparationPaie');

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
    if (existant) return existant;

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
    return cree;
};

// `signatureOverride` est un paramètre explicite. Il était auparavant lu dans
// `arguments[2]`, ce qui ne pouvait pas fonctionner : une fonction fléchée n'a
// pas de `arguments` propre et remontait à celui du module CommonJS, dont le
// troisième élément est l'objet `module`. Toujours défini, jamais une chaîne :
// la branche de signature s'exécutait sur chaque bulletin et échouait à chaque
// fois, si bien qu'aucun bulletin signé n'a jamais porté sa signature.
const generatePayslipPDF = async (payroll, employee, signatureOverride) => {
    // Le QR, le signataire et le sceau sont préparés avant le rendu : le corps
    // du PDF est synchrone.
    let qrBuffer = null;
    let registre = null;
    let signataire = null;
    let scelle = null;
    let reference = null;
    try {
        registre = await getOrCreatePayslipToken(payroll, employee);
        reference = registre.token.slice(0, 12).toUpperCase();
        const url = `${getPublicAppUrl()}/verify/${registre.token}`;
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
        qrBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
    } catch (err) {
        // Un bulletin doit pouvoir être produit même si la vérification échoue
        console.error('[PAIE] QR de vérification non généré :', err.message);
    }

    // Signature de l'employeur et sceau. Le bulletin portait déjà la signature
    // du salarié — son accusé de réception — mais rien de l'employeur : il
    // fallait l'imprimer, le signer et le rescanner avant remise.
    try {
        signataire = await apposition.choisirSignataire(null);
        scelle = await apposition.scellerDocument(registre, {
            signataire, typeDocument: 'Bulletin de paie'
        });
    } catch (err) {
        console.error('[PAIE] Bulletin non scellé :', err.message);
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
                const ventilation = paie.normaliserVentilation(b.heuresSupDetail);
                if (ventilation) {
                    // Une ligne par majoration : un total unique ne se vérifie
                    // pas, et c'est précisément la nuit ou le dimanche qu'on
                    // conteste.
                    const LIBELLES_HS = {
                        h15: 'Heures sup. (41e à 46e heure)',
                        h50: 'Heures sup. (au-delà de la 46e heure)',
                        h75: 'Heures sup. de nuit, dimanche ou férié',
                        h100: 'Heures sup. de nuit, dimanche ou férié'
                    };
                    const tauxHoraire = b.baseSalary / TAUX.heuresMensuelles;
                    for (const [categorie, heures] of Object.entries(ventilation)) {
                        if (heures <= 0) continue;
                        const majoration = TAUX.majorationsHeuresSup[categorie];
                        addRow(LIBELLES_HS[categorie], `${heures} h`,
                               `+ ${Math.round((majoration - 1) * 100)} %`,
                               formatFCFA(tauxHoraire * majoration * heures));
                    }
                } else {
                    addRow('Heures supplémentaires', `${b.overtimeHours} h`,
                           `+ ${Math.round((TAUX.majorationHeureSup - 1) * 100)} %`,
                           formatFCFA(b.overtimeAmount));
                }
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
            
            // Signature du salarié : son accusé de réception, à droite.
            const signatureData = signatureOverride || payroll.signature;
            if (typeof signatureData === 'string' && signatureData.length > 0) {
                try {
                    const base64Data = signatureData.replace(/^data:image\/(png|jpeg);base64,/, "");
                    const sigBuffer = Buffer.from(base64Data, 'base64');
                    doc.image(sigBuffer, 400, y - 40, { width: 110, fit: [110, 55] });
                    doc.fillColor('#64748b').font('Helvetica').fontSize(7)
                       .text('Le salarié, pour réception', 400, y + 18, { width: 110 });
                } catch (e) {
                    console.error("Failed to render signature image:", e);
                }
            }

            // Signature de l'employeur, à gauche : c'est elle qui évitait
            // jusqu'ici l'impression, la signature manuscrite et le scan.
            if (signataire) {
                try {
                    const trait = apposition.imageDepuisDataUrl(signataire.signatureImage);
                    if (trait) doc.image(trait, 150, y - 40, { fit: [110, 55] });
                    const cachet = apposition.imageDepuisDataUrl(signataire.cachetImage);
                    if (cachet) doc.image(cachet, 270, y - 45, { fit: [60, 60] });
                } catch (e) {
                    console.error('[PAIE] Signature employeur non rendue :', e.message);
                }
                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8)
                   .text(signataire.nom, 150, y + 18, { width: 170 });
                doc.fillColor('#64748b').font('Helvetica').fontSize(7)
                   .text(signataire.fonction, 150, y + 29, { width: 170 });
            }

            if (scelle) {
                doc.fillColor('#94a3b8').font('Helvetica').fontSize(6).text(
                    `Signé électroniquement et scellé (${scelle.algorithme}, clé ${scelle.keyId}).`,
                    150, y + 45, { width: 380 }
                );
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

        if (!Array.isArray(payrolls) || payrolls.length === 0) {
            return res.status(400).json({ error: 'Aucun bulletin à produire.' });
        }

        // Un mois clôturé ne se relance pas : ses bulletins ont été remis,
        // signés, déclarés. Le corriger passe par une réouverture motivée.
        const clotures = await cloture.moisClotures(payrolls.map((p) => p.period));
        if (clotures.length > 0) {
            const c = clotures[0].derniere;
            return res.status(409).json({
                error: `La paie de ${clotures[0].periode} est clôturée depuis le `
                    + `${new Date(c.clotureLe).toLocaleDateString('fr-FR')} (${c.cloturePar}).`,
                remede: 'Pour rectifier un bulletin, un administrateur rouvre le mois en motivant '
                    + 'la réouverture, puis la paie est relancée. Les bulletins remplacés sont conservés.',
                periodes: clotures.map((x) => x.periode)
            });
        }
        
        const employeeIds = payrolls.map(p => p.employeeId);
        const employees = await prisma.employee.findMany({ where: { id: { in: employeeIds } } });
        const employeeMap = employees.reduce((acc, emp) => { acc[emp.id] = emp; return acc; }, {});
        
        const ecarts = [];
        const auteur = req.user?.name || req.user?.email || null;
        let remplaces = 0;

        for (let p of payrolls) {
            const employee = employeeMap[p.employeeId];
            if (!employee) continue;

            /**
             * Rémunération de référence.
             *
             * Le montant était lu dans la requête et nulle part ailleurs : il
             * fallait le ressaisir chaque mois, et rien ne signalait qu'il avait
             * changé. La fiche du salarié fait désormais foi ; un montant
             * transmis qui s'en écarte est accepté — une prime exceptionnelle,
             * un mois incomplet, cela existe — mais signalé, pour que l'écart
             * soit vu plutôt que subi.
             */
            /**
             * Le salaire retenu est celui en vigueur au premier jour de la
             * période traitée. Une augmentation prenant effet en cours de mois
             * ne s'applique donc qu'à la paie suivante : c'est le choix le plus
             * prévisible, et il évite un rappel involontaire. Une entreprise qui
             * préfère la proratiser devra le décider explicitement.
             */
            const reference = await remuneration.salaireA(employee.id, p.period);
            const transmis = p.baseSalary != null && p.baseSalary !== '' ? Number(p.baseSalary) : null;

            if (transmis == null && reference.montant == null) {
                ecarts.push({
                    employeeId: employee.id,
                    nom: `${employee.lastName} ${employee.firstName}`.trim(),
                    motif: "Aucune rémunération de référence et aucun montant transmis."
                });
                continue;
            }
            if (transmis != null && reference.montant != null && Math.abs(transmis - reference.montant) > 1) {
                ecarts.push({
                    employeeId: employee.id,
                    nom: `${employee.lastName} ${employee.firstName}`.trim(),
                    reference: reference.montant,
                    transmis,
                    motif: 'Le montant saisi diffère de la rémunération de référence.'
                });
            }
            p.baseSalary = transmis != null ? transmis : reference.montant;

            /**
             * Échéance de prêt due sur cette période.
             *
             * Elle s'ajoute aux retenues du bulletin. Sans cette lecture, un
             * échéancier arrêté à l'accord ne serait jamais prélevé : le prêt
             * figurerait au dossier et ne se rembourserait pas.
             */
            const periodeCle = new Date(p.period).toISOString().slice(0, 7);
            // Une échéance déjà retenue reste due à la relance, même si elle a
            // soldé le prêt : filtrer sur les seuls prêts en cours la faisait
            // disparaître du bulletin relancé du dernier mois.
            const echeanceDue = await prisma.echeancePret.findFirst({
                where: {
                    periode: periodeCle,
                    OR: [
                        { statut: 'A_RETENIR', pret: { employeeId: employee.id, statut: 'EN_COURS' } },
                        { statut: 'RETENUE', pret: { employeeId: employee.id } }
                    ]
                },
                include: { pret: { select: { id: true } } }
            });
            if (echeanceDue) {
                p.deductions = (Number(p.deductions) || 0) + echeanceDue.montant;
            }

            // Un seul calcul, partagé avec le bulletin PDF, l'export comptable
            // et les déclarations sociales. Le net retranchait auparavant la
            // part patronale au lieu des retenues du salarié : sur un brut de
            // 500 000 FCFA, la base enregistrait 425 000 quand le bulletin
            // remis au salarié affichait 393 325.
            const bulletin = calculerPaie({
                baseSalary: p.baseSalary,
                bonus: p.bonus,
                overtimeHours: p.overtimeHours,
                // Ventilation par majoration, quand elle est connue (pointages).
                heuresSupDetail: p.heuresSupDetail,
                leaveDays: p.leaveDays,
                deductions: p.deductions,
                // L'ancienneté se lit sur la fiche, jamais dans la requête :
                // c'est une donnée du contrat, pas une saisie de paie.
                hireDate: employee.hireDate,
                periode: p.period
            });

            // Le bulletin existant était supprimé sans trace. Il est désormais
            // archivé avec son PDF et sa date de signature, et les liens déjà
            // transmis au salarié continuent de mener au document remis.
            const existants = await prisma.payroll.findMany({
                where: { employeeId: employee.id, period: new Date(p.period) }
            });
            const archives = [];
            for (const ancien of existants) {
                archives.push((await cloture.archiverBulletin(ancien, auteur)).archive);
            }
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
                    heuresSupDetail: bulletin.heuresSupDetail,
                    leaveDays: bulletin.leaveDays,
                    overtimeAmount: bulletin.overtimeAmount,
                    leaveDeduction: bulletin.leaveDeduction,
                    grossSalary: bulletin.grossSalary,
                    cnpsEmployee: bulletin.cnpsEmployee,
                    cmu: bulletin.cmu,
                    taxableIncome: bulletin.taxableIncome,
                    its: bulletin.its,
                    primeAnciennete: bulletin.primeAnciennete,
                    employerContributions: bulletin.employerContributions,
                    employeeContributions: bulletin.employeeContributions,
                    netSalary: bulletin.netSalary,
                    status: 'APPROVED'
                }
            });

            /**
             * L'échéance est marquée retenue, rattachée au bulletin qui la
             * porte. Une paie relancée sur la même période repasse ici : le
             * rattachement est donc réécrit plutôt qu'ajouté, et l'échéance ne
             * peut pas être prélevée deux fois.
             */
            if (echeanceDue) {
                await prisma.echeancePret.update({
                    where: { id: echeanceDue.id },
                    data: { statut: 'RETENUE', payrollId: pr.id, retenueLe: new Date() }
                });

                // Le prêt est soldé quand il ne reste aucune échéance à
                // retenir — déduit de l'échéancier, jamais d'un compteur tenu
                // à part qui pourrait mentir sur l'état réel.
                const reste = await prisma.echeancePret.count({
                    where: { pretId: echeanceDue.pret.id, statut: 'A_RETENIR' }
                });
                if (reste === 0) {
                    await prisma.pret.update({
                        where: { id: echeanceDue.pret.id }, data: { statut: 'SOLDE' }
                    });
                }
            }

            const pdfPath = await generatePayslipPDF({ ...pr }, employee);
            
            pr = await prisma.payroll.update({ where: { id: pr.id }, data: { pdfPath } });
            results.push(pr);

            if (archives.length > 0) {
                await prisma.bulletinRemplace.updateMany({
                    where: { id: { in: archives.map((a) => a.id) } },
                    data: { remplaceParPayrollId: pr.id }
                });
                remplaces += archives.length;
            }
        }
        res.status(201).json({
            message: 'Paie traitée avec succès',
            count: results.length,
            data: results,
            // Les écarts sont rendus avec le résultat plutôt que journalisés
            // seuls : un montant qui s'éloigne de la référence doit être vu par
            // celui qui lance la paie, au moment où il la lance.
            ecarts,
            // Bulletins existants remplacés par cette exécution, et conservés.
            remplaces
        });
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

/**
 * GET /api/payroll/:id/explication
 *
 * « Pourquoi j'ai touché ça ce mois-ci ? » est la première question posée à une
 * RH. Le bulletin porte les lignes, jamais les raisons ; le salarié qui
 * constate un écart n'a d'autre recours que de passer au bureau.
 *
 * Rien n'est recalculé ni deviné ici : les écarts sont lus entre deux bulletins
 * enregistrés et rendus en français courant.
 */
const getExplication = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await prisma.payroll.findUnique({
            where: { id }, include: { employee: true }
        });
        if (!payroll) return res.status(404).json({ error: 'Fiche de paie introuvable' });
        if (!(await canAccessPayroll(req.user, payroll))) {
            return res.status(403).json({ error: 'Accès interdit à cette fiche de paie.' });
        }

        // Bulletin immédiatement antérieur du même salarié. On ne remonte pas
        // plus loin : comparer à un mois d'il y a un an expliquerait un écart
        // que le salarié n'a pas constaté.
        const precedent = await prisma.payroll.findFirst({
            where: { employeeId: payroll.employeeId, period: { lt: payroll.period } },
            orderBy: { period: 'desc' }
        });

        const mois = (d) => new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        res.json({
            periode: mois(payroll.period),
            periodePrecedente: precedent ? mois(precedent.period) : null,
            ...explication.expliquer(payroll, precedent)
        });
    } catch (error) {
        console.error('Erreur explication de bulletin :', error);
        res.status(500).json({ error: "Erreur lors de l'explication du bulletin." });
    }
};

/**
 * GET /api/payrolls/prime-anciennete
 *
 * Ce que la prime d'ancienneté coûterait si elle était activée, salarié par
 * salarié. Elle est due par la convention collective au-delà de deux ans, et
 * l'application ne la versait pas.
 *
 * `runPayroll` inscrivant les bulletins directement comme approuvés, l'activer
 * d'office changerait dès la prochaine paie ce que touchent les salariés. Cet
 * état permet de décider sur un montant connu plutôt que de découvrir l'écart
 * après coup.
 */
const getPrimeAnciennete = async (req, res) => {
    try {
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: {
                id: true, firstName: true, lastName: true, department: true,
                hireDate: true, baseSalary: true,
                payrolls: { orderBy: { period: 'desc' }, take: 1, select: { baseSalary: true } }
            }
        });

        const lignes = [];
        let totalMensuel = 0;
        let sansSalaire = 0;
        let sansDate = 0;

        for (const s of salaries) {
            const base = salaireConnu(s);
            if (base === 0) { sansSalaire++; continue; }

            const prime = paie.calculerPrimeAnciennete(base, s.hireDate);
            if (prime.annees === null) { sansDate++; continue; }
            if (!prime.due) continue;

            totalMensuel += prime.montant;
            lignes.push({
                salarie: `${s.firstName} ${s.lastName}`,
                service: s.department,
                anciennete: prime.annees,
                anneesRetenues: prime.anneesRetenues,
                salaireBase: Math.round(base),
                montantMensuel: prime.montant,
                plafonne: Boolean(prime.motif)
            });
        }

        lignes.sort((a, b) => b.montantMensuel - a.montantMensuel);

        res.json({
            active: paie.PRIME_ANCIENNETE_ACTIVE,
            bareme: {
                taux: paie.TAUX.primeAncienneteTaux,
                seuilAnnees: paie.TAUX.primeAncienneteSeuilAnnees,
                plafondAnnees: paie.TAUX.primeAnciennetePlafondAnnees,
                libelle: `${(paie.TAUX.primeAncienneteTaux * 100).toFixed(0)} % du salaire de base `
                    + `par année d'ancienneté, au-delà de ${paie.TAUX.primeAncienneteSeuilAnnees} ans, `
                    + `plafonné à ${paie.TAUX.primeAnciennetePlafondAnnees} ans`
            },
            beneficiaires: lignes.length,
            totalMensuel,
            // Le brut augmente, donc la charge patronale aussi : le coût réel
            // n'est pas le seul montant versé.
            coutEmployeurMensuel: Math.round(totalMensuel * (1 + paie.TAUX.cnpsPatronal)),
            lignes,
            lacunes: {
                sansSalaireDeReference: sansSalaire,
                sansDateEmbauche: sansDate
            },
            message: paie.PRIME_ANCIENNETE_ACTIVE
                ? 'La prime est appliquée aux bulletins produits.'
                : "La prime n'est pas appliquée : poser PRIME_ANCIENNETE_ACTIVE=true pour "
                  + "l'inclure à la prochaine paie. Les bulletins déjà émis ne sont pas repris."
        });
    } catch (error) {
        console.error("Erreur état de la prime d'ancienneté :", error);
        res.status(500).json({ error: "Erreur lors du calcul de la prime d'ancienneté." });
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

        // Un export déclaratif sans matricule ni numéro CNPS est déposé, puis
        // rejeté — et le rejet arrive après l'échéance. La colonne MATRICULE
        // reprenait d'ailleurs l'identifiant technique du salarié, un UUID que
        // ni Sage ni la CNPS ne reconnaissent. Mieux vaut refuser le fichier
        // ici, en disant qui compléter.
        const incomplets = payrolls
            .map(p => p.employee)
            .filter(emp => emp && !dossier.declarable(emp));

        if (incomplets.length > 0) {
            return res.status(409).json({
                error: `${incomplets.length} salarié(s) sans matricule ou sans numéro CNPS : ` +
                       "le fichier serait rejeté au dépôt.",
                salaries: incomplets.map(emp => ({
                    id: emp.id,
                    nom: `${emp.lastName || ''} ${emp.firstName || ''}`.trim(),
                    manquants: dossier.manquants(emp, 'declaration').map(m => m.libelle)
                })),
                remede: "Compléter les dossiers depuis Effectif › Conformité, puis relancer l'export."
            });
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
                csvContent += `${emp.matricule};${emp.lastName};${emp.firstName};${rubrique};${Math.round(montant)}\n`;
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

/**
 * Récapitulatif de la déclaration sociale d'un mois.
 *
 * Jusqu'ici, la déclaration CNPS partait sous forme d'un CSV construit dans le
 * navigateur, sans que personne ne voie les totaux avant l'envoi. Un montant
 * faux ne se remarquait qu'après dépôt auprès de l'organisme.
 *
 * Cette route agrège les montants **enregistrés** sur les bulletins — elle ne
 * recalcule rien — et signale ce qui empêcherait une déclaration sincère :
 * fiches sans décomposition, salariés sans bulletin du mois, bulletins encore
 * à l'état de brouillon.
 */
const getDeclaration = async (req, res) => {
    try {
        const mois = intervalleMois(req.query.period);

        const [fiches, effectifActif] = await Promise.all([
            prisma.payroll.findMany({
                where: { period: { gte: mois.gte, lt: mois.lt } },
                include: {
                    employee: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            department: true, hireDate: true, status: true,
                            matricule: true, cnpsNumber: true
                        }
                    }
                },
                orderBy: { employee: { lastName: 'asc' } }
            }),
            prisma.employee.count({ where: { status: 'ACTIVE' } })
        ]);

        const total = (champ) => fiches.reduce((s, f) => s + (f[champ] || 0), 0);

        // Une fiche sans décomposition sortirait à zéro dans la déclaration.
        const sansDetail = fiches.filter(f => f.grossSalary == null);
        const brouillons = fiches.filter(f => f.status === 'DRAFT');

        const anomalies = [];
        if (sansDetail.length > 0) {
            anomalies.push({
                gravite: 'bloquante',
                libelle: `${sansDetail.length} bulletin(s) sans décomposition des cotisations`,
                consequence: 'Ils seraient déclarés à zéro.',
                remede: 'Relancer la paie du mois, ou exécuter npm run repair-payrolls.'
            });
        }
        if (fiches.length > 0 && fiches.length < effectifActif) {
            anomalies.push({
                gravite: 'avertissement',
                libelle: `${effectifActif - fiches.length} salarié(s) actif(s) sans bulletin ce mois-ci`,
                consequence: 'Ils seront absents de la déclaration.',
                remede: 'Vérifier les entrées et sorties du mois avant dépôt.'
            });
        }
        // Dossiers incomplets : la déclaration se calcule quand même — la RH
        // doit voir les montants — mais elle ne pourra pas être déposée en
        // l'état, et l'export refusera de produire le fichier.
        const nonDeclarables = fiches
            .map(f => f.employee)
            .filter(emp => emp && !dossier.declarable(emp));
        if (nonDeclarables.length > 0) {
            anomalies.push({
                gravite: 'bloquante',
                libelle: `${nonDeclarables.length} salarié(s) sans matricule ou sans numéro CNPS`,
                consequence: 'Le dépôt serait rejeté, et le rejet arriverait après l\'échéance.',
                remede: 'Compléter les dossiers depuis Effectif › Conformité.'
            });
        }

        if (brouillons.length > 0) {
            anomalies.push({
                gravite: 'avertissement',
                libelle: `${brouillons.length} bulletin(s) encore à l'état de brouillon`,
                consequence: 'Des montants non validés seraient déclarés.',
                remede: 'Approuver ou corriger ces bulletins.'
            });
        }

        res.json({
            periode: mois.libelle,
            effectifDeclare: fiches.length,
            effectifActif,
            taux: {
                cnpsSalarie: TAUX.cnpsSalarie,
                cnpsPatronal: TAUX.cnpsPatronal,
                cmuForfait: TAUX.cmuForfait
            },
            totaux: {
                brut: total('grossSalary'),
                cnpsSalarie: total('cnpsEmployee'),
                cnpsPatronal: total('employerContributions'),
                cmu: total('cmu'),
                assietteITS: total('taxableIncome'),
                its: total('its'),
                retenuesSalariales: total('employeeContributions'),
                net: total('netSalary')
            },
            // Ce que l'entreprise verse effectivement à chaque organisme.
            aVerser: {
                cnps: total('cnpsEmployee') + total('employerContributions'),
                cmu: total('cmu'),
                impots: total('its')
            },
            coutEmployeur: total('grossSalary') + total('employerContributions'),
            anomalies,
            lignes: fiches.map(f => ({
                employeeId: f.employeeId,
                nom: `${f.employee?.lastName || ''} ${f.employee?.firstName || ''}`.trim(),
                matricule: f.employee?.matricule || null,
                numeroCnps: f.employee?.cnpsNumber || null,
                declarable: f.employee ? dossier.declarable(f.employee) : false,
                departement: f.employee?.department || null,
                dateEmbauche: f.employee?.hireDate || null,
                brut: f.grossSalary,
                cnpsSalarie: f.cnpsEmployee,
                cnpsPatronal: f.employerContributions,
                cmu: f.cmu,
                assietteITS: f.taxableIncome,
                its: f.its,
                net: f.netSalary,
                statut: f.status,
                complet: f.grossSalary != null
            }))
        });
    } catch (error) {
        console.error('Erreur déclaration sociale :', error);
        res.status(500).json({ error: 'Erreur lors du calcul de la déclaration.' });
    }
};

/**
 * GET /api/payrolls/cloture?period=AAAA-MM
 *
 * Où en est le mois : clôturé ou non, par qui, et ce qui empêcherait ou
 * mériterait d'être vu avant de le clôturer.
 */
const getCloture = async (req, res) => {
    try {
        const [situation, controles] = await Promise.all([
            cloture.etat(req.query.period),
            cloture.controler(req.query.period)
        ]);
        res.json({ ...situation, controles });
    } catch (error) {
        console.error('Erreur état de clôture :', error);
        res.status(500).json({ error: "Erreur lors de la lecture de l'état de clôture." });
    }
};

/**
 * POST /api/payrolls/cloture { period, accepterAvertissements }
 *
 * Les avertissements ne bloquent pas — un salarié sans bulletin peut être
 * voulu — mais ils doivent avoir été vus : sans confirmation explicite, la
 * clôture est refusée et les rend.
 */
const cloturer = async (req, res) => {
    try {
        const { period, accepterAvertissements } = req.body || {};
        if (!/^\d{4}-\d{2}/.test(String(period || ''))) {
            return res.status(400).json({ error: 'Période attendue au format AAAA-MM.' });
        }

        const situation = await cloture.etat(period);
        if (situation.cloturee) {
            return res.status(409).json({ error: `La paie de ${situation.periode} est déjà clôturée.` });
        }

        const controles = await cloture.controler(period);
        if (controles.bloquantes.length > 0) {
            return res.status(409).json({
                error: "Clôture impossible en l'état.",
                bloquantes: controles.bloquantes,
                avertissements: controles.avertissements
            });
        }
        if (controles.avertissements.length > 0 && accepterAvertissements !== true) {
            return res.status(409).json({
                error: 'Des points restent à vérifier avant de clôturer.',
                avertissements: controles.avertissements,
                confirmationRequise: true
            });
        }

        const creee = await prisma.cloturePaie.create({
            data: {
                periode: controles.periode,
                cloturePar: req.user?.name || req.user?.email || 'inconnu',
                effectif: controles.effectif,
                masseBrute: controles.masseBrute,
                netTotal: controles.netTotal,
                avertissements: controles.avertissements.length > 0 ? controles.avertissements : undefined
            }
        });

        res.status(201).json({
            message: `Paie de ${controles.periode} clôturée : elle ne peut plus être relancée sans réouverture.`,
            cloture: creee
        });
    } catch (error) {
        console.error('Erreur clôture de paie :', error);
        res.status(500).json({ error: 'Erreur lors de la clôture.' });
    }
};

/**
 * POST /api/payrolls/cloture/reouvrir { period, motif }
 *
 * Réservé à l'administration. Le motif est conservé avec la clôture qu'il
 * lève : c'est lui qu'on relira quand un bulletin rectificatif sera discuté.
 */
const reouvrir = async (req, res) => {
    try {
        const { period, motif } = req.body || {};
        const situation = await cloture.etat(period);
        if (!situation.cloturee) {
            return res.status(409).json({ error: `La paie de ${situation.periode} n'est pas clôturée.` });
        }
        const texte = String(motif || '').trim();
        if (texte.length < cloture.MOTIF_REOUVERTURE_MIN) {
            return res.status(400).json({
                error: `Motif requis, d'au moins ${cloture.MOTIF_REOUVERTURE_MIN} caractères : `
                    + 'il est conservé avec la réouverture.'
            });
        }

        await prisma.cloturePaie.update({
            where: { id: situation.derniere.id },
            data: {
                reouvertLe: new Date(),
                reouvertPar: req.user?.name || req.user?.email || 'inconnu',
                motifReouverture: texte
            }
        });

        res.json({
            message: `Paie de ${situation.periode} rouverte. Les bulletins relancés remplaceront `
                + 'les actuels, qui restent conservés. Pensez à clôturer de nouveau.'
        });
    } catch (error) {
        console.error('Erreur réouverture de paie :', error);
        res.status(500).json({ error: 'Erreur lors de la réouverture.' });
    }
};

/**
 * GET /api/payrolls/preparation?period=AAAA-MM
 *
 * Éléments variables que l'application connaît déjà — salaire en vigueur,
 * congés sans solde, heures supplémentaires ventilées, échéance de prêt —
 * proposés à la saisie avec leur origine.
 */
const getPreparation = async (req, res) => {
    try {
        res.json(await preparationPaie.preparer(req.query.period));
    } catch (error) {
        console.error('Erreur préparation de paie :', error);
        res.status(500).json({ error: 'Erreur lors de la préparation de la paie.' });
    }
};

module.exports = { getPayrolls, getMyPayrolls, runPayroll, downloadPayslip, getPayslip, getExplication, getPrimeAnciennete, signPayroll, exportSage, getDeclaration, getCloture, cloturer, reouvrir, getPreparation };
