const express = require('express');
const router = express.Router();
const workSiteController = require('../controllers/workSiteController');

router.get('/', workSiteController.getWorkSites);
router.post('/', workSiteController.createWorkSite);
router.put('/:id', workSiteController.updateWorkSite);
router.delete('/:id', workSiteController.deleteWorkSite);

module.exports = router;
