const nodemailer = require('nodemailer');

// --- Configuration du transporteur SMTP ---
// Pour la production, remplacez par un vrai SMTP (ex: Mailtrap, Gmail, etc.)
// Pour les tests en développement, nous utilisons Ethereal (inbox de test en ligne)
let transporter;

const getTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST) {
        // Production (ex: Gmail, Mailtrap)
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Développement : Compte de test automatique Ethereal
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('📧 [EmailService] Mode TEST activé. Emails visibles sur: https://ethereal.email');
    }
    return transporter;
};

const FROM_NAME = process.env.EMAIL_FROM || 'SIRH SII Côte d\'Ivoire';
const FROM_EMAIL = process.env.SMTP_USER || 'no-reply@sii.ci';

// --- Templates d'email HTML ---

const payslipAvailableTemplate = (employeeName, period, downloadUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #1e3a8a; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">🗂️ SII Côte d'Ivoire – SIRH</h1>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 16px; color: #374151;">Bonjour <strong>${employeeName}</strong>,</p>
    <p style="color: #374151;">Votre bulletin de paie pour la période <strong>${period}</strong> est désormais disponible en téléchargement sur votre espace personnel.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${downloadUrl}" style="background: #1e3a8a; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">📄 Télécharger ma fiche de paie</a>
    </div>
    <p style="color: #6b7280; font-size: 13px;">Ce document est confidentiel. Conservez-le sans limitation de durée.</p>
  </div>
  <div style="background: #f8fafc; padding: 12px; text-align: center; color: #94a3b8; font-size: 11px;">
    SII Côte d'Ivoire · Abidjan, Plateau
  </div>
</div>
`;

const leaveRequestTemplate = (managerName, employeeName, leaveType, startDate, endDate) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #0d9488; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">📅 Demande de Congé – Action Requise</h1>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 16px; color: #374151;">Bonjour <strong>${managerName}</strong>,</p>
    <p style="color: #374151;">Une nouvelle demande de congé a été soumise par <strong>${employeeName}</strong> et requiert votre validation :</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f0fdfa;"><td style="padding: 10px; border: 1px solid #d1fae5; font-weight: bold; color: #064e3b;">Type</td><td style="padding: 10px; border: 1px solid #d1fae5;">${leaveType}</td></tr>
      <tr><td style="padding: 10px; border: 1px solid #d1fae5; font-weight: bold; color: #064e3b;">Du</td><td style="padding: 10px; border: 1px solid #d1fae5;">${new Date(startDate).toLocaleDateString('fr-FR')}</td></tr>
      <tr style="background: #f0fdfa;"><td style="padding: 10px; border: 1px solid #d1fae5; font-weight: bold; color: #064e3b;">Au</td><td style="padding: 10px; border: 1px solid #d1fae5;">${new Date(endDate).toLocaleDateString('fr-FR')}</td></tr>
    </table>
    <p style="color: #374151;">Veuillez vous connecter à la plateforme SIRH pour approuver ou rejeter cette demande.</p>
  </div>
  <div style="background: #f8fafc; padding: 12px; text-align: center; color: #94a3b8; font-size: 11px;">
    SII Côte d'Ivoire · SIRH Platform
  </div>
</div>
`;

const candidateRetainedTemplate = (candidateName, position, company) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #7c3aed; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">🎉 Votre candidature est retenue !</h1>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 16px; color: #374151;">Bonjour <strong>${candidateName}</strong>,</p>
    <p style="color: #374151;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${position}</strong> chez <strong>${company}</strong> a été retenue.</p>
    <p style="color: #374151;">Notre équipe RH vous contactera très prochainement pour les prochaines étapes du processus d'intégration.</p>
    <p style="color: #374151; margin-top: 20px;">Nous vous adressons nos sincères félicitations.</p>
  </div>
  <div style="background: #f8fafc; padding: 12px; text-align: center; color: #94a3b8; font-size: 11px;">
    SII Côte d'Ivoire · Direction des Ressources Humaines
  </div>
</div>
`;

// --- Fonctions d'envoi ---

const sendPayslipAvailableEmail = async (to, employeeName, period, downloadUrl) => {
    try {
        const t = await getTransporter();
        const info = await t.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject: `🗂️ Votre fiche de paie ${period} est disponible`,
            html: payslipAvailableTemplate(employeeName, period, downloadUrl),
        });
        console.log(`📧 Email fiche de paie envoyé à ${to}. Preview: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (err) {
        console.error('❌ Erreur envoi email fiche de paie:', err.message);
    }
};

const sendLeaveRequestEmail = async (to, managerName, employeeName, leaveType, startDate, endDate) => {
    try {
        const t = await getTransporter();
        const info = await t.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject: `📅 Demande de congé de ${employeeName} – Validation requise`,
            html: leaveRequestTemplate(managerName, employeeName, leaveType, startDate, endDate),
        });
        console.log(`📧 Email congé envoyé à ${to}. Preview: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (err) {
        console.error('❌ Erreur envoi email congé:', err.message);
    }
};

const sendCandidateRetainedEmail = async (to, candidateName, position) => {
    try {
        const t = await getTransporter();
        const info = await t.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject: `🎉 Félicitations ! Votre candidature pour ${position} est retenue`,
            html: candidateRetainedTemplate(candidateName, position, 'SII Côte d\'Ivoire'),
        });
        console.log(`📧 Email candidat envoyé à ${to}. Preview: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (err) {
        console.error('❌ Erreur envoi email candidat:', err.message);
    }
};

module.exports = {
    sendPayslipAvailableEmail,
    sendLeaveRequestEmail,
    sendCandidateRetainedEmail,
};
