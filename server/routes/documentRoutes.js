const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');
const verifyToken = require('../middleware/authMiddleware');

// === Configuration multer ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Max
});

// === ROUTES ===
router.post('/upload', verifyToken, upload.single('document'), documentController.uploadDocument);
router.get('/', verifyToken, documentController.getDocuments);
router.delete('/:docId', verifyToken, documentController.deleteDocument);

module.exports = router;
