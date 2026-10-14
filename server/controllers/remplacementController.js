const prisma = require('../prismaClient');
const remplacement = require('../lib/remplacement');
const { notifierSalarie } = require('../lib/notify');
const { _interne: { libelleCreneau } } = require('./espaceSalarieController');

/**
 * Validation des remplacements par la RH ou un responsable.
 */

exports.lister = async (req, res) => {
    try {
        const depuis = new Date();
        depuis.setUTCDate(depuis.getUTCDate() - 14);
        const demandes = await prisma.demandeRemplacement.findMany({
            where: { creeLe: { gte: depuis } },
            orderBy: { creeLe: 'desc' },
            include: {
                shift: true,
                demandeur: { select: { firstName: true, lastName: true, department: true } },
                remplacant: { select: { firstName: true, lastName: true } }
            }
        });
        const maintenant = new Date();
        res.json(demandes.map((d) => ({
            id: d.id,
            etat: remplacement.etat(d, maintenant),
            creneau: { date: d.shift.date, debut: d.shift.startTime, fin: d.shift.endTime, libelle: libelleCreneau(d.shift) },
            service: d.demandeur.department,
            demandeur: `${d.demandeur.firstName} ${d.demandeur.lastName}`,
            remplacant: d.remplacant ? `${d.remplacant.firstName} ${d.remplacant.lastName}` : null,
            motif: d.motif,
            creeLe: d.creeLe,
            accepteeLe: d.accepteeLe,
            decideeLe: d.decideeLe,
            decideePar: d.decideePar,
            motifRefus: d.motifRefus
        })));
    } catch (erreur) {
        console.error('[REMPLACEMENT] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des remplacements impossible.' });
    }
};

/**
 * Valide : le créneau change de titulaire, dans la même transaction que la
 * décision, après avoir revérifié que rien n'a bougé depuis l'acceptation.
 */
exports.valider = async (req, res) => {
    try {
        const demande = await prisma.demandeRemplacement.findUnique({ where: { id: req.params.id }, include: { shift: true } });
        if (!demande) return res.status(404).json({ error: 'Demande introuvable.' });
        if (remplacement.etat(demande) === 'ECHUE') return res.status(409).json({ error: 'Le créneau a déjà commencé.' });
        if (demande.statut !== 'ACCEPTEE' || !demande.remplacantId) {
            return res.status(409).json({ error: "Aucun collègue n'a encore repris ce créneau." });
        }
        if (demande.shift.employeeId !== demande.demandeurId) {
            return res.status(409).json({ error: 'Le créneau a changé de titulaire entre-temps.' });
        }
        const conflit = await prisma.shiftSchedule.count({
            where: { employeeId: demande.remplacantId, date: demande.shift.date, id: { not: demande.shiftId } }
        });
        if (conflit > 0) return res.status(409).json({ error: 'Le remplaçant a désormais un autre créneau ce jour-là.' });

        const auteur = req.user?.name || req.user?.email || null;
        await prisma.$transaction([
            prisma.shiftSchedule.update({ where: { id: demande.shiftId }, data: { employeeId: demande.remplacantId } }),
            prisma.demandeRemplacement.update({
                where: { id: demande.id },
                data: { statut: 'VALIDEE', decideeLe: new Date(), decideePar: auteur }
            })
        ]);

        const libelle = libelleCreneau(demande.shift);
        await Promise.all([
            notifierSalarie({ employeeId: demande.demandeurId, titre: 'Remplacement validé', message: `Vous êtes remplacé(e) le ${libelle}.` }),
            notifierSalarie({ employeeId: demande.remplacantId, titre: 'Remplacement validé', message: `Le créneau du ${libelle} est désormais le vôtre.` })
        ]).catch((e) => console.error('[REMPLACEMENT] Notification :', e.message));

        res.json({ message: 'Remplacement validé : le planning est à jour.' });
    } catch (erreur) {
        console.error('[REMPLACEMENT] Validation impossible :', erreur.message);
        res.status(500).json({ error: 'Validation impossible.' });
    }
};

exports.refuser = async (req, res) => {
    try {
        const motif = String(req.body?.motif || '').trim();
        if (motif.length < 5) return res.status(400).json({ error: 'Indiquer le motif du refus.' });
        const demande = await prisma.demandeRemplacement.findUnique({ where: { id: req.params.id }, include: { shift: true } });
        if (!demande) return res.status(404).json({ error: 'Demande introuvable.' });
        if (!remplacement.STATUTS_EN_COURS.includes(demande.statut)) return res.status(409).json({ error: 'Cette demande est déjà close.' });

        await prisma.demandeRemplacement.update({
            where: { id: demande.id },
            data: { statut: 'REFUSEE', motifRefus: motif, decideeLe: new Date(), decideePar: req.user?.name || req.user?.email || null }
        });
        const libelle = libelleCreneau(demande.shift);
        const destinataires = [demande.demandeurId, demande.remplacantId].filter(Boolean);
        await Promise.all(destinataires.map((employeeId) => notifierSalarie({
            employeeId, titre: 'Remplacement refusé', message: `Le remplacement du ${libelle} est refusé : ${motif}`
        }))).catch((e) => console.error('[REMPLACEMENT] Notification :', e.message));

        res.json({ message: 'Remplacement refusé : le créneau reste à son titulaire.' });
    } catch (erreur) {
        console.error('[REMPLACEMENT] Refus impossible :', erreur.message);
        res.status(500).json({ error: 'Refus impossible.' });
    }
};

// Stockage mémoire des alertes SOS renfort en direct
const sosActifs = new Map();

function distanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Rayon terre km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

exports.lancerSosRenfort = async (req, res) => {
    try {
        const { workSiteId, date, debut = '08:00', fin = '17:00', motif, prime = 10000 } = req.body || {};
        if (!workSiteId) return res.status(400).json({ error: 'Sélectionner le site demandeur.' });
        const site = await prisma.workSite.findUnique({ where: { id: workSiteId } });
        if (!site) return res.status(404).json({ error: 'Site introuvable.' });

        const tousSites = await prisma.workSite.findMany();
        const siteParId = new Map(tousSites.map(s => [s.id, s]));

        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, firstName: true, lastName: true, phone: true, department: true, workSiteId: true }
        });

        const cibles = salaries.map(s => {
            const sSite = siteParId.get(s.workSiteId);
            const dist = (site.latitude && site.longitude && sSite?.latitude && sSite?.longitude)
                ? distanceKm(site.latitude, site.longitude, sSite.latitude, sSite.longitude)
                : null;
            return { ...s, distanceKm: dist };
        }).filter(s => s.distanceKm === null || s.distanceKm <= 30);

        const id = 'SOS-' + Date.now().toString(36).toUpperCase();
        const nouveauSos = {
            id,
            siteId: site.id,
            siteNom: site.name,
            date: date || new Date().toISOString().slice(0, 10),
            debut,
            fin,
            motif: motif || 'Besoin urgent de renfort en agence',
            prime: Number(prime) || 10000,
            lancePar: req.user?.name || req.user?.email || 'RH',
            creeLe: new Date().toISOString(),
            statut: 'OUVERT',
            salariesNotifies: cibles.length,
            candidatId: null,
            candidatNom: null
        };
        sosActifs.set(id, nouveauSos);

        for (const salarie of cibles.slice(0, 15)) {
            notifierSalarie({
                employeeId: salarie.id,
                titre: `🆘 SOS Renfort : Agence ${site.name}`,
                message: `Besoin urgent le ${nouveauSos.date} (${debut}-${fin}). Prime : ${nouveauSos.prime.toLocaleString('fr-FR')} FCFA.`
            }).catch(() => null);
        }

        res.status(201).json(nouveauSos);
    } catch (e) {
        console.error('[SOS-RENFORT] Erreur :', e.message);
        res.status(500).json({ error: 'Impossible de lancer le SOS renfort.' });
    }
};

exports.listerSosRenfort = async (req, res) => {
    res.json([...sosActifs.values()].reverse());
};
