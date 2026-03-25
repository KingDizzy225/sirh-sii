const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'SIRH API is running and healthy!',
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

const verifyToken = require('./middleware/authMiddleware');

// Serve static files for uploads (like generated payslip PDFs)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', verifyToken, employeeRoutes);
app.use('/api/leaves', verifyToken, leaveRoutes);
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

// Global Error Logger for Express internals
app.use((err, req, res, next) => {
    console.error("[GLOBAL EXPRESS ERROR]", err);
    res.status(err.status || 500).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 SIRH Backend Server running on port ${PORT}`);
});
