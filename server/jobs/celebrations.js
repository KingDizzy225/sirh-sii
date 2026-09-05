const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');
const { notifierSalarie } = require('../lib/notify');

/**
 * Célébrations du jour : anniversaires et jubilés d'ancienneté.
 *
 * Le schéma prévoyait déjà tout — une catégorie d'annonce « Félicitations » et
 * une raison de points « Ancienneté » — sans que rien ne les produise jamais.
 * Ce traitement quotidien s'en charge.
 *
 * Choix assumé : l'annonce d'anniversaire ne mentionne ni l'année de naissance
 * ni l'âge. On célèbre la personne sans divulguer une donnée qu'elle n'a pas
 * choisi de rendre publique.
 */

// Jalons d'ancienneté fêtés, et points attribués
const JUBILES = { 1: 50, 3: 100, 5: 250, 10: 500, 15: 750, 20: 1000, 25: 1500 };

const memeJourEtMois = (date, reference) =>
    date.getDate() === reference.getDate() && date.getMonth() === reference.getMonth();

async function creerAnnonce(titre, corps) {
    await prisma.announcement.create({
        data: { title: titre, body: corps, category: 'Félicitations', author: 'Équipe RH' }
    });
}

async function attribuerPoints(employeeId, points, raison) {
    await prisma.pointEvent.create({ data: { employeeId, points, reason: raison } });
    await prisma.employeePoints.upsert({
        where: { employeeId },
        create: { employeeId, total: points },
        update: { total: { increment: points } }
    });
}

async function celebrerLeJour(referenceDate = new Date()) {
    return runOnce('CELEBRATIONS', dayPeriod(referenceDate), async () => {
        const salaries = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, birthDate: true, hireDate: true, positionTitle: true }
        });

        let anniversaires = 0;
        let jubiles = 0;

        for (const s of salaries) {
            const nom = `${s.firstName} ${s.lastName}`;

            // Anniversaire — sans l'année, donc sans l'âge
            if (s.birthDate && memeJourEtMois(new Date(s.birthDate), referenceDate)) {
                await creerAnnonce(
                    `Joyeux anniversaire ${s.firstName} !`,
                    `Toute l'équipe souhaite un très bel anniversaire à ${nom}` +
                    (s.positionTitle ? `, ${s.positionTitle}` : '') + '. 🎉'
                );
                await notifierSalarie({
                    employeeId: s.id,
                    titre: 'Joyeux anniversaire !',
                    message: `Toute l'équipe vous souhaite un joyeux anniversaire, ${s.firstName} ! 🎂`,
                    type: 'Succès',
                    link: '/kudos'
                });
                anniversaires++;
            }

            // Jubilé d'ancienneté
            if (s.hireDate) {
                const embauche = new Date(s.hireDate);
                if (memeJourEtMois(embauche, referenceDate)) {
                    const annees = referenceDate.getFullYear() - embauche.getFullYear();
                    const points = JUBILES[annees];
                    if (points) {
                        await creerAnnonce(
                            `${annees} ${annees > 1 ? 'ans' : 'an'} pour ${s.firstName} !`,
                            `${nom} fête aujourd'hui ${annees} ${annees > 1 ? 'années' : 'année'} au sein de ` +
                            `l'entreprise. Merci pour ces années d'engagement. 🙌`
                        );
                        await attribuerPoints(s.id, points, 'Ancienneté');
                        await notifierSalarie({
                            employeeId: s.id,
                            titre: `Félicitations pour vos ${annees} ${annees > 1 ? 'ans' : 'an'} !`,
                            message: `Félicitations pour vos ${annees} ${annees > 1 ? 'ans' : 'an'} dans l'entreprise ! ` +
                                     `+${points} points vous sont attribués. 🎉`,
                            type: 'Succès',
                            link: '/kudos'
                        });
                        jubiles++;
                    }
                }
            }
        }

        return `${anniversaires} anniversaire(s), ${jubiles} jubilé(s) d'ancienneté`;
    });
}

module.exports = { celebrerLeJour, JUBILES };
