/**
 * Modèles de tâches d'intégration.
 *
 * L'application créait déjà trois tâches automatiquement, mais les mêmes pour
 * tout le monde — et la liste était recopiée à trois endroits du contrôleur
 * employé. Elle est ici centralisée et complétée selon la famille de métier :
 * un comptable et un agent QHSE n'ont pas les mêmes formalités d'arrivée.
 *
 * Les familles reprennent celles du référentiel de carrière
 * (server/data/careerCatalog.js). Un département inconnu reçoit le socle
 * commun, jamais rien de moins.
 */

// Tâches applicables à toute arrivée
const SOCLE = [
    { taskName: "Signature électronique du contrat de travail", assignedTo: "Ressources Humaines", jours: 5 },
    { taskName: "Création des accès informatiques et adresse email", assignedTo: "IT Support", jours: 2 },
    { taskName: "Remise du livret d'accueil et du règlement intérieur", assignedTo: "Ressources Humaines", jours: 3 },
    { taskName: "Déclaration préalable à l'embauche (CNPS)", assignedTo: "Ressources Humaines", jours: 3 },
    { taskName: "Visite médicale d'embauche à planifier", assignedTo: "Ressources Humaines", jours: 15 },
    { taskName: "Planification du point d'intégration (1ère semaine)", assignedTo: "Manager Direct", jours: 7 },
    { taskName: "Entretien de fin de période d'essai à programmer", assignedTo: "Manager Direct", jours: 75 }
];

// Compléments par famille de métier
const PAR_FAMILLE = {
    'Tech / IT': [
        { taskName: "Mise à disposition du poste de développement et des dépôts de code", assignedTo: "IT Support", jours: 2 },
        { taskName: "Habilitation aux environnements et revue des règles de sécurité", assignedTo: "Responsable Sécurité", jours: 5 }
    ],
    'Data & IA': [
        { taskName: "Accès aux entrepôts de données et rappel des règles de confidentialité", assignedTo: "Lead Data", jours: 3 }
    ],
    'Cybersécurité': [
        { taskName: "Signature de la charte de sécurité et engagement de confidentialité renforcé", assignedTo: "Responsable Sécurité", jours: 2 }
    ],
    'Finance': [
        { taskName: "Habilitation au logiciel comptable et aux droits de saisie", assignedTo: "Responsable Comptable", jours: 3 },
        { taskName: "Rappel des règles de séparation des tâches et de validation", assignedTo: "Responsable Comptable", jours: 5 }
    ],
    'Ressources Humaines': [
        { taskName: "Habilitation au SIRH et sensibilisation à la protection des données", assignedTo: "Directeur RH", jours: 3 }
    ],
    'Juridique & Conformité': [
        { taskName: "Engagement de confidentialité et accès à la base contractuelle", assignedTo: "Directeur Juridique", jours: 3 }
    ],
    'Commercial & Ventes': [
        { taskName: "Accès au CRM et remise du portefeuille clients", assignedTo: "Directeur Commercial", jours: 3 },
        { taskName: "Formation à l'offre et aux conditions tarifaires", assignedTo: "Directeur Commercial", jours: 10 }
    ],
    'Marketing & Communication': [
        { taskName: "Accès aux outils de publication et à la charte de marque", assignedTo: "Responsable Marketing", jours: 3 }
    ],
    'Achats & Supply Chain': [
        { taskName: "Habilitation aux commandes et rappel des seuils de validation", assignedTo: "Responsable Achats", jours: 5 }
    ],
    'Opérations': [
        { taskName: "Formation sécurité au poste et remise des équipements de protection", assignedTo: "Responsable QHSE", jours: 1 },
        { taskName: "Accompagnement terrain par un référent", assignedTo: "Chef d'Équipe", jours: 5 }
    ],
    'QHSE': [
        { taskName: "Formation sécurité approfondie et habilitations réglementaires", assignedTo: "Responsable QHSE", jours: 5 }
    ],
    'Service Client': [
        { taskName: "Accès à l'outil de ticketing et double écoute d'accompagnement", assignedTo: "Superviseur Service Client", jours: 3 }
    ],
    'Produit & Design': [
        { taskName: "Accès aux outils de conception et présentation de la feuille de route", assignedTo: "Head of Product", jours: 3 }
    ],
    'Administration': [
        { taskName: "Remise des accès aux locaux et présentation des prestataires", assignedTo: "Office Manager", jours: 2 }
    ],
    'Direction Générale': [
        { taskName: "Points de prise de fonction avec chaque direction", assignedTo: "Directeur Général", jours: 15 }
    ]
};

const dansNJours = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};

/**
 * Tâches d'intégration d'un salarié : socle commun plus compléments métier.
 * @param {{id: string, department?: string}} employee
 */
function buildOnboardingTasks(employee) {
    const famille = employee.department || '';
    const complements = PAR_FAMILLE[famille] || [];

    return [...SOCLE, ...complements].map((t) => ({
        employeeId: employee.id,
        taskName: t.taskName,
        assignedTo: t.assignedTo,
        dueDate: dansNJours(t.jours)
    }));
}

/**
 * Tâches d'intégration en tenant compte des modèles enregistrés par la RH.
 *
 * Les modèles actifs de la base prennent le pas sur le socle codé ci-dessus :
 * un modèle ciblant la famille du salarié s'applique en priorité, à défaut le
 * modèle général. Sans aucun modèle actif, on retombe sur `buildOnboardingTasks`
 * — le comportement reste donc celui d'avant tant que rien n'a été personnalisé,
 * et une base vide ne prive jamais une arrivée de ses formalités.
 *
 * @param {{id: string, department?: string}} employee
 * @param {object} prisma Client Prisma, passé pour garder ce fichier sans
 *   dépendance à la base — il reste ainsi utilisable hors contexte serveur.
 */
async function construireTachesIntegration(employee, prisma) {
    try {
        const modeles = await prisma.taskTemplate.findMany({
            where: { type: 'ONBOARDING', active: true },
            include: { items: true }
        });
        if (modeles.length === 0) return buildOnboardingTasks(employee);

        const famille = employee.department || '';
        const cible = modeles.find(m => m.family && m.family === famille)
            || modeles.find(m => !m.family);
        if (!cible || cible.items.length === 0) return buildOnboardingTasks(employee);

        return cible.items
            .slice()
            .sort((a, b) => a.position - b.position)
            .map(i => ({
                employeeId: employee.id,
                taskName: i.title,
                assignedTo: i.assignedTo,
                dueDate: dansNJours(i.relativeDays)
            }));
    } catch (error) {
        // Une embauche ne doit pas échouer parce que les modèles sont
        // illisibles : on retombe sur le socle et on le signale.
        console.error('[INTÉGRATION] Modèles enregistrés illisibles, socle appliqué :', error.message);
        return buildOnboardingTasks(employee);
    }
}

module.exports = { buildOnboardingTasks, construireTachesIntegration, SOCLE, PAR_FAMILLE };
