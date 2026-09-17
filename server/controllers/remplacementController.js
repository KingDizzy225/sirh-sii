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
