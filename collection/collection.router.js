const express = require('express');
const router = express.Router();
const collectionCtrl = require('./collection.ctrl');

router.post('/schema', collectionCtrl.getSchema);
// router.post('/stat', collectionCtrl.getServerStat);

module.exports = router;