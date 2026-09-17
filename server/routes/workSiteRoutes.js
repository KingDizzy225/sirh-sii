const express = require('express');
const router = express.Router();
const workSiteController = require('../controllers/workSiteController');

router.get('/', workSiteController.getWorkSites);
// Carte des agences : présences du moment, site par site. Noms compris, donc RH seulement.
router.get('/carte', require('../middleware/roleMiddleware')(['ADMIN', 'HR']), async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        res.json(await require('../lib/carteSites').etat());
    } catch (erreur) {
        console.error('[CARTE] État des sites indisponible :', erreur.message);
        res.status(500).json({ error: 'État des sites indisponible.' });
    }
});
router.post('/', workSiteController.createWorkSite);
router.put('/:id', workSiteController.updateWorkSite);
router.delete('/:id', workSiteController.deleteWorkSite);

module.exports = router;
