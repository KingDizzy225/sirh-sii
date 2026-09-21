const prisma = require('../prismaClient');
const grille = require('../lib/grille');

/**
 * Grille conventionnelle : saisie des minima, affectation des salariés,
 * contrôle de l'effectif.
 */

exports.lister = async (req, res) => {
    try {
        const [lignes, controle] = await Promise.all([
            prisma.grilleConvention.findMany({ orderBy: [{ convention: 'asc' }, { ordre: 'asc' }, { categorie: 'asc' }, { echelon: 'asc' }] }),
            grille.controlerEffectif(req.query.convention)
        ]);
        res.json({ grille: lignes, ...controle });
    } catch (erreur) {
        console.error('[GRILLE] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture de la grille impossible.' });
    }
};

exports.enregistrer = async (req, res) => {
    try {
        const convention = String(req.body?.convention || '').trim();
        const categorie = String(req.body?.categorie || '').trim();
        const echelon = String(req.body?.echelon || '').trim() || grille.ECHELON_PAR_DEFAUT;
        const salaireMinimum = Number(req.body?.salaireMinimum);
        const ordre = Number.isFinite(Number(req.body?.ordre)) ? Number(req.body.ordre) : 0;

        if (!convention || !categorie) return res.status(400).json({ error: 'Convention et catégorie sont requises.' });
        if (!Number.isFinite(salaireMinimum) || salaireMinimum <= 0) {
            return res.status(400).json({ error: 'Le salaire minimum doit être un montant positif.' });
        }

        const ligne = await prisma.grilleConvention.upsert({
            where: { convention_categorie_echelon: { convention, categorie, echelon } },
            create: { convention, categorie, echelon, salaireMinimum, ordre, creePar: req.user?.name || req.user?.email || null },
            update: { salaireMinimum, ordre, actif: true }
        });
        res.status(201).json({ ligne, message: 'Minimum enregistré. Les salaires sont contrôlés à chaque paie.' });
    } catch (erreur) {
        console.error('[GRILLE] Enregistrement impossible :', erreur.message);
        res.status(500).json({ error: 'Enregistrement impossible.' });
    }
};

exports.retirer = async (req, res) => {
    try {
        const { count } = await prisma.grilleConvention.updateMany({ where: { id: req.params.id, actif: true }, data: { actif: false } });
        if (count === 0) return res.status(404).json({ error: 'Ligne introuvable ou déjà retirée.' });
        // Retirée, pas supprimée : un minimum passé explique un salaire passé.
        res.json({ message: 'Ligne retirée de la grille en vigueur. Elle reste en base pour expliquer les salaires antérieurs.' });
    } catch (erreur) {
        console.error('[GRILLE] Retrait impossible :', erreur.message);
        res.status(500).json({ error: 'Retrait impossible.' });
    }
};

/** Affecte une catégorie et un échelon à un salarié. */
exports.affecter = async (req, res) => {
    try {
        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const categorie = String(req.body?.categorie || '').trim() || null;
        const echelon = String(req.body?.echelon || '').trim() || null;
        const index = await grille.indexer();
        if (categorie && !index.has(grille.cle(categorie, echelon))) {
            return res.status(400).json({ error: `La catégorie « ${categorie} » (échelon « ${echelon || grille.ECHELON_PAR_DEFAUT} ») ne figure pas dans la grille.` });
        }

        await prisma.employee.update({ where: { id: salarie.id }, data: { categorieConvention: categorie, echelonConvention: echelon } });
        const controle = grille.controler({ categorieConvention: categorie, echelonConvention: echelon }, salarie.baseSalary, index);
        res.json({
            controle,
            message: controle.conforme
                ? 'Catégorie affectée.'
                : `Catégorie affectée, mais le salaire actuel est inférieur au minimum : ${controle.motif}`
        });
    } catch (erreur) {
        console.error('[GRILLE] Affectation impossible :', erreur.message);
        res.status(500).json({ error: 'Affectation impossible.' });
    }
};
