const express = require('express');
const router = express.Router();
const dbCtrl = require('./db.ctrl');

// router.post('/colset', dbCtrl.getCollectionSet);
router.get('/info', dbCtrl.getDatabaseInfo);
router.post('/info', dbCtrl.saveDatabaseInfo);

module.exports = router;