const prisma = require('../prismaClient');
const indemnite = require('../lib/indemniteJournaliere');
const journal = require('../lib/journal');

/**
 * Créances d'indemnités journalières sur la CNPS.
 *
 * Réclamer et encaisser touchent à de l'argent qui entre : les deux sont
 * journalisés, avec leur auteur et leur montant.
 */

exports.lister = async (req, res) => {
    try {
        const [registre, aOuvrir] = await Promise.all([
            indemnite.registre(),
            indemnite.candidats()
        ]);
        res.json({
            ...registre,
            candidats: aOuvrir,
            avertissement: registre.estimationsSansTaux
                ? "Aucun taux d'indemnisation n'est déclaré (CNPS_TAUX_IJ) : les créances s'ouvrent "
                  + "sans estimation, et le montant réclamé est celui que vous inscrivez. Le taux, les "
                  + "plafonds et la durée indemnisable relèvent du régime CNPS — l'application ne les invente pas."
                : null
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.ouvrir = async (req, res) => {
    try {
        const { type, origineId, employeeId, debut, fin, jours, montantReclame } = req.body;
        if (!type || !origineId || !employeeId || !debut || !fin) {
            return res.status(400).json({ error: "Type, arrêt d'origine, salarié et dates sont obligatoires." });
        }
        const creance = await indemnite.ouvrir({
            type, origineId, employeeId, debut, fin,
            joursArret: jours,
            montantReclame,
            creePar: req.user?.name || req.user?.email || null
        });
        res.status(201).json({
            message: creance.montantEstime != null
                ? `Créance ouverte, estimée à ${Math.round(creance.montantEstime)} FCFA.`
                : 'Créance ouverte. Le montant reste à chiffrer.',
            creance
        });
    } catch (erreur) {
        res.status(erreur.statut || 500).json({ error: erreur.message });
    }
};

exports.reclamer = async (req, res) => {
    try {
        const { id } = req.params;
        const { montantReclame, reference } = req.body;
        const existante = await prisma.indemniteJournaliere.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Créance introuvable.' });
        if (existante.statut === 'REMBOURSEE') {
            return res.status(409).json({ error: 'Cette créance a déjà été remboursée.' });
        }
        const montant = Number(montantReclame);
        if (!Number.isFinite(montant) || montant <= 0) {
            return res.status(400).json({ error: 'Le montant réclamé est obligatoire.' });
        }

        const maj = await prisma.indemniteJournaliere.update({
            where: { id },
            data: { statut: 'RECLAMEE', montantReclame: montant, reference: reference || null, reclameeLe: new Date() }
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'IJ_RECLAMEE',
            tableName: 'IndemniteJournaliere',
            recordId: id,
            newData: JSON.stringify({ montant, reference: reference || null }),
            ipAddress: req.ip
        });

        res.json({ message: 'Demande enregistrée comme déposée.', creance: maj });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.encaisser = async (req, res) => {
    try {
        const { id } = req.params;
        const { montantRembourse, note } = req.body;
        const existante = await prisma.indemniteJournaliere.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Créance introuvable.' });
        const montant = Number(montantRembourse);
        if (!Number.isFinite(montant) || montant < 0) {
            return res.status(400).json({ error: 'Le montant remboursé est obligatoire.' });
        }

        const maj = await prisma.indemniteJournaliere.update({
            where: { id },
            data: { statut: 'REMBOURSEE', montantRembourse: montant, note: note || existante.note, rembourseeLe: new Date() }
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'IJ_ENCAISSEE',
            tableName: 'IndemniteJournaliere',
            recordId: id,
            newData: JSON.stringify({ montant, reclame: existante.montantReclame }),
            ipAddress: req.ip
        });

        // Un remboursement inférieur à ce qui a été réclamé n'est pas une
        // anomalie technique, mais il ne doit pas passer inaperçu.
        const ecart = (existante.montantReclame || 0) - montant;
        res.json({
            message: ecart > 0
                ? `Remboursement enregistré. Il manque ${Math.round(ecart)} FCFA par rapport à la demande.`
                : 'Remboursement enregistré.',
            creance: maj
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
