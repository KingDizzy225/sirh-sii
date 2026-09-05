/**
 * Tableau des tâches d'intégration et de départ.
 *
 * Les tâches existaient déjà en base — `OnboardingTask` est alimenté à chaque
 * embauche depuis les modèles de `data/onboardingTemplates.js`, `OffboardingTask`
 * l'est au départ d'un salarié — mais elles n'étaient consultables qu'une fiche
 * employé à la fois. Le tableau, lui, affichait des cartes écrites en dur dans
 * le fichier de la page : rien de ce qu'on y déplaçait n'était enregistré.
 *
 * Cette vue réunit les deux natures de tâches pour toute l'entreprise, avec le
 * salarié concerné et l'équipe responsable, et rend le déplacement d'une carte
 * durable.
 */

const prisma = require('../prismaClient');
const { hasRole } = require('../middleware/roleMiddleware');

// Le tableau raisonne en trois colonnes ; les modèles enregistrent un libellé.
// La correspondance est explicite dans les deux sens plutôt que déduite d'une
// mise en majuscules, pour qu'un libellé inattendu ne disparaisse pas du
// tableau sans laisser de trace.
const VERS_COLONNE = {
    'pending': 'PENDING',
    'à faire': 'PENDING',
    'in progress': 'IN_PROGRESS',
    'en cours': 'IN_PROGRESS',
    'completed': 'DONE',
    'done': 'DONE',
    'terminé': 'DONE'
};

const VERS_MODELE = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    DONE: 'Completed'
};

/**
 * Réduit un statut à sa forme de recherche.
 *
 * Le tableau parle en `IN_PROGRESS`, les modèles en « In Progress » : les deux
 * doivent aboutir à la même clé. Sans le remplacement du souligné, `IN_PROGRESS`
 * devenait `in_progress`, introuvable dans la table, et tout déplacement vers la
 * colonne du milieu était refusé — le seul des trois à l'être.
 */
const cleStatut = (statut) => String(statut || '').trim().toLowerCase().replace(/[_-]+/g, ' ');

const colonneDe = (statut) => VERS_COLONNE[cleStatut(statut)] || 'PENDING';

const nomComplet = (e) => e ? `${e.firstName || ''} ${e.lastName || ''}`.trim() : 'Salarié inconnu';

/**
 * Forme commune aux deux natures de tâche.
 * `equipe` est l'équipe responsable (`assignedTo`), pas le service du salarié :
 * c'est elle qui structure un tableau inter-services.
 */
const normaliser = (t, source) => ({
    id: t.id,
    source,
    titre: t.taskName,
    employeeId: t.employeeId,
    salarie: nomComplet(t.employee),
    serviceSalarie: t.employee?.department || null,
    equipe: t.assignedTo || 'Non assignée',
    echeance: t.dueDate || null,
    statut: colonneDe(t.status),
    creeLe: t.createdAt
});

/**
 * GET /api/tasks
 *
 * La RH et l'administration voient tout le tableau. Un autre profil ne voit que
 * les tâches qui le concernent : celles rattachées à sa propre fiche. Les
 * tâches d'intégration nomment des salariés qui n'ont parfois pas encore pris
 * leur poste — les exposer à tous reviendrait à annoncer les arrivées et les
 * départs à toute l'entreprise.
 */
exports.getBoard = async (req, res) => {
    try {
        const complet = hasRole(req.user, ['ADMIN', 'HR']);
        let filtre = {};

        if (!complet) {
            if (!req.user?.email) return res.status(403).json({ error: 'Accès refusé.' });
            const salarie = await prisma.employee.findUnique({
                where: { email: req.user.email },
                select: { id: true }
            });
            if (!salarie) return res.json({ taches: [], complet: false });
            filtre = { employeeId: salarie.id };
        }

        const inclusion = {
            employee: { select: { firstName: true, lastName: true, department: true } }
        };

        const [integration, depart] = await Promise.all([
            prisma.onboardingTask.findMany({
                where: filtre, include: inclusion, orderBy: { createdAt: 'desc' }
            }),
            prisma.offboardingTask.findMany({
                where: filtre, include: inclusion, orderBy: { createdAt: 'desc' }
            })
        ]);

        const taches = [
            ...integration.map(t => normaliser(t, 'ONBOARDING')),
            ...depart.map(t => normaliser(t, 'OFFBOARDING'))
        ];

        // Les tâches sans échéance passent en dernier : trier sur `null` les
        // placerait en tête et ferait paraître urgent ce qui n'a pas de date.
        taches.sort((a, b) => {
            if (a.echeance && b.echeance) return new Date(a.echeance) - new Date(b.echeance);
            if (a.echeance) return -1;
            if (b.echeance) return 1;
            return new Date(b.creeLe) - new Date(a.creeLe);
        });

        res.json({ taches, complet });
    } catch (error) {
        console.error('Erreur tableau des tâches :', error);
        res.status(500).json({ error: 'Erreur lors du chargement du tableau des tâches.' });
    }
};

/**
 * PATCH /api/tasks/:source/:id
 *
 * `source` vaut ONBOARDING ou OFFBOARDING : les deux natures vivent dans des
 * tables distinctes et un identifiant ne dit pas de laquelle il provient.
 */
exports.updateStatus = async (req, res) => {
    try {
        const { source, id } = req.params;
        const { statut } = req.body;

        const colonne = VERS_COLONNE[cleStatut(statut)];
        if (!colonne) {
            return res.status(400).json({
                error: `Statut « ${statut} » inconnu. Valeurs acceptées : PENDING, IN_PROGRESS, DONE.`
            });
        }

        const table = { ONBOARDING: 'onboardingTask', OFFBOARDING: 'offboardingTask' }[String(source).toUpperCase()];
        if (!table) {
            return res.status(400).json({ error: `Nature de tâche « ${source} » inconnue.` });
        }

        const existante = await prisma[table].findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Tâche introuvable.' });

        const misAJour = await prisma[table].update({
            where: { id },
            data: { status: VERS_MODELE[colonne] },
            include: { employee: { select: { firstName: true, lastName: true, department: true } } }
        });

        res.json(normaliser(misAJour, String(source).toUpperCase()));
    } catch (error) {
        console.error('Erreur mise à jour de tâche :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche.' });
    }
};
