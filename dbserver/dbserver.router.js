const express = require('express');
const router = express.Router();
const dbCtrl = require('./dbserver.ctrl');

router.post('/connect', dbCtrl.connect);
router.post('/dbset', dbCtrl.getDbSet);
router.post('/stat', dbCtrl.getServerStat);
router.post('/compare', dbCtrl.compareStructure);
router.get('/description', dbCtrl.getDescriptionFile);

module.exports = router;