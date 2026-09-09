const prisma = require('../prismaClient');
const feries = require('../lib/joursFeries');

/**
 * Jours fériés.
 *
 * Deux natures cohabitent, et l'écran doit les distinguer : ce que
 * l'application calcule seule — fêtes fixes et fêtes chrétiennes mobiles — et
 * ce qu'elle ne peut pas calculer. Les fêtes musulmanes suivent le calendrier
 * lunaire et sont arrêtées par décret : les deviner fausserait chaque congé qui
 * les traverse.
 */

/** Minuit local, pour que la comparaison porte sur le jour et non sur l'heure. */
const minuit = (v) => {
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/** GET /api/jours-feries?annee=2026 */
exports.lister = async (req, res) => {
    try {
        const annee = parseInt(req.query.annee, 10) || new Date().getFullYear();
        if (annee < 2000 || annee > 2100) {
            return res.status(400).json({ error: 'Année hors des bornes admises.' });
        }

        const enregistres = await prisma.jourFerie.findMany({
            where: {
                date: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) }
            },
            orderBy: { date: 'asc' }
        });

        res.json({
            annee,
            feries: enregistres,
            // Ce qui pourrait être engendré et ne l'a pas encore été.
            calculablesAbsents: feries.feriesCalculables(annee).filter(
                (c) => !enregistres.some((e) => feries.cleJour(e.date) === feries.cleJour(c.date))
            ),
            // Ce que l'application ne saura jamais calculer.
            aDecreter: feries.fetesManquantes(annee, enregistres),
            convention: {
                code: feries.CONVENTION,
                samediOuvrable: feries.SAMEDI_OUVRABLE,
                explication: feries.SAMEDI_OUVRABLE
                    ? 'Décompte en jours ouvrables : le samedi compte, le dimanche non.'
                    : 'Décompte en jours ouvrés : ni le samedi ni le dimanche ne comptent.'
            }
        });
    } catch (error) {
        console.error('Erreur lecture des jours fériés :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des jours fériés.' });
    }
};

/**
 * POST /api/jours-feries/engendrer — pose les fériés calculables d'une année.
 *
 * N'écrase jamais une date déjà enregistrée : une entreprise peut avoir requalifié
 * un jour, et la reprise d'un calcul ne doit pas effacer une décision.
 */
exports.engendrer = async (req, res) => {
    try {
        const annee = parseInt(req.body?.annee, 10) || new Date().getFullYear();
        if (annee < 2000 || annee > 2100) {
            return res.status(400).json({ error: 'Année hors des bornes admises.' });
        }

        const candidats = feries.feriesCalculables(annee);
        let poses = 0;
        const existants = [];

        for (const c of candidats) {
            const date = minuit(c.date);
            const deja = await prisma.jourFerie.findUnique({ where: { date } });
            if (deja) { existants.push(deja.libelle); continue; }
            await prisma.jourFerie.create({
                data: {
                    date, libelle: c.libelle, source: c.source,
                    createdBy: req.user?.email || null
                }
            });
            poses++;
        }

        const aDecreter = feries.FETES_A_DECRETER;
        res.status(201).json({
            annee,
            poses,
            conserves: existants.length,
            message: `${poses} jour(s) férié(s) posé(s) pour ${annee}.`
                + (existants.length ? ` ${existants.length} déjà enregistré(s), laissé(s) tels quels.` : ''),
            rappel: `Les fêtes musulmanes ne sont pas engendrées : elles sont arrêtées par décret `
                + `et doivent être saisies (${aDecreter.map((f) => f.libelle).join(', ')}).`
        });
    } catch (error) {
        console.error('Erreur génération des jours fériés :', error);
        res.status(500).json({ error: 'Erreur lors de la génération des jours fériés.' });
    }
};

/** POST /api/jours-feries — saisie d'un férié décrété ou propre à l'entreprise. */
exports.creer = async (req, res) => {
    try {
        const { date, libelle, source, chome, note } = req.body || {};
        const jour = minuit(date);
        if (!jour) return res.status(400).json({ error: 'Date invalide.' });
        if (!libelle || !String(libelle).trim()) {
            return res.status(400).json({ error: 'Un jour férié doit porter un libellé.' });
        }

        const deja = await prisma.jourFerie.findUnique({ where: { date: jour } });
        if (deja) {
            return res.status(409).json({
                error: `Le ${jour.toLocaleDateString('fr-FR')} est déjà enregistré comme « ${deja.libelle} ».`
            });
        }

        const cree = await prisma.jourFerie.create({
            data: {
                date: jour,
                libelle: String(libelle).trim(),
                source: ['DECRET', 'ENTREPRISE', 'LEGAL_FIXE', 'LEGAL_MOBILE'].includes(source)
                    ? source : 'DECRET',
                chome: chome !== false,
                note: note || null,
                createdBy: req.user?.email || null
            }
        });

        res.status(201).json(cree);
    } catch (error) {
        console.error('Erreur création de jour férié :', error);
        res.status(500).json({ error: 'Erreur lors de la création du jour férié.' });
    }
};

/** DELETE /api/jours-feries/:id */
exports.supprimer = async (req, res) => {
    try {
        const existant = await prisma.jourFerie.findUnique({ where: { id: req.params.id } });
        if (!existant) return res.status(404).json({ error: 'Jour férié introuvable.' });

        await prisma.jourFerie.delete({ where: { id: existant.id } });
        res.json({
            message: `« ${existant.libelle} » retiré du calendrier.`,
            // Les congés déjà validés gardent la durée arrêtée à leur validation :
            // la modifier après coup changerait un solde sans que personne ne le
            // demande.
            reserve: "Les congés déjà validés conservent la durée retenue au moment de leur validation."
        });
    } catch (error) {
        console.error('Erreur suppression de jour férié :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
};
