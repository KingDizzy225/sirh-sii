const prisma = require('../prismaClient');
const QRCode = require('qrcode');

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

exports.generateQRCode = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Ensure employee exists
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });
        
        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé" });
        }
        
        // URL for the frontend scanning app
        const scanUrl = `${FRONTEND_URL}/qr-pointage?emp=${employeeId}`;
        
        // Generate QR Code base64 image
        const qrCodeImage = await QRCode.toDataURL(scanUrl, {
            color: {
                dark: '#000000',  
                light: '#ffffff'
            },
            width: 300,
            margin: 2
        });
        
        res.status(200).json({ 
            qrCode: qrCodeImage,
            employeeName: `${employee.firstName} ${employee.lastName}`
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du QR Code' });
    }
};

exports.clockIn = async (req, res) => {
    try {
        const { employeeId, type = 'START' } = req.body;
        
        if (!employeeId) {
            return res.status(400).json({ error: "L'ID de l'employé est requis" });
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });

        if (!employee) {
            return res.status(404).json({ error: "Employé non reconnu" });
        }

        // Create time log
        const timeLog = await prisma.timeLog.create({
            data: {
                employeeId,
                date: new Date(),
                timeIn: new Date(),
                status: 'PRESENT',
                notes: `Pointage QR Code - ${type}`
            }
        });

        res.status(200).json({ 
            message: `Pointage enregistré pour ${employee.firstName}`,
            timeLog 
        });
    } catch (error) {
        console.error('Error scanning QR code:', error);
        res.status(500).json({ error: 'Erreur lors du pointage' });
    }
};
