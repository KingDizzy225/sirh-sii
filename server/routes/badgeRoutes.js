const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireRole = require('../middleware/roleMiddleware');
const badgeController = require('../controllers/badgeController');

/**
 * Badges numériques. La carte et la vérification sont publiques
 * (routes/publicRoutes.js) ; l'émission est réservée à la RH.
 */
if (!fs.existsSync(badgeController.DOSSIER_PHOTOS)) fs.mkdirSync(badgeController.DOSSIER_PHOTOS, { recursive: true });

// Une photo d'identité, rien d'autre : ni PDF, ni HEIC que les navigateurs
// n'affichent pas.
const FORMATS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const televerser = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, badgeController.DOSSIER_PHOTOS),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!FORMATS.has(file.mimetype) || !EXTENSIONS.has(extension)) {
            return cb(new Error('Photo non acceptée : joindre une image JPEG, PNG ou WebP.'));
        }
        cb(null, true);
    }
});

const avecPhoto = (req, res, next) => televerser.single('photo')(req, res, (erreur) => {
    if (erreur) return res.status(400).json({ error: erreur.code === 'LIMIT_FILE_SIZE' ? 'Photo trop lourde (5 Mo au plus).' : erreur.message });
    next();
});

router.get('/', requireRole(['ADMIN', 'HR']), badgeController.lister);
router.post('/:employeeId/emettre', requireRole(['ADMIN', 'HR']), avecPhoto, badgeController.emettre);
router.post('/:id/revoquer', requireRole(['ADMIN', 'HR']), badgeController.revoquer);

module.exports = router;
