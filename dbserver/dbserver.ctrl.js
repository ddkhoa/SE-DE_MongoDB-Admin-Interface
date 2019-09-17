const MongoClient = require('mongodb').MongoClient;
const connectionSingleton = require("../connectionSingleton");
const utils = require("../utils");
const path = require("path");
const fs = require("fs");

module.exports = {

    connect: async function (req, res) {

        await connectionSingleton.connect(req.body);

        res.send({
            success: true,
            errorSet: []
        });
    },


    getDbSet: async function (req, res) {

        let client = connectionSingleton.connection;

        // List all the available databases
        // Use the admin database for the operation
        const dbAdmin = client.db('admin');
        const admin = dbAdmin.admin();
        const databases = await admin.listDatabases();
        const dbset = databases.databases;

        // List all collections of each database
        for (let i = 0; i < dbset.length; i = i + 1) {

            let dbname = dbset[i].name;
            dbset[i].collections = [];

            let db = client.db(dbname);

            let collections = await db.listCollections().toArray();
            for (let j = 0; j < collections.length; j = j + 1) {
                dbset[i].collections.push({
                    name: collections[j].name
                });
            }
        }

        res.send({
            success: true,
            errorSet: [],
            data: dbset
        });

    },

    getServerStat: async function (req, res) {

        let client = connectionSingleton.connection;

        // Get database server status
        // Use the admin database for the operation
        const dbAdmin = client.db('admin');
        const admin = dbAdmin.admin();
        const status = await admin.serverStatus();
        let data = {};

        if (status) {

            data = {
                host: status.host,
                version: status.version,
                uptime: status.uptime,
                serverTime: status.localTime,
                currentConnections: status.connections.current,
                availableConnections: status.connections.available,
                activeClients: status.globalLock.activeClients.total,
                clientReading: status.globalLock.activeClients.readers,
                clientWriting: status.globalLock.activeClients.writers,
                queueOperations: status.globalLock.currentQueue.total,
                readLockQueue: status.globalLock.currentQueue.readers,
                writeLockQueue: status.globalLock.currentQueue.writers,
                // diskFlushes: status.backgroundFlushing.flushes,
                // lastFlushes: status.backgroundFlushing ? info.backgroundFlushing.last_finished : '',
                // totalTimeFlush : status.backgroundFlushing.total_ms,
                // avgTimeFlush : status.backgroundFlushing.average_ms,
                totalInserts: status.opcounters.insert,
                totalQueries: status.opcounters.query,
                totalUpdates: status.opcounters.update,
                totalDeletes: status.opcounters.delete,
            };
        }

        res.send({
            success: true,
            errorSet: [],
            data: data
        });
    },

    compareStructure: async function (req, res) {

        let { dbdes } = req.body;
        let dbsrc = connectionSingleton.config;

        let urldbsrc = geturl(dbsrc);
        let urldbdes = geturl(dbdes);

        Promise.all([
            await getDatabaseStructure(urldbsrc),
            await getDatabaseStructure(urldbdes)
        ]).then(data => {
            let dbsrcstruc = data[0];
            let dbdesstruc = data[1];

            // transform
            let dbsrcstructransfomed = {};
            for (let i = 0; i < dbsrcstruc.length; i = i + 1) {
                let dbname = dbsrcstruc[i].name;
                let collections = dbsrcstruc[i].collections.map(item => {
                    return {
                        name: item.name, state: ""
                    }
                });
                dbsrcstructransfomed[dbname] = { collections: collections };
            }

            let dbdesstructransfomed = {};
            for (let i = 0; i < dbdesstruc.length; i = i + 1) {
                let dbname = dbdesstruc[i].name;
                let collections = dbdesstruc[i].collections.map(item => {
                    return {
                        name: item.name, state: ""
                    }
                });
                dbdesstructransfomed[dbname] = { collections: collections };
            }

            // merge 2 structure
            let mergestruc = {};
            for (let i = 0; i < dbsrcstruc.length; i = i + 1) {
                let dbname = dbsrcstruc[i].name;
                let collections = dbsrcstruc[i].collections.map(item => {
                    return {
                        name: item.name, state: ""
                    }
                });
                mergestruc[dbname] = { collections: collections };
            }

            for (let db in dbdesstructransfomed) {
                let collections = dbdesstructransfomed[db].collections;

                if (mergestruc[db]) {
                    let mercoll = mergestruc[db].collections.map(item => item.name);
                    for (let j = 0; j < collections.length; j = j + 1) {
                        let colname = collections[j].name;
                        if (!mercoll.includes(colname)) {
                            mergestruc[db].collections.push({ name: colname, state: "" });
                        }
                    }
                } else {
                    mergestruc[db] = { collections: collections };
                }
            }

            // compare each origin structure with merge structre
            for (let db in mergestruc) {
                if (!dbsrcstructransfomed[db]) {

                    // new db
                    mergestruc[db].state = "new";
                }

                if (!dbdesstructransfomed[db]) {

                    // db has been deleted
                    mergestruc[db].state = "deleted";
                }

                if (dbsrcstructransfomed[db] && dbdesstructransfomed[db]) {

                    let mercoll = mergestruc[db].collections.map(item => item.name);
                    let srccoll = dbsrcstructransfomed[db].collections.map(item => item.name);
                    let descoll = dbdesstructransfomed[db].collections.map(item => item.name);

                    for (let i = 0; i < mercoll.length; i = i + 1) {
                        if (!srccoll.includes(mercoll[i])) {

                            // new collection
                            mergestruc[db].collections[i].state = "new";
                        }

                        if (!descoll.includes(mercoll[i])) {

                            // collection has been deleted
                            mergestruc[db].collections[i].state = "deleted";
                        }
                    }
                }
            }

            res.send({
                success: true,
                errorSet: [],
                data: mergestruc
            });
        })
    },

    getDescriptionFile: async function (req, res) {

        let { config } = connectionSingleton;
        let { name } = config;

        let pathToJSONFile = path.join(__dirname, "..", "metadata", `strc_${name}.json`);
        let pathToExcelFile = path.join(__dirname, "..", `strc_${name}.xlsx`);
        await utils.jsonToExcel(pathToJSONFile, pathToExcelFile);
        res.sendFile(pathToExcelFile, function () {
            fs.unlink(pathToExcelFile, function (err) {
                if (err) console.log(err.message);
            });
        });
    }
}

function geturl(params) {

    const {
        username,
        password,
        server,
        port,
        authentication
    } = params;

    let url = "";
    if (authentication) {
        url = 'mongodb://' + username + ':' + password + '@' + server + ':' + port + '/test?authMechanism=SCRAM-SHA-1&authSource=admin';
    } else {
        url = 'mongodb://' + server + ':' + port + '/test';
    }
    const urlEncoded = encodeURI(url);
    return urlEncoded;
}

async function getDatabaseStructure(url) {

    const client = await MongoClient.connect(url, {
        useNewUrlParser: true
    });

    // List all the available databases
    // Use the admin database for the operation
    const dbAdmin = client.db('admin');
    const admin = dbAdmin.admin();
    const databases = await admin.listDatabases();
    const dbset = databases.databases;

    // List all collections of each database
    for (let i = 0; i < dbset.length; i = i + 1) {

        let dbname = dbset[i].name;
        dbset[i].collections = [];

        let db = client.db(dbname);

        let collections = await db.listCollections().toArray();
        for (let j = 0; j < collections.length; j = j + 1) {
            dbset[i].collections.push({
                name: collections[j].name
            });
        }
    }

    return dbset;
}

