const crypto = require('crypto');
const prisma = require('../prismaClient');
const { getPublicAppUrl } = require('./publicUrl');
const presence = require('./presence');

/**
 * Mur d'agence : ce qu'affiche la TV de la boutique ou de la salle du personnel.
 *
 * Tout ce qui s'y montre existe déjà en base — pointages, anniversaires,
 * annonces, remerciements. L'écran ne fabrique rien : un panneau sans donnée
 * ne s'affiche pas, plutôt que de montrer un exemple.
 *
 * Deux usages, deux niveaux de discrétion :
 *
 *  - **en salle du personnel**, l'écran nomme — prénom et initiale seulement,
 *    jamais le nom complet, la fonction ou l'âge ;
 *  - **visible de la clientèle**, il ne nomme personne. Il dit combien de
 *    conseillers sont présents et annonce les événements, rien de plus. Un
 *    client n'a pas à apprendre qui travaille ce jour-là, ni qui fête son
 *    anniversaire.
 */

/** Jeton aléatoire sur 32 octets. */
const nouveauJeton = () => crypto.randomBytes(32).toString('hex');
const lienDe = (token) => `${getPublicAppUrl()}/ecran/${token}`;

const JOURS_ANNONCES = parseInt(process.env.ECRAN_JOURS_ANNONCES, 10) || 30;
const JOURS_KUDOS = parseInt(process.env.ECRAN_JOURS_KUDOS, 10) || 14;
const CATEGORIES_PUBLIQUES = new Set(['Événement']);

const tronquer = (texte, max) => {
    const t = String(texte || '').trim();
    return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
};

/**
 * Anniversaires des sept prochains jours, aujourd'hui compris.
 * Ni l'année ni l'âge : seulement le prénom et le jour.
 */
function anniversairesAVenir(salaries, reference = new Date(), jours = 7) {
    const debut = presence.debutDuJour(reference);
    const resultat = [];
    for (let i = 0; i < jours; i++) {
        const jour = new Date(debut);
        jour.setUTCDate(jour.getUTCDate() + i);
        for (const s of salaries) {
            if (!s.birthDate) continue;
            const n = new Date(s.birthDate);
            if (n.getUTCDate() === jour.getUTCDate() && n.getUTCMonth() === jour.getUTCMonth()) {
                resultat.push({
                    prenom: s.firstName,
                    jour: jour.toISOString().slice(0, 10),
                    aujourdhui: i === 0
                });
            }
        }
    }
    return resultat;
}

/**
 * Prochain jour de paie, si l'entreprise en a déclaré un (`JOUR_PAIE`).
 * Sans cette déclaration, aucun compte à rebours : on n'invente pas une date
 * que les salariés prendraient pour un engagement.
 */
function prochainePaie(reference = new Date(), jourPaie = process.env.JOUR_PAIE) {
    const jour = parseInt(jourPaie, 10);
    if (!Number.isInteger(jour) || jour < 1 || jour > 31) return null;

    const debut = presence.debutDuJour(reference);
    const candidat = (annee, mois) => {
        // Un 31 dans un mois de 30 jours tombe le dernier jour du mois.
        const dernier = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
        return new Date(Date.UTC(annee, mois, Math.min(jour, dernier)));
    };
    let date = candidat(debut.getUTCFullYear(), debut.getUTCMonth());
    if (date < debut) date = candidat(debut.getUTCFullYear(), debut.getUTCMonth() + 1);
    return { date: date.toISOString().slice(0, 10), dansJours: Math.round((date - debut) / 86400000) };
}

/**
 * Compose le contenu de l'écran. Fonction pure, pour être éprouvée sans base.
 */
function composer({ ecran, etats, perimetre, salaries, annonces, kudos, reference = new Date() }) {
    const discret = ecran.visibleClientele;
    const dansPerimetre = (id) => !perimetre || perimetre.has(id);

    const presents = [...etats.entries()]
        .filter(([id, e]) => e.present && e.salarie?.status !== 'TERMINATED')
        .filter(([id, e]) => (ecran.workSiteId ? e.workSiteId === ecran.workSiteId : true))
        .sort((a, b) => new Date(a[1].arrivee) - new Date(b[1].arrivee));

    return {
        organisation: process.env.ORGANISATION_NAME || 'SIRH-SII',
        nom: ecran.nom,
        site: ecran.workSite?.name || null,
        visibleClientele: discret,
        genereLe: reference.toISOString(),
        presence: {
            nombre: presents.length,
            noms: discret ? null : presents.map(([, e]) => presence.prenomInitiale(e.salarie))
        },
        anniversaires: discret
            ? []
            : anniversairesAVenir(salaries.filter((s) => dansPerimetre(s.id)), reference),
        annonces: annonces
            .filter((a) => !discret || CATEGORIES_PUBLIQUES.has(a.category))
            .slice(0, 5)
            .map((a) => ({
                titre: tronquer(a.title, 90),
                corps: tronquer(a.body, 280),
                categorie: a.category,
                epinglee: a.pinned,
                date: a.createdAt
            })),
        kudos: discret
            ? []
            : kudos
                .filter((k) => dansPerimetre(k.receiverId) || dansPerimetre(k.senderId))
                .slice(0, 6)
                .map((k) => ({
                    de: presence.prenomInitiale(k.sender),
                    pour: presence.prenomInitiale(k.receiver),
                    message: tronquer(k.message, 200),
                    categorie: k.category
                })),
        prochainePaie: discret ? null : prochainePaie(reference)
    };
}

/** Lit la base et compose l'écran. */
async function contenu(ecran, reference = new Date()) {
    const depuisAnnonces = new Date(reference);
    depuisAnnonces.setUTCDate(depuisAnnonces.getUTCDate() - JOURS_ANNONCES);
    const depuisKudos = new Date(reference);
    depuisKudos.setUTCDate(depuisKudos.getUTCDate() - JOURS_KUDOS);

    const [pointages, perimetreIds, salaries, annonces, kudos] = await Promise.all([
        presence.pointagesDuJour(reference),
        ecran.workSiteId ? presence.salariesDuSite(ecran.workSiteId, reference) : null,
        prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' }, birthDate: { not: null } },
            select: { id: true, firstName: true, birthDate: true }
        }),
        prisma.announcement.findMany({
            where: { createdAt: { gte: depuisAnnonces } },
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
            take: 20
        }),
        prisma.kudo.findMany({
            where: { createdAt: { gte: depuisKudos } },
            orderBy: { createdAt: 'desc' },
            take: 30,
            include: {
                sender: { select: { firstName: true, lastName: true } },
                receiver: { select: { firstName: true, lastName: true } }
            }
        })
    ]);

    return composer({
        ecran,
        etats: presence.etatPresences(pointages),
        perimetre: perimetreIds ? new Set(perimetreIds) : null,
        salaries,
        annonces,
        kudos,
        reference
    });
}

module.exports = {
    nouveauJeton, lienDe, anniversairesAVenir, prochainePaie, composer, contenu, CATEGORIES_PUBLIQUES
};
