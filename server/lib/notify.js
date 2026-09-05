const prisma = require('./../prismaClient');
const { sendMail } = require('./mailer');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Notification d'un salarié : en base, et par email.
 *
 * Les traitements automatiques produisaient jusqu'ici des notifications qui ne
 * vivaient que dans l'icône cloche : une alerte de fin de CDD passait inaperçue
 * si personne n'ouvrait l'application ce jour-là, ce qui vidait de son sens
 * l'automatisation elle-même.
 *
 * L'email est un complément, jamais une condition : un échec d'envoi ne doit
 * pas empêcher la notification d'exister en base.
 */

const ENVOI_ACTIF = process.env.DISABLE_NOTIFICATION_EMAILS !== 'true';

const gabarit = (titre, corps, lien) => `
<div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:auto;color:#1e293b">
  <div style="background:#0f172a;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">
    <strong style="font-size:15px">${titre}</strong>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:22px">
    <p style="margin:0 0 16px;line-height:1.55">${corps}</p>
    ${lien ? `<a href="${lien}" style="display:inline-block;background:#2563eb;color:#fff;
      text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px">
      Ouvrir dans le SIRH</a>` : ''}
    <p style="margin:22px 0 0;font-size:11px;color:#94a3b8">
      Message automatique du système d'information RH. Ne pas répondre à cette adresse.
    </p>
  </div>
</div>`;

/**
 * Crée la notification et tente l'envoi d'un email.
 * @param {{employeeId: string, message: string, type?: string, link?: string, titre?: string}} options
 */
async function notifierSalarie({ employeeId, message, type = 'Info', link = null, titre }) {
    // 1. Notification en base — c'est elle qui fait foi
    const notification = await prisma.notification.create({
        data: { employeeId, message, type, link }
    });

    if (!ENVOI_ACTIF) return notification;

    // 2. Email, au mieux
    try {
        const salarie = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { email: true, firstName: true }
        });
        if (!salarie || !salarie.email) return notification;

        const lienComplet = link ? `${getPublicAppUrl()}${link}` : null;
        await sendMail({
            to: salarie.email,
            subject: titre || 'Notification RH',
            html: gabarit(titre || 'Notification RH', message, lienComplet)
        });
    } catch (error) {
        console.error('[NOTIFY] Email non envoyé :', error.message);
    }

    return notification;
}

/**
 * Notifie la RH et l'administration, sans réémettre une alerte identique
 * encore non lue — une relance quotidienne ne doit pas devenir du harcèlement.
 */
async function notifierRH(message, type = 'Alerte', link = null, titre) {
    const destinataires = await prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' }, role: { in: ['HR', 'Administrator'] } },
        select: { id: true }
    });

    let envoyees = 0;
    for (const d of destinataires) {
        const existe = await prisma.notification.findFirst({
            where: { employeeId: d.id, message, isRead: false }
        });
        if (existe) continue;
        await notifierSalarie({ employeeId: d.id, message, type, link, titre });
        envoyees++;
    }
    return envoyees;
}

module.exports = { notifierSalarie, notifierRH, gabarit };
