import { DEMO_MODE } from '../context/AuthContext';

/**
 * Jeu de données de démonstration.
 *
 * Ces contenus servent la formation des utilisateurs et la présentation
 * commerciale de l'application : sans eux, un écran vide ne montre rien de ce
 * que l'outil sait faire.
 *
 * La règle qui les rend acceptables est simple : ils ne s'affichent QUE lorsque
 * le mode démonstration est explicitement activé, et un bandeau le signale
 * alors en permanence. Hors de ce mode, un écran sans données affiche un état
 * vide honnête plutôt qu'un décor plausible — c'est la confusion entre les
 * deux, et elle seule, qui rendait l'outil impossible à croire.
 *
 * Utilisation :
 *   const [items, setItems] = useState(donneesDemo(DEMO.mentors, []));
 * puis, à la réception de vraies données, on les remplace normalement.
 */

/** Renvoie le jeu de démonstration en mode démo, sinon la valeur réelle. */
export function donneesDemo(jeuDemo, valeurReelle) {
    return DEMO_MODE ? jeuDemo : valeurReelle;
}

export const DEMO = {
    employes: [
        { id: 'demo-e1', firstName: 'Awa', lastName: 'Traoré', positionTitle: 'Chargée de Recrutement', department: 'Ressources Humaines' },
        { id: 'demo-e2', firstName: 'Kouamé', lastName: 'N\'Guessan', positionTitle: 'Développeur Senior', department: 'Tech / IT' },
        { id: 'demo-e3', firstName: 'Fatou', lastName: 'Coulibaly', positionTitle: 'Contrôleuse de Gestion', department: 'Finance' },
        { id: 'demo-e4', firstName: 'Yao', lastName: 'Brou', positionTitle: 'Chef d\'Équipe', department: 'Opérations' }
    ],

    mentors: [
        { id: 'demo-m1', name: 'Fatou Coulibaly', skill: 'Contrôle de gestion', department: 'Finance', menteesCount: 2, rating: 4.8 },
        { id: 'demo-m2', name: 'Kouamé N\'Guessan', skill: 'Architecture logicielle', department: 'Tech / IT', menteesCount: 3, rating: 4.6 }
    ],

    mentorats: [
        { id: 'demo-r1', mentor: 'Fatou Coulibaly', mentee: 'Yao Brou', skillName: 'Analyse budgétaire', status: 'ACTIVE', sessionsCount: 3, startedAt: '2026-06-01' },
        { id: 'demo-r2', mentor: 'Kouamé N\'Guessan', mentee: 'Awa Traoré', skillName: 'Culture technique', status: 'COMPLETED', sessionsCount: 6, startedAt: '2026-02-15' }
    ],

    offres: [
        { id: 'demo-j1', title: 'Comptable Senior', department: 'Finance', location: 'Abidjan', status: 'OPEN' },
        { id: 'demo-j2', title: 'Ingénieur DevOps', department: 'Tech / IT', location: 'Abidjan', status: 'OPEN' },
        { id: 'demo-j3', title: 'Chargé de Clientèle', department: 'Service Client', location: 'Bouaké', status: 'OPEN' }
    ],

    cooptations: [
        { id: 'demo-c1', candidateFirstName: 'Ismaël', candidateLastName: 'Bamba', jobTitle: 'Ingénieur DevOps', status: 'INTERVIEW', bonusAmount: 150000, referrer: 'Kouamé N\'Guessan' },
        { id: 'demo-c2', candidateFirstName: 'Aya', candidateLastName: 'Konan', jobTitle: 'Comptable Senior', status: 'HIRED', bonusAmount: 150000, referrer: 'Fatou Coulibaly' }
    ],

    statistiquesCooptation: { total: 7, enCours: 3, recrutes: 2, primesVersees: 300000 },

    enquetes: [
        { id: 'demo-s1', title: 'Baromètre social — T3 2026', status: 'CLOSED', responsesCount: 42, enps: 31, createdAt: '2026-07-01' },
        { id: 'demo-s2', title: 'Qualité de vie au travail', status: 'OPEN', responsesCount: 18, enps: null, createdAt: '2026-09-01' }
    ],

    taches: [
        { id: 'demo-t1', title: 'Valider les congés de septembre', assignee: 'Awa Traoré', status: 'À faire', priority: 'Haute', dueDate: '2026-09-10' },
        { id: 'demo-t2', title: 'Préparer la campagne d\'entretiens annuels', assignee: 'Fatou Coulibaly', status: 'En cours', priority: 'Moyenne', dueDate: '2026-09-20' },
        { id: 'demo-t3', title: 'Clôturer le dossier d\'intégration de Yao Brou', assignee: 'Awa Traoré', status: 'Terminé', priority: 'Basse', dueDate: '2026-09-01' }
    ],

    formations: [
        { id: 'demo-f1', title: 'Droit du travail ivoirien — les fondamentaux', category: 'Juridique', durationHours: 14, participants: 12, status: 'PLANNED', date: '2026-10-05' },
        { id: 'demo-f2', title: 'Sécurité au poste et gestes de premiers secours', category: 'QHSE', durationHours: 7, participants: 25, status: 'COMPLETED', date: '2026-08-12' },
        { id: 'demo-f3', title: 'Management d\'équipe pour nouveaux responsables', category: 'Managérial', durationHours: 21, participants: 8, status: 'IN_PROGRESS', date: '2026-09-02' },
        { id: 'demo-f4', title: 'Excel avancé pour la fonction finance', category: 'Bureautique', durationHours: 10, participants: 15, status: 'PLANNED', date: '2026-11-18' }
    ],

    parcoursFormation: [
        { id: 'demo-p1', title: 'Intégration des nouveaux managers', modules: 5, completed: 3, employee: 'Yao Brou' },
        { id: 'demo-p2', title: 'Certification comptable SYSCOHADA', modules: 8, completed: 8, employee: 'Fatou Coulibaly' }
    ]
};

export default DEMO;
