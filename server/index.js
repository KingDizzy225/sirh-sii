const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from the React frontend
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
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 SIRH Backend Server running on port ${PORT}`);
});
