const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const aiDocumentController = require('../controllers/aiDocumentController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', verifyToken, documentController.getDocuments);
router.post('/upload', verifyToken, requireRole(['HR', 'ADMIN']), upload.single('file'), documentController.uploadDocument);
// router.post('/generate', verifyToken, documentController.generateAndSignDocument); // Disabled
router.post('/ai-generate', verifyToken, aiDocumentController.generateAIDocument);
router.post('/:id/sign', verifyToken, aiDocumentController.signDocument);
router.delete('/:id', verifyToken, requireRole(['HR', 'ADMIN']), documentController.deleteDocument);

module.exports = router;
