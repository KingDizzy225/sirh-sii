const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const aiDocumentController = require('../controllers/aiDocumentController');
const verifyToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireRole = require('../middleware/roleMiddleware');
const { traceAccess, cibles } = require('../middleware/accessTrace');
const signatureController = require('../controllers/signatureController');

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
// Signature depuis l'application, par le salarié lui-même.
router.post('/:id/sign', verifyToken, signatureController.signerConnecte);
// Demande de signature : c'est la RH qui décide qu'un document doit être signé,
// et le lien produit vaut autorisation de signer.
router.post('/:id/demande-signature', verifyToken, requireRole(['HR', 'ADMIN']), signatureController.demanderSignature);
router.get('/:id/certificat', verifyToken, signatureController.telechargerCertificat);
router.get('/:id/integrite', verifyToken, signatureController.verifierIntegrite);
router.get('/generate-attestation/:employeeId', verifyToken, documentController.generateAttestation);
router.delete('/:id', verifyToken, requireRole(['HR', 'ADMIN']), documentController.deleteDocument);

// Dossier Personnel
router.get('/employee/:employeeId', verifyToken, traceAccess('DOCUMENTS', cibles.parParam()), documentController.getEmployeeDocuments);

// Registre des documents officiels émis (attestations) et révocation
const verificationController = require('../controllers/verificationController');
router.get('/issued/:employeeId', verifyToken, requireRole(['HR', 'ADMIN']), verificationController.listIssuedDocuments);
router.post('/issued/:id/revoke', verifyToken, requireRole(['HR', 'ADMIN']), verificationController.revokeDocument);
router.post('/employee/:employeeId/upload', verifyToken, requireRole('HR', 'ADMIN'), upload.single('file'), documentController.uploadEmployeeDocument);

/**
 * Signature publique, par lien à usage unique.
 *
 * Les routes précédentes s'ouvraient sur l'identifiant du document et ne
 * vérifiaient rien : `GET /public/:id` rendait le dossier entier — nom du
 * salarié, chemin du fichier — à qui connaissait cet identifiant, et
 * `POST /public/:id/sign` signait en son nom. Le certificat produit annonçait
 * pourtant un « lien magique unique » que le code n'implémentait pas.
 *
 * L'adresse porte désormais un jeton aléatoire de 32 octets, à usage unique et
 * daté, et ne rend que ce que le signataire doit voir.
 */
router.get('/signature/:token', signatureController.getDocumentParJeton);
router.get('/signature/:token/fichier', signatureController.getFichierParJeton);
router.post('/signature/:token', signatureController.signerParJeton);

module.exports = router;
