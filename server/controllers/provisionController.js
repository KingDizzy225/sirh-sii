const prisma = require('../prismaClient');
const provisionConges = require('../lib/provisionConges');
const journal = require('../lib/journal');

/**
 * Provision pour congés payés.
 *
 * L'état se consulte librement ; l'arrêté, lui, fige un détail daté qui pourra
 * être opposé — il est donc journalisé.
 */

exports.etat = async (req, res) => {
    try {
        const auJour = req.query.auJour ? new Date(req.query.auJour) : new Date();
        const courant = await provisionConges.etat(auJour);
        const arretes = await prisma.arreteProvision.findMany({
            orderBy: { arreteAu: 'desc' },
            take: 24,
            select: {
                id: true, arreteAu: true, totalConges: true, totalCharges: true,
                salaries: true, note: true, creeLe: true, creePar: true
            }
        });
        res.json({ ...courant, arretes });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.arreter = async (req, res) => {
    try {
        const { arreteAu, note } = req.body;
        const arrete = await provisionConges.arreter({
            arreteAu: arreteAu ? new Date(arreteAu) : new Date(),
            note: note || null,
            creePar: req.user?.name || req.user?.email || null
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'PROVISION_ARRETEE',
            tableName: 'ArreteProvision',
            recordId: arrete.id,
            newData: JSON.stringify({
                arreteAu: arrete.arreteAu,
                totalConges: arrete.totalConges,
                totalCharges: arrete.totalCharges,
                salaries: arrete.salaries
            }),
            ipAddress: req.ip
        });

        res.status(201).json({
            message: `Provision arrêtée au ${new Date(arrete.arreteAu).toLocaleDateString('fr-FR')} : `
                + `${Math.round(arrete.totalConges + arrete.totalCharges).toLocaleString('fr-CI')} FCFA.`,
            arrete: {
                id: arrete.id, arreteAu: arrete.arreteAu, totalConges: arrete.totalConges,
                totalCharges: arrete.totalCharges, salaries: arrete.salaries
            }
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

/** Détail figé d'un arrêté : c'est lui qui fait foi, pas le calcul du jour. */
exports.detail = async (req, res) => {
    try {
        const arrete = await prisma.arreteProvision.findUnique({ where: { id: req.params.id } });
        if (!arrete) return res.status(404).json({ error: 'Arrêté introuvable.' });
        res.json({ ...arrete, methode: provisionConges.METHODE });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
