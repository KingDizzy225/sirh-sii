const nodemailer = require('nodemailer');

// On tente d'utiliser les variables d'environnement, sinon Ethereal (Mock test account) gratuit
let transporter;

async function createTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Prod / Dev externe
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('=> [MAILER] Connecté au SMTP Custom.');
    } else {
        // Compte Ethereal temporaire gratuit (Fake SMTP)
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log('=> [MAILER] Connecté à Ethereal Test SMTP (Simulation de prod).');
    }
    return transporter;
}

exports.sendMail = async ({ to, subject, html }) => {
    try {
        const trans = await createTransporter();
        const info = await trans.sendMail({
            from: '"SIRH SII" <no-reply@sirh-sii.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });
        console.log("=> [MAILER] Envelope envoyée : %s", info.messageId);
        
        // Ethereal génère une URL de prévisualisation:
        if (info.messageId && trans.options.host === 'smtp.ethereal.email') {
            console.log("=> [MAILER] Aperçu du mail : %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("=> [MAILER] Erreur lors de l'envoi :", error);
        return null;
    }
};
