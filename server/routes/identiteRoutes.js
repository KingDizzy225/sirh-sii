const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireRole = require('../middleware/roleMiddleware');
const identite = require('../lib/identite');
const identiteController = require('../controllers/identiteController');

if (!fs.existsSync(identite.DOSSIER_LOGOS)) fs.mkdirSync(identite.DOSSIER_LOGOS, { recursive: true });

// Pas de SVG : un SVG peut porter du script, et le logo est servi publiquement.
const FORMATS = new Set(['image/png', 'image/jpeg', 'image/webp']);
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const televerser = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, identite.DOSSIER_LOGOS),
        filename: (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!FORMATS.has(file.mimetype) || !EXTENSIONS.has(extension)) {
            return cb(new Error('Logo attendu en PNG, JPEG ou WebP.'));
        }
        cb(null, true);
    }
});

router.get('/', requireRole(['ADMIN', 'HR']), identiteController.lire);
router.put('/', requireRole(['ADMIN', 'HR']), identiteController.enregistrer);
router.post('/logo', requireRole(['ADMIN', 'HR']), (req, res, next) => televerser.single('logo')(req, res, (erreur) => {
    if (erreur) return res.status(400).json({ error: erreur.code === 'LIMIT_FILE_SIZE' ? 'Logo trop lourd (2 Mo au plus).' : erreur.message });
    next();
}), identiteController.deposerLogo);

module.exports = router;
