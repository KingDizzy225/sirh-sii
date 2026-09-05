/**
 * Jeu de données de démonstration.
 *
 * Ces contenus servent la formation des utilisateurs et la présentation
 * commerciale : sans eux, un écran vide ne montre rien de ce que l'outil sait
 * faire. Ce qui les rend acceptables est qu'ils ne s'affichent QUE lorsque le
 * mode démonstration est explicitement activé — signalé alors en permanence par
 * un bandeau. Hors de ce mode, les écrans affichent un état vide honnête.
 * C'est la confusion entre les deux, et elle seule, qui rendait l'outil
 * impossible à croire.
 *
 * Le drapeau est lu directement depuis l'environnement plutôt qu'importé du
 * contexte d'authentification : ce module est chargé par des pages qui
 * importent elles-mêmes ce contexte, et la dépendance croisée est inutile ici.
 *
 * ⚠️ Ces objets reproduisent exactement la forme attendue par les composants
 * qui les consomment. Les remplacer par des structures plus simples casse les
 * pages à l'exécution, sans que la compilation ne signale quoi que ce soit.
 */

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

/** Renvoie le jeu de démonstration en mode démo, sinon la valeur réelle. */
export function donneesDemo(jeuDemo, valeurReelle) {
    return DEMO_MODE ? jeuDemo : valeurReelle;
}

export const DEMO = {
    // Repris de MOCK_MENTORS — forme conservée telle quelle
    mentors: [
    { id: 'm-1', firstName: 'Ibrahim', lastName: 'Diop', department: 'Technologie', positionTitle: 'Architecte Software', skills: ['React', 'Node.js', 'Prisma', 'Architecture Microservices'], rating: 4.9, activeMentees: 2, bio: 'Passionné par l\'ingénierie moderne et le partage de connaissances.' },
    { id: 'm-2', firstName: 'Sarah', lastName: 'Jenkins', department: 'Ressources Humaines', positionTitle: 'Directrice RH & Talent', skills: ['GPEC', 'Management RH', 'Leadership', 'Négociation'], rating: 5.0, activeMentees: 3, bio: '15 ans d\'expérience dans l\'accompagnement des carrières et de la mobilité interne.' },
    { id: 'm-3', firstName: 'Marc', lastName: 'Kouassi', department: 'Cybersécurité', positionTitle: 'Expert Sécurité SI', skills: ['Sécurité Web', 'Audit ISO 27001', 'Penetration Testing'], rating: 4.8, activeMentees: 1, bio: 'Spécialiste de la protection des données sensibles et de la conformité réglementaire.' }
],

    // Repris de MOCK_MENTORSHIPS — forme conservée telle quelle
    mentorats: [
    {
        id: 'rel-1',
        skillName: 'Architecture Microservices',
        goals: 'Maîtriser la création d\'APIs robustes et le découplage des données.',
        status: 'ACTIVE',
        mentor: { firstName: 'Ibrahim', lastName: 'Diop', positionTitle: 'Architecte Software', department: 'Technologie' },
        mentee: { firstName: 'Jean', lastName: 'Kone', positionTitle: 'Développeur Fullstack', department: 'IT' },
        sessions: [
            { id: 's-1', topic: 'Bases des microservices & Gateway', date: '2026-08-15', durationMinutes: 60, rating: 5, notes: 'Très bonne compréhension des principes REST.' }
        ]
    }
],

    // Repris de MOCK_JOBS — forme conservée telle quelle
    offres: [
    { id: 'job-1', title: 'Développeur Fullstack React / Node', department: 'Technologie', location: 'Abidjan / Hybride', type: 'CDI', status: 'Active', description: 'Rejoignez notre équipe digitale pour concevoir et développer des applications web haute performance.' },
    { id: 'job-2', title: 'Chef de Projet SI & Transformation', department: 'Systèmes d\'Information', location: 'Abidjan', type: 'CDI', status: 'Active', description: 'Pilotage des grands projets de transformation numérique pour nos filiales régionales.' },
    { id: 'job-3', title: 'Consultant RH & GPEC Senior', department: 'Ressources Humaines', location: 'Dakar / Remote', type: 'CDI', status: 'Active', description: 'Accompagnement de la cartographie des compétences et des plans de succession.' }
],

    // Repris de MOCK_REFERRALS — forme conservée telle quelle
    cooptations: [
    {
        id: 'ref-1',
        candidateFirstName: 'Marc',
        candidateLastName: 'Kouassi',
        candidateEmail: 'marc.kouassi@email.com',
        candidatePhone: '+225 07 48 92 10',
        relationship: 'Ancien collègue',
        status: 'INTERVIEW',
        bonusAmount: 150000,
        referrer: { firstName: 'Sarah', lastName: 'Jenkins' },
        jobOffer: { title: 'Développeur Fullstack React / Node', department: 'Technologie' }
    },
    {
        id: 'ref-2',
        candidateFirstName: 'Awa',
        candidateLastName: 'Diallo',
        candidateEmail: 'awa.diallo@email.com',
        candidatePhone: '+221 77 12 34 56',
        relationship: 'Camarade d\'école',
        status: 'HIRED',
        bonusAmount: 200000,
        referrer: { firstName: 'Ibrahim', lastName: 'Diop' },
        jobOffer: { title: 'Chef de Projet SI & Transformation', department: 'Systèmes d\'Information' }
    }
],

    // Repris de MOCK_STATS — forme conservée telle quelle
    statistiquesCooptation: {
    totalReferrals: 8,
    hiredReferrals: 3,
    pendingReferrals: 4,
    totalBonusPaid: 450000,
    leaderboard: [
        { referrerId: 'emp-1', totalCount: 4, employee: { firstName: 'Ibrahim', lastName: 'Diop', positionTitle: 'Lead Dev', department: 'IT' } },
        { referrerId: 'emp-2', totalCount: 2, employee: { firstName: 'Sarah', lastName: 'Jenkins', positionTitle: 'Directrice RH', department: 'RH' } },
        { referrerId: 'emp-3', totalCount: 1, employee: { firstName: 'Koffi', lastName: 'Bamba', positionTitle: 'Manager Projets', department: 'SI' } }
    ]
},

    // Repris de MOCK_ASSIGNED_TASKS — forme conservée telle quelle
    taches: [
    { id: 'AT-001', title: 'Créer e-mail & comptes', employee: 'Michael Chang', department: 'IT', status: 'PENDING', dueDate: '2026-03-02', type: 'ONBOARDING' },
    { id: 'AT-002', title: 'Préparer ordinateur et bureau', employee: 'Michael Chang', department: 'IT', status: 'IN_PROGRESS', dueDate: '2026-03-03', type: 'ONBOARDING' },
    { id: 'AT-003', title: 'Signer contrat de travail', employee: 'Michael Chang', department: 'HR', status: 'DONE', dueDate: '2026-02-28', type: 'ONBOARDING' },
    { id: 'AT-004', title: 'Révoquer accès VPN', employee: 'Sarah Jenkins', department: 'IT', status: 'PENDING', dueDate: '2026-02-28', type: 'OFFBOARDING' },
    { id: 'AT-005', title: 'Entretien de départ', employee: 'Sarah Jenkins', department: 'HR', status: 'PENDING', dueDate: '2026-02-27', type: 'OFFBOARDING' },
    { id: 'AT-006', title: 'Délivrer badge de sécurité', employee: 'Michael Chang', department: 'Facilities', status: 'PENDING', dueDate: '2026-03-04', type: 'ONBOARDING' }
],

    // Repris de MOCK_SURVEYS — forme conservée telle quelle
    enquetes: [
    {
        id: 'sur-1',
        title: 'Baromètre Climat Social Q3 2026',
        description: 'Évaluation de la qualité de vie au travail et de l\'équilibre vie pro/perso.',
        status: 'ACTIVE',
        enpsScore: 42,
        responses: [
            { id: 'r-1', score: 9, feedback: 'Très bonne ambiance et super initiative de télétravail !', department: 'Technologie' },
            { id: 'r-2', score: 8, feedback: 'Bonne dynamique d\'équipe, besoin de plus de clarté sur la GPEC.', department: 'Ressources Humaines' },
            { id: 'r-3', score: 10, feedback: 'La nouvelle plateforme de mentorat est excellente.', department: 'Finance' }
        ]
    }
],

    // Repris de MOCK_EMPLOYEES — forme conservée telle quelle
    employes: [
    { id: 'emp-1', firstName: 'Jean', lastName: 'Kouassi', positionTitle: 'Ingénieur DevOps', department: 'Technologie', email: 'jean.kouassi@entreprise.com', baseSalary: '850 000' },
    { id: 'emp-2', firstName: 'Awa', lastName: 'Traoré', positionTitle: 'Chef de Projet RH', department: 'Ressources Humaines', email: 'awa.traore@entreprise.com', baseSalary: '750 000' },
    { id: 'emp-3', firstName: 'Koffi', lastName: 'N\'Guessan', positionTitle: 'Analyste Financier', department: 'Finance', email: 'koffi.nguessan@entreprise.com', baseSalary: '650 000' }
],

    // Catalogue de formations : la page n'avait aucune donnée à montrer
    formations: [
        { id: 'trn-1', title: 'Droit du travail ivoirien — les fondamentaux', category: 'Juridique', durationHours: 14, date: '2026-10-05', status: 'PLANNED', participants: 12, description: "Cadre légal des contrats, du temps de travail et de la rupture." },
        { id: 'trn-2', title: 'Sécurité au poste et gestes de premiers secours', category: 'QHSE', durationHours: 7, date: '2026-08-12', status: 'COMPLETED', participants: 25, description: 'Prévention des risques et conduite à tenir en cas d\'accident.' },
        { id: 'trn-3', title: "Management d'équipe pour nouveaux responsables", category: 'Managérial', durationHours: 21, date: '2026-09-02', status: 'IN_PROGRESS', participants: 8, description: 'Animation, délégation et conduite des entretiens.' },
        { id: 'trn-4', title: 'Excel avancé pour la fonction finance', category: 'Bureautique', durationHours: 10, date: '2026-11-18', status: 'PLANNED', participants: 15, description: 'Tableaux croisés, modélisation et automatisation.' }
    ]
};

export default DEMO;
