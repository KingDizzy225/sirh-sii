const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Protect HTTP headers

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Autoriser le frontend en prod ou tout le monde en dev
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Allow cross-origin requests from the React frontend
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with higher limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Express 5 laisse req.body à undefined lorsqu'aucun corps n'a été transmis ou
// que le type de contenu ne correspond à aucun analyseur. Les contrôleurs
// déstructurent tous req.body : une requête malformée provoquait alors une
// erreur serveur là où un 400 était attendu — y compris sur les routes
// publiques, exposées à n'importe quel appel.
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {};
    next();
});

// Health Check Route
app.get('/api/health', async (req, res) => {
    // Indicateur d'exploitation : savoir si des comptes ont été provisionnés
    // permet de distinguer « mot de passe erroné » de « base sans compte »,
    // les deux se traduisant sinon par le même 401 côté connexion.
    // Volontairement booléen : aucun décompte ni aucune adresse n'est exposé.
    let comptesProvisionnes = null;
    try {
        const prisma = require('./prismaClient');
        comptesProvisionnes = (await prisma.user.count()) > 0;
    } catch {
        comptesProvisionnes = null; // base injoignable
    }

    res.status(200).json({
        status: 'success',
        message: 'SIRH API is running and healthy!',
        comptesProvisionnes,
        timestamp: new Date().toISOString()
    });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const assetRoutes = require('./routes/assetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const supportRoutes = require('./routes/supportRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const careerRoutes = require('./routes/careerRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const publicRoutes = require('./routes/publicRoutes');

const verifyToken = require('./middleware/authMiddleware');

// Serve static files for uploads (like generated payslip PDFs)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware d'Audit Trail
const auditLog = require('./middleware/auditMiddleware');
app.use('/api', auditLog);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', verifyToken, employeeRoutes);
app.use('/api/time-logs', verifyToken, timeLogRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/recruitment', verifyToken, recruitmentRoutes);
app.use('/api/trainings', verifyToken, trainingRoutes);
app.use('/api/analytics', verifyToken, analyticsRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);
app.use('/api/payrolls', verifyToken, payrollRoutes);
app.use('/api/performance', verifyToken, performanceRoutes);
app.use('/api/documents', verifyToken, documentRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);
app.use('/api/assets', verifyToken, assetRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/support/tickets', verifyToken, supportRoutes);
app.use('/api/career', careerRoutes); // verifyToken appliqué route par route (/catalog est public)
app.use('/api/webhooks', webhookRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/public', publicRoutes);

// V4 New Modules
const announcementRoutes = require('./routes/announcementRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');
const gpecRoutes = require('./routes/gpecRoutes');
const talentRoutes = require('./routes/talentRoutes');

// V5 New Modules
const offboardingRoutes = require('./routes/offboardingRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const benefitsRoutes = require('./routes/benefitsRoutes');
const ethicsRoutes = require('./routes/ethicsRoutes');
const subcontractorRoutes = require('./routes/subcontractorRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

app.use('/api/announcements', announcementRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/gpec', gpecRoutes);
app.use('/api/talents', verifyToken, talentRoutes);

app.use('/api/offboarding', verifyToken, offboardingRoutes); // offboardingRoutes internal verifyToken usage handles admin checks
app.use('/api/shifts', verifyToken, shiftRoutes);
app.use('/api/benefits', verifyToken, benefitsRoutes);
app.use('/api/ethics', ethicsRoutes); // Public & Admin inside
app.use('/api/subcontractors', verifyToken, subcontractorRoutes);
app.use('/api/simulations', verifyToken, simulationRoutes);
app.use('/api/equity', verifyToken, require('./routes/equityRoutes'));
app.use('/api/succession', verifyToken, require('./routes/successionRoutes'));
app.use('/api/job-descriptions', verifyToken, require('./routes/jobDescriptionRoutes'));
app.use('/api/retention', verifyToken, require('./routes/retentionRoutes'));
app.use('/api/audit', verifyToken, require('./routes/auditRoutes'));

// V6 Enterprise Upgrade - Chatbot IA
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', verifyToken, chatRoutes);

const absenceRoutes = require('./routes/absenceRoutes');
app.use('/api/absences', absenceRoutes);

const qrRoutes = require('./routes/qrRoutes');
app.use('/api/qr', qrRoutes); // No verifyToken because /scan is public, and /generate requires it in the route definition


// V8 Gamification & Kudos & Referrals
const kudoRoutes = require('./routes/kudoRoutes');
app.use('/api/kudos', kudoRoutes);

const referralRoutes = require('./routes/referralRoutes');
app.use('/api/referrals', referralRoutes);

const mentorshipRoutes = require('./routes/mentorshipRoutes');
app.use('/api/mentorship', mentorshipRoutes);

const contractRoutes = require('./routes/contractRoutes');
app.use('/api/contracts', contractRoutes);

const whatsappRoutes = require('./routes/whatsappRoutes');
app.use('/api/whatsapp', whatsappRoutes);

const surveyRoutes = require('./routes/surveyRoutes');
app.use('/api/surveys', surveyRoutes);

// V9 Pointage géolocalisé
const workSiteRoutes = require('./routes/workSiteRoutes');
app.use('/api/worksites', verifyToken, workSiteRoutes);

// Suivi des traitements RH planifiés (contrôles de rôle dans les routes)
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

// Dossiers disciplinaires — le fichier de routes existait mais n'était monté
// nulle part : la fiche employé appelait une API absente.
const disciplinaryRoutes = require('./routes/disciplinaryRoutes');
app.use('/api/disciplinary', disciplinaryRoutes);

// Tableau des tâches : réunit intégrations et départs, jusqu'ici consultables
// une fiche employé à la fois pendant que le tableau affichait des cartes
// écrites en dur dans la page.
const taskBoardRoutes = require('./routes/taskBoardRoutes');
app.use('/api/tasks', taskBoardRoutes);

// Santé et sécurité : registre des accidents du travail et conformité des
// visites médicales. La page tenait les deux dans des tableaux en dur.
const hseRoutes = require('./routes/hseRoutes');
app.use('/api/hse', hseRoutes);

// Global Error Logger for Express internals
app.use((err, req, res, next) => {
    console.error("[GLOBAL EXPRESS ERROR]", err);
    res.status(err.status || 500).json({ error: err.message });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Expose io to the global object or requests if needed
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`[Socket] Un client est connecté: ${socket.id}`);
    
    // Exemple : le client peut rejoindre une "room" selon son rôle ou son ID
    socket.on('join_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`[Socket] ${socket.id} a rejoint la room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Déconnexion: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, async () => {
    console.log(`🚀 SIRH Backend Server running on port ${PORT}`);
    try {
        const prisma = require('./prismaClient');
        await prisma.$connect();
        console.log("✅ Connexion à la base de données PostgreSQL établie avec succès.");

        // Comptes de démonstration annoncés sur l'écran de connexion.
        // N'écrase jamais un compte existant ; désactivable avec
        // DISABLE_TEST_ACCOUNTS=true avant une ouverture à de vrais salariés.
        const { bootstrapTestAccounts } = require('./lib/bootstrapTestAccounts');
        await bootstrapTestAccounts();

        // Création éventuelle d'un administrateur nominatif depuis les
        // variables d'environnement (sans effet si le compte existe déjà).
        const { bootstrapAdminFromEnv } = require('./lib/bootstrapAdmin');
        await bootstrapAdminFromEnv();

        // Traitements RH récurrents (acquisition des congés, alertes d'échéances).
        // Démarrés après la connexion : ils rattrapent les périodes manquées
        // pendant la mise en veille du service.
        const { startScheduledJobs } = require('./jobs');
        startScheduledJobs();
    } catch (dbErr) {
        console.warn("⚠️ Avertissement Connexion Base de Données : La base distante est en veille ou en cours de connexion.", dbErr.message);
    }
});
