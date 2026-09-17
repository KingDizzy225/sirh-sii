const QRCode = require('qrcode');
const prisma = require('../prismaClient');
const emargement = require('../lib/emargement');
const pointage = require('../lib/pointageEcran');
const identite = require('../lib/identite');
const { _interne: { porteur } } = require('./espaceSalarieController');

/**
 * Émargement des formations : ouverture par la RH, QR projeté en salle, scan
 * par les participants avec leur badge, feuille et export.
 */

const CHAMPS_SALARIE = { id: true, firstName: true, lastName: true, matricule: true, cnpsNumber: true, department: true };

exports.lister = async (req, res) => {
    try {
        const depuis = new Date();
        depuis.setUTCDate(depuis.getUTCDate() - 60);
        const jusque = new Date();
        jusque.setUTCDate(jusque.getUTCDate() + 60);
        const sessions = await prisma.trainingSession.findMany({
            where: { date: { gte: depuis, lte: jusque } },
            orderBy: { date: 'desc' },
            include: {
                _count: { select: { participations: true } },
                emargement: { include: { _count: { select: { emargements: true } } } }
            }
        });
        res.json(sessions.map((s) => ({
            id: s.id,
            titre: s.title,
            formateur: s.trainerName,
            date: s.date,
            dureeHeures: s.durationHours,
            inscrits: s._count.participations,
            emargement: s.emargement ? {
                ouverte: !s.emargement.fermeeLe,
                ouverteLe: s.emargement.ouverteLe,
                fermeeLe: s.emargement.fermeeLe,
                lienEcran: emargement.lienEcran(s.emargement.token),
                presents: s.emargement._count.emargements
            } : null
        })));
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des sessions impossible.' });
    }
};

/** Ouvre (ou rouvre) l'émargement : nouveau secret à chaque ouverture. */
exports.ouvrir = async (req, res) => {
    try {
        const session = await prisma.trainingSession.findUnique({ where: { id: req.params.sessionId } });
        if (!session) return res.status(404).json({ error: 'Session introuvable.' });
        const ligne = await prisma.sessionEmargement.upsert({
            where: { sessionId: session.id },
            create: { sessionId: session.id, token: emargement.nouveauJeton(), secret: pointage.nouveauSecret(), ouvertePar: req.user?.name || req.user?.email || null },
            update: { secret: pointage.nouveauSecret(), fermeeLe: null }
        });
        res.json({ lienEcran: emargement.lienEcran(ligne.token), message: "Émargement ouvert : projetez l'écran dans la salle." });
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Ouverture impossible :', erreur.message);
        res.status(500).json({ error: 'Ouverture impossible.' });
    }
};

exports.fermer = async (req, res) => {
    try {
        const { count } = await prisma.sessionEmargement.updateMany({
            where: { sessionId: req.params.sessionId, fermeeLe: null },
            data: { fermeeLe: new Date(), secret: null }
        });
        if (count === 0) return res.status(409).json({ error: 'Émargement non ouvert.' });
        res.json({ message: 'Émargement fermé : le QR ne vaut plus rien.' });
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Fermeture impossible :', erreur.message);
        res.status(500).json({ error: 'Fermeture impossible.' });
    }
};

async function contenuFeuille(sessionId) {
    const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
            participations: { include: { employee: { select: CHAMPS_SALARIE } } },
            emargement: { include: { emargements: { include: { employee: { select: CHAMPS_SALARIE } } } } }
        }
    });
    if (!session) return null;
    return {
        session,
        contenu: emargement.feuille({
            session,
            participations: session.participations,
            emargements: session.emargement?.emargements || []
        })
    };
}

exports.feuille = async (req, res) => {
    try {
        const resultat = await contenuFeuille(req.params.sessionId);
        if (!resultat) return res.status(404).json({ error: 'Session introuvable.' });
        const { session, contenu } = resultat;
        res.json({
            session: { id: session.id, titre: session.title, formateur: session.trainerName, date: session.date, dureeHeures: session.durationHours },
            ...contenu,
            avertissement: emargement.AVERTISSEMENT_FORMAT
        });
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Feuille indisponible :', erreur.message);
        res.status(500).json({ error: 'Feuille indisponible.' });
    }
};

exports.csv = async (req, res) => {
    try {
        const resultat = await contenuFeuille(req.params.sessionId);
        if (!resultat) return res.status(404).json({ error: 'Session introuvable.' });
        const { session, contenu } = resultat;
        const nomFichier = `emargement-${new Date(session.date).toISOString().slice(0, 10)}.csv`;
        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.set('Content-Disposition', `attachment; filename="${nomFichier}"`);
        res.send(emargement.versCsv({ session, organisation: identite.nom() }, contenu));
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Export impossible :', erreur.message);
        res.status(500).json({ error: 'Export impossible.' });
    }
};

/** QR du moment, pour l'écran projeté en salle. */
exports.code = async (req, res) => {
    try {
        const token = String(req.params.token || '');
        if (!/^[a-f0-9]{64}$/.test(token)) return res.status(404).json({ error: 'Émargement inconnu.' });
        const ligne = await prisma.sessionEmargement.findUnique({
            where: { token },
            include: { session: { select: { title: true, date: true, trainerName: true } }, _count: { select: { emargements: true } } }
        });
        if (!ligne) return res.status(404).json({ error: 'Émargement inconnu.' });
        const base = { titre: ligne.session.title, formateur: ligne.session.trainerName, date: ligne.session.date, presents: ligne._count.emargements, organisation: identite.nom() };
        if (ligne.fermeeLe || !ligne.secret) return res.json({ ...base, ouverte: false });
        const maintenant = new Date();
        const qr = await QRCode.toDataURL(
            emargement.lienScan(ligne.id, pointage.code(ligne.secret, pointage.fenetre(maintenant))),
            { margin: 1, width: 480, errorCorrectionLevel: 'M' }
        );
        res.set('Cache-Control', 'no-store');
        res.json({ ...base, ouverte: true, qr, expireDans: pointage.secondesRestantes(maintenant) });
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Code indisponible :', erreur.message);
        res.status(500).json({ error: 'Code indisponible.' });
    }
};

/** Scan d'un participant, reconnu par son badge. */
exports.emarger = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return res.status(403).json({ error: "Votre badge n'est pas valide sur ce téléphone. Rouvrez le lien de votre badge." });

        const id = String(req.body?.session || '');
        const ligne = /^[0-9a-f-]{36}$/.test(id)
            ? await prisma.sessionEmargement.findUnique({ where: { id }, include: { session: { select: { id: true, title: true } } } })
            : null;
        if (!ligne || ligne.fermeeLe || !ligne.secret) return res.status(404).json({ error: "L'émargement de cette formation est fermé." });

        const maintenant = new Date();
        if (pointage.verifier(ligne.secret, req.body?.code, maintenant) === null) {
            return res.status(410).json({ error: 'Code expiré. Scannez à nouveau le QR projeté.' });
        }

        const existant = await prisma.emargement.findUnique({
            where: { sessionEmargementId_employeeId: { sessionEmargementId: ligne.id, employeeId: salarie.id } }
        });
        const { action } = emargement.actionScan(existant, maintenant);
        const titre = ligne.session.title;

        if (action === 'DOUBLON') {
            return res.json({ action, formation: titre, message: 'Arrivée déjà enregistrée. Scannez à nouveau en partant.' });
        }
        if (action === 'ARRIVEE') {
            const inscrit = await prisma.trainingParticipation.count({ where: { sessionId: ligne.session.id, employeeId: salarie.id } }) > 0;
            try {
                await prisma.emargement.create({ data: { sessionEmargementId: ligne.id, employeeId: salarie.id, arriveeLe: maintenant, inscrit } });
            } catch (erreur) {
                if (erreur.code === 'P2002') return res.json({ action: 'DOUBLON', formation: titre, message: 'Arrivée déjà enregistrée.' });
                throw erreur;
            }
            return res.status(201).json({
                action, formation: titre, heure: maintenant, inscrit,
                message: inscrit ? `Bienvenue, ${salarie.firstName} ! Pensez à scanner en partant.` : "Présence enregistrée. Vous n'étiez pas inscrit : la RH en est informée par la feuille."
            });
        }
        // Départ : le dernier scan fait foi.
        await prisma.emargement.update({ where: { id: existant.id }, data: { departLe: maintenant } });
        return res.json({ action, formation: titre, heure: maintenant, message: `Départ enregistré. Merci, ${salarie.firstName} !` });
    } catch (erreur) {
        console.error('[ÉMARGEMENT] Scan impossible :', erreur.message);
        res.status(500).json({ error: 'Émargement impossible. Réessayez.' });
    }
};
