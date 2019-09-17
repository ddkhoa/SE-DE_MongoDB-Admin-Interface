const express = require('express');
const router = express.Router();
const connCtrl = require('./conn.ctrl');

router.get('/', connCtrl.getSet);
router.post('/', connCtrl.create);

module.exports = router;