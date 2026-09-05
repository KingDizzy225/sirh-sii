const prisma = require('../prismaClient');
const { runOnce } = require('./runOnce');
const { sendMail } = require('../lib/mailer');
const { gabarit } = require('../lib/notify');
const { getPublicAppUrl } = require('../lib/publicUrl');

/**
 * Récapitulatif hebdomadaire adressé à la direction des ressources humaines.
 *
 * Les alertes quotidiennes signalent l'urgence ; ce récapitulatif donne la
 * vue d'ensemble qu'aucun écran ne fournit sans qu'on aille la chercher.
 */

/** Clé de période au format « 2026-S36 », pour une exécution par semaine. */
const semainePeriode = (date) => {
    const ref = new Date(date);
    const debutAnnee = new Date(ref.getFullYear(), 0, 1);
    const jours = Math.floor((ref - debutAnnee) / 86400000);
    const semaine = Math.ceil((jours + debutAnnee.getDay() + 1) / 7);
    return `${ref.getFullYear()}-S${String(semaine).padStart(2, '0')}`;
};

async function envoyerRecapHebdomadaire(referenceDate = new Date()) {
    return runOnce('WEEKLY_DIGEST', semainePeriode(referenceDate), async () => {
        const ilYA7Jours = new Date(referenceDate);
        ilYA7Jours.setDate(ilYA7Jours.getDate() - 7);
        const dans30Jours = new Date(referenceDate);
        dans30Jours.setDate(dans30Jours.getDate() + 30);
        const actifs = { status: { not: 'TERMINATED' } };

        const [
            effectif, arrivees, departs, congesEnAttente,
            fraisEnAttente, avancesEnAttente, cddProches, essaisProches
        ] = await Promise.all([
            prisma.employee.count({ where: actifs }),
            prisma.employee.count({ where: { hireDate: { gte: ilYA7Jours, lte: referenceDate } } }),
            prisma.employee.count({ where: { exitDate: { gte: ilYA7Jours, lte: referenceDate } } }),
            prisma.leave.count({ where: { status: { in: ['PENDING', 'PENDING_HR', 'Pending'] } } }),
            prisma.expense.count({ where: { status: 'En attente' } }),
            prisma.salaryAdvance.count({ where: { status: 'En attente' } }),
            prisma.employee.count({ where: { ...actifs, contractEndDate: { gte: referenceDate, lte: dans30Jours } } }),
            prisma.employee.count({ where: { ...actifs, trialPeriodEndDate: { gte: referenceDate, lte: dans30Jours } } })
        ]);

        const ligne = (libelle, valeur, alerte = false) =>
            `<tr>
               <td style="padding:7px 0;border-bottom:1px solid #f1f5f9">${libelle}</td>
               <td style="padding:7px 0;border-bottom:1px solid #f1f5f9;text-align:right;
                          font-weight:700;color:${alerte && valeur > 0 ? '#b91c1c' : '#0f172a'}">${valeur}</td>
             </tr>`;

        const corps =
            `<table style="width:100%;border-collapse:collapse;font-size:14px">
               ${ligne('Effectif actif', effectif)}
               ${ligne('Arrivées cette semaine', arrivees)}
               ${ligne('Départs cette semaine', departs)}
               ${ligne('Demandes de congé en attente', congesEnAttente, true)}
               ${ligne('Notes de frais à valider', fraisEnAttente, true)}
               ${ligne("Demandes d'acompte en attente", avancesEnAttente, true)}
               ${ligne('Fins de contrat sous 30 jours', cddProches, true)}
               ${ligne("Périodes d'essai à trancher sous 30 jours", essaisProches, true)}
             </table>`;

        // Destinataires : direction RH et administration
        const destinataires = await prisma.employee.findMany({
            // `email` est obligatoire au schéma : `not: null` y était rejeté par
            // Prisma, et le récapitulatif hebdomadaire échouait donc chaque
            // semaine sans que rien ne le signale.
            where: { ...actifs, role: { in: ['HR', 'Administrator'] } },
            select: { email: true }
        });

        if (destinataires.length === 0) {
            return 'Aucun destinataire RH : récapitulatif non envoyé';
        }

        const titre = `Récapitulatif RH — semaine du ${ilYA7Jours.toLocaleDateString('fr-FR')}`;
        for (const d of destinataires) {
            await sendMail({
                to: d.email,
                subject: titre,
                html: gabarit(titre, corps, `${getPublicAppUrl()}/`)
            });
        }

        const enAttente = congesEnAttente + fraisEnAttente + avancesEnAttente;
        return `Envoyé à ${destinataires.length} destinataire(s) — ${enAttente} demande(s) en attente, ` +
               `${cddProches + essaisProches} échéance(s) sous 30 jours`;
    });
}

module.exports = { envoyerRecapHebdomadaire, semainePeriode };
