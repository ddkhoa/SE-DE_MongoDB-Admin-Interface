const express = require('express');
const router = express.Router();
const dbserver = require('./dbserver/dbserver.router');
const database = require('./database/db.router');
const collection = require('./collection/collection.router');
const connection = require('./connection/conn.router');

router.use('/server', dbserver);
router.use('/database', database);
router.use('/collection', collection);
router.use('/connections', connection);

module.exports = router;

