const prisma = require('../prismaClient');
const astreinte = require('../lib/astreinte');

/**
 * Astreintes.
 *
 * Le planning est ouvert aux responsables, qui inscrivent leurs équipes ; la
 * compensation, elle, reste aux ressources humaines, puisqu'elle part en paie.
 */

const moisBornes = (mois) => {
    const base = mois ? new Date(`${mois}-01T00:00:00.000Z`) : new Date();
    const debut = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
    const fin = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0, 23, 59, 59));
    return { debut, fin };
};

exports.planning = async (req, res) => {
    try {
        const { debut, fin } = moisBornes(req.query.mois);
        const vue = await astreinte.planning(debut, fin);
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, firstName: true, lastName: true, positionTitle: true },
            orderBy: { lastName: 'asc' }
        });
        res.json({
            ...vue,
            mois: debut.toISOString().slice(0, 7),
            salaries: salaries.map((s) => ({
                id: s.id, nom: `${s.lastName} ${s.firstName}`.trim(), fonction: s.positionTitle
            })),
            avertissement: vue.forfaits
                ? null
                : "Aucun forfait n'est paramétré (ASTREINTE_FORFAITS) : la compensation doit être saisie "
                  + "période par période. L'application n'invente pas un montant."
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.planifier = async (req, res) => {
    try {
        const { employeeId, debut, fin, type, site, compensation, commentaire } = req.body;
        if (!employeeId || !debut || !fin) {
            return res.status(400).json({ error: 'Salarié, début et fin sont obligatoires.' });
        }
        if (new Date(fin) < new Date(debut)) {
            return res.status(400).json({ error: 'La fin précède le début.' });
        }
        if (!astreinte.TYPES.includes(String(type || '').toUpperCase())) {
            return res.status(400).json({ error: `Type inconnu. Attendu : ${astreinte.TYPES.join(', ')}.` });
        }

        const nature = String(type).toUpperCase();
        // Le forfait paramétré s'applique à défaut de saisie ; il ne l'écrase
        // jamais, car une astreinte peut être compensée autrement.
        const montant = compensation != null && compensation !== ''
            ? Math.max(Number(compensation) || 0, 0)
            : (astreinte.forfaitPour(nature) ?? 0);

        const creee = await prisma.astreinte.create({
            data: {
                employeeId,
                debut: new Date(debut),
                fin: new Date(fin),
                type: nature,
                site: site || null,
                compensation: montant,
                commentaire: commentaire || null,
                creePar: req.user?.name || req.user?.email || null
            }
        });
        res.status(201).json({ message: 'Astreinte planifiée.', astreinte: creee });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

/** Constate une astreinte effectuée, avec le nombre d'interventions. */
exports.constater = async (req, res) => {
    try {
        const { id } = req.params;
        const { interventions, compensation, commentaire } = req.body;
        const existante = await prisma.astreinte.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Astreinte introuvable.' });
        if (existante.statut === 'PAYEE') {
            return res.status(409).json({
                error: 'Cette astreinte a été payée sur un bulletin.',
                remede: 'Elle se corrige en relançant la paie du mois concerné.'
            });
        }
        const maj = await prisma.astreinte.update({
            where: { id },
            data: {
                statut: 'EFFECTUEE',
                interventions: Math.max(parseInt(interventions, 10) || 0, 0),
                ...(compensation != null && compensation !== ''
                    ? { compensation: Math.max(Number(compensation) || 0, 0) } : {}),
                ...(commentaire !== undefined ? { commentaire: commentaire || null } : {})
            }
        });
        res.json({
            message: maj.interventions > 0
                ? `Astreinte constatée. ${maj.interventions} intervention(s) : elles relèvent des heures `
                  + "supplémentaires et doivent être saisies comme telles, en plus de l'indemnité."
                : 'Astreinte constatée.',
            astreinte: maj
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.annuler = async (req, res) => {
    try {
        const { id } = req.params;
        const existante = await prisma.astreinte.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Astreinte introuvable.' });
        if (existante.statut === 'PAYEE') {
            return res.status(409).json({ error: 'Cette astreinte a été payée : elle ne peut plus être annulée.' });
        }
        await prisma.astreinte.update({ where: { id }, data: { statut: 'ANNULEE' } });
        res.json({ message: 'Astreinte annulée.' });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
