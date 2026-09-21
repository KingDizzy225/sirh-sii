const prisma = require('../prismaClient');
const rappel = require('../lib/rappel');
const journal = require('../lib/journal');

/**
 * Rappels de salaire.
 *
 * Établir un rappel est une décision qui engage : elle reconnaît qu'un salaire
 * a été sous-payé. Elle est donc journalisée, avec la période couverte et le
 * montant, au même titre qu'un ordre de virement.
 */

const vue = (r) => ({
    id: r.id,
    employeeId: r.employeeId,
    nom: r.employee ? `${r.employee.lastName} ${r.employee.firstName}`.trim() : null,
    motif: r.motif,
    dateEffet: r.dateEffet,
    periodeDebut: r.periodeDebut,
    periodeFin: r.periodeFin,
    lignes: r.lignes,
    total: r.total,
    statut: r.statut,
    verseLe: r.verseLe,
    payrollId: r.payrollId,
    creeLe: r.creeLe,
    creePar: r.creePar
});

exports.lister = async (req, res) => {
    try {
        const rappels = await prisma.rappelSalaire.findMany({
            orderBy: { creeLe: 'desc' },
            take: 200,
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        const lignes = rappels.map(vue);
        res.json({
            lignes,
            aVerser: lignes.filter((l) => l.statut === 'A_VERSER').length,
            montantAVerser: lignes
                .filter((l) => l.statut === 'A_VERSER')
                .reduce((s, l) => s + l.total, 0)
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

/** Simulation : ce que vaudrait le rappel, sans rien enregistrer. */
exports.simuler = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { dateEffet, jusqua } = req.query;
        if (!dateEffet) return res.status(400).json({ error: "La date d'effet est obligatoire." });
        const detail = await rappel.calculer({
            employeeId,
            dateEffet,
            jusqua: jusqua || new Date()
        });
        res.json(detail);
    } catch (erreur) {
        res.status(erreur.statut || 500).json({ error: erreur.message });
    }
};

exports.enregistrer = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { motif, dateEffet, jusqua } = req.body;
        if (!dateEffet) return res.status(400).json({ error: "La date d'effet est obligatoire." });

        const cree = await rappel.enregistrer({
            employeeId,
            motif,
            dateEffet,
            jusqua: jusqua || new Date(),
            creePar: req.user?.name || req.user?.email || null
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'RAPPEL_ETABLI',
            tableName: 'RappelSalaire',
            recordId: cree.id,
            newData: JSON.stringify({ employeeId, total: cree.total, motif: cree.motif }),
            ipAddress: req.ip
        });

        res.status(201).json({
            message: `Rappel de ${Math.round(cree.total)} FCFA établi. Il sera porté sur la prochaine paie.`,
            rappel: vue(cree)
        });
    } catch (erreur) {
        res.status(erreur.statut || 500).json({ error: erreur.message, manques: erreur.manques });
    }
};

exports.annuler = async (req, res) => {
    try {
        const { id } = req.params;
        const existant = await prisma.rappelSalaire.findUnique({ where: { id } });
        if (!existant) return res.status(404).json({ error: 'Rappel introuvable.' });
        if (existant.statut === 'VERSE') {
            return res.status(409).json({
                error: 'Ce rappel a été versé sur un bulletin.',
                remede: "Un rappel versé ne s'annule pas : il se corrige en relançant la paie du mois concerné."
            });
        }
        const annule = await prisma.rappelSalaire.update({ where: { id }, data: { statut: 'ANNULE' } });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'RAPPEL_ANNULE',
            tableName: 'RappelSalaire',
            recordId: id,
            newData: JSON.stringify({ total: existant.total }),
            ipAddress: req.ip
        });

        res.json({ message: 'Rappel annulé.', rappel: vue(annule) });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
