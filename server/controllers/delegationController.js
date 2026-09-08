const prisma = require('../prismaClient');
const delegation = require('../lib/delegation');
const { notifierSalarie } = require('../lib/notify');

/**
 * Délégations de validation.
 *
 * Quand le responsable qui valide est absent, les demandes s'arrêtaient. Une
 * délégation prête ses droits à un suppléant, pour une portée et une période
 * données — jamais davantage, jamais au-delà.
 */

const presenter = (d) => ({
    id: d.id,
    titulaire: d.titulaire
        ? { id: d.titulaire.id, nom: `${d.titulaire.lastName} ${d.titulaire.firstName}`.trim(), poste: d.titulaire.positionTitle }
        : null,
    suppleant: d.suppleant
        ? { id: d.suppleant.id, nom: `${d.suppleant.lastName} ${d.suppleant.firstName}`.trim(), poste: d.suppleant.positionTitle }
        : null,
    portee: d.portee,
    debut: d.debut,
    fin: d.fin,
    motif: d.motif,
    creePar: d.creePar,
    revoqueeLe: d.revoqueeLe,
    enCours: !d.revoqueeLe && new Date(d.debut) <= new Date() && new Date(d.fin) >= new Date()
});

const inclusion = {
    titulaire: { select: { id: true, firstName: true, lastName: true, positionTitle: true, role: true } },
    suppleant: { select: { id: true, firstName: true, lastName: true, positionTitle: true } }
};

exports.lister = async (req, res) => {
    try {
        const where = {};
        if (req.query.titulaireId) where.titulaireId = String(req.query.titulaireId);
        if (req.query.suppleantId) where.suppleantId = String(req.query.suppleantId);
        if (req.query.enCours === 'true') {
            const maintenant = new Date();
            where.revoqueeLe = null;
            where.debut = { lte: maintenant };
            where.fin = { gte: maintenant };
        }

        const liste = await prisma.delegationValidation.findMany({
            where, include: inclusion, orderBy: { debut: 'desc' }
        });
        res.json(liste.map(presenter));
    } catch (error) {
        console.error('Erreur lecture des délégations :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des délégations.' });
    }
};

/** Ce que l'utilisateur connecté peut valider au nom d'autrui, et pour qui. */
exports.mesDelegations = async (req, res) => {
    try {
        const moi = await prisma.employee.findUnique({
            where: { email: req.user.email }, select: { id: true }
        });
        if (!moi) return res.json({ recues: [], donnees: [] });

        const [recues, donnees] = await Promise.all([
            delegation.delegationsRecues(moi.id),
            delegation.delegationsDonnees(moi.id)
        ]);
        res.json({ recues: recues.map(presenter), donnees: donnees.map(presenter) });
    } catch (error) {
        console.error('Erreur lecture de mes délégations :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

exports.creer = async (req, res) => {
    try {
        const { titulaireId, suppleantId, portee, debut, fin, motif } = req.body;

        const invalide = delegation.valider({ titulaireId, suppleantId, portee, debut, fin });
        if (invalide) return res.status(400).json({ error: invalide });

        const [titulaire, suppleant] = await Promise.all([
            prisma.employee.findUnique({ where: { id: titulaireId } }),
            prisma.employee.findUnique({ where: { id: suppleantId } })
        ]);
        if (!titulaire) return res.status(404).json({ error: 'Titulaire introuvable.' });
        if (!suppleant) return res.status(404).json({ error: 'Suppléant introuvable.' });
        if (suppleant.status === 'TERMINATED') {
            return res.status(409).json({ error: 'Le suppléant ne fait plus partie de l\'effectif.' });
        }

        const creee = await prisma.delegationValidation.create({
            data: {
                titulaireId, suppleantId,
                portee: portee || 'TOUT',
                debut: new Date(debut),
                fin: new Date(fin),
                motif: motif || null,
                creePar: (req.user && (req.user.email || req.user.name)) || null
            },
            include: inclusion
        });

        // Le suppléant doit savoir qu'il reçoit cette charge : une délégation
        // ignorée ne vaut pas mieux qu'une absence de délégation.
        await notifierSalarie({
            employeeId: suppleantId,
            titre: 'Délégation de validation',
            message: `${titulaire.firstName} ${titulaire.lastName} vous délègue ses validations ` +
                     `(${creee.portee.toLowerCase()}) du ${new Date(creee.debut).toLocaleDateString('fr-FR')} ` +
                     `au ${new Date(creee.fin).toLocaleDateString('fr-FR')}.`,
            type: 'Info',
            link: '/timesheet'
        }).catch((e) => console.error('Notification de délégation :', e.message));

        res.status(201).json(presenter(creee));
    } catch (error) {
        console.error('Erreur création de délégation :', error);
        res.status(500).json({ error: "Erreur lors de la création de la délégation." });
    }
};

/**
 * Révoque une délégation.
 *
 * Elle n'est pas supprimée : ce qui a été validé pendant qu'elle courait l'a été
 * sous son autorité, et l'effacer rendrait ces validations inexplicables.
 */
exports.revoquer = async (req, res) => {
    try {
        const d = await prisma.delegationValidation.findUnique({
            where: { id: req.params.id }, include: inclusion
        });
        if (!d) return res.status(404).json({ error: 'Délégation introuvable.' });
        if (d.revoqueeLe) return res.status(409).json({ error: 'Cette délégation est déjà révoquée.' });

        const maj = await prisma.delegationValidation.update({
            where: { id: d.id },
            data: { revoqueeLe: new Date() },
            include: inclusion
        });
        res.json(presenter(maj));
    } catch (error) {
        console.error('Erreur révocation de délégation :', error);
        res.status(500).json({ error: 'Erreur lors de la révocation.' });
    }
};
