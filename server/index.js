const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Autoriser le frontend en prod ou tout le monde en dev
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Allow cross-origin requests from the React frontend
app.use(express.json()); // Parse JSON bodies

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
const payrollRoutes = require('./routes/payrollRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const trainingRoutes = require('./routes/trainingRoutes'); // Added trainingRoutes

const verifyToken = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
// Toutes les routes définies après ceci nécessitent un Token valide
app.use('/api/employees', verifyToken, employeeRoutes);
app.use('/api/leaves', verifyToken, leaveRoutes);
app.use('/api/payroll', verifyToken, payrollRoutes);
app.use('/api/recruitment', verifyToken, recruitmentRoutes);
app.use('/api/trainings', verifyToken, trainingRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 SIRH Backend Server running on port ${PORT}`);
});
