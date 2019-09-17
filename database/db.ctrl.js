const connectionSingleton = require("../connectionSingleton");
const util = require('util');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const execAsync = util.promisify(exec);
const writeFileAsync = util.promisify(fs.writeFile);
const utils = require('../utils');
module.exports = {

    getDatabaseInfo: async function (req, res) {

        let { dbname } = req.query;
        let client = connectionSingleton.connection;
        let config = connectionSingleton.config;

        let db = client.db(dbname);
        let data = await db.stats();

        // get stats
        let stats = {
            dbname: data.db,
            avgObjSize: utils.bytesToSize(data.avgObjSize || 0),
            collections: data.collections,
            dataFileVersion: (data.dataFileVersion && data.dataFileVersion.major && data.dataFileVersion.minor ?
                data.dataFileVersion.major + '.' + data.dataFileVersion.minor :
                null),
            dataSize: utils.bytesToSize(data.dataSize),
            extentFreeListNum: (data.extentFreeList && data.extentFreeList.num ? data.extentFreeList.num : null),
            fileSize: (typeof data.fileSize !== 'undefined' ? utils.bytesToSize(data.fileSize) : null),
            indexes: data.indexes,
            indexSize: utils.bytesToSize(data.indexSize),
            numExtents: data.numExtents.toString(),
            objects: data.objects,
            storageSize: utils.bytesToSize(data.storageSize),
        }

        // get collection set
        let collections = await db.listCollections().toArray();

        // get the structure of each collection
        // first, get info from json file, if info doesnt exist, use variety command to get db structure
        let jsonFileName = `strc_${config.name}.json`;
        let jsonFilePath = path.join(__dirname, "..", "metadata", jsonFileName);
        let jsonData = await getFile(jsonFilePath);

        if (jsonData && jsonData[dbname]) {

            // structure information of database exist in json file
            for (let i = 0; i < collections.length; i = i + 1) {
                let colname = collections[i].name;
                collections[i].schema = jsonData[dbname][colname];
            }
        } else {

            // structure information of current database doesn't exist, get by command and save to JSON file
            if (!jsonData) jsonData = {};
            if (!jsonData[dbname]) jsonData[dbname] = {};

            for (let i = 0; i < collections.length; i = i + 1) {
                let name = collections[i].name;
                let params = { ...config, db: dbname, collection: name };
                let data = await getSchema(params);
                let schema = data.map(item => {
                    return {

                        attribute: item._id.key,
                        types: item.value.types,
                        totalOccurrences: item.totalOccurrences,
                        percentContaining: item.percentContaining,

                        // user-edit information
                        description: "",
                        business_rule: "",
                    }
                });
                collections[i].schema = schema;

                // write to object
                jsonData[dbname][name] = schema;
            }

            // write object to file
            const jsonString = JSON.stringify(jsonData);
            await writeFileAsync(jsonFilePath, jsonString);
        }
        res.send({
            success: true,
            errorSet: [],
            data: { stats, collections },
        })
    },

    saveDatabaseInfo: async function (req, res) {

        let { dbname, collections } = req.body;
        let client = connectionSingleton.connection;
        let config = connectionSingleton.config;

        let jsonFileName = `strc_${config.name}.json`;
        let jsonFilePath = path.join(__dirname, "..", "metadata", jsonFileName);
        let jsonData = await getFile(jsonFilePath);

        for (let i = 0; i < collections.length; i = i + 1) {
            let schema = collections[i].schema;
            let colname = collections[i].name;
            jsonData[dbname][colname] = schema;
        }
        // write object to file
        const jsonString = JSON.stringify(jsonData);
        await writeFileAsync(jsonFilePath, jsonString);

        let db = client.db(dbname);
        let data = await db.stats();

        // get stats
        let stats = {
            dbname: data.db,
            avgObjSize: utils.bytesToSize(data.avgObjSize || 0),
            collections: data.collections,
            dataFileVersion: (data.dataFileVersion && data.dataFileVersion.major && data.dataFileVersion.minor ?
                data.dataFileVersion.major + '.' + data.dataFileVersion.minor :
                null),
            dataSize: utils.bytesToSize(data.dataSize),
            extentFreeListNum: (data.extentFreeList && data.extentFreeList.num ? data.extentFreeList.num : null),
            fileSize: (typeof data.fileSize !== 'undefined' ? utils.bytesToSize(data.fileSize) : null),
            indexes: data.indexes,
            indexSize: utils.bytesToSize(data.indexSize),
            numExtents: data.numExtents.toString(),
            objects: data.objects,
            storageSize: utils.bytesToSize(data.storageSize),
        }

        res.send({
            success: true,
            errorSet: [],
            data: { stats, collections }
        })
    }
}

async function getSchema(params) {

    let { username, password, authentication, server, port, db, collection } = params;

    // validate params

    // get collection structure
    let statement = "";
    if (authentication) {

        statement = `variety ${db}/${collection} --host ${server} --port ${port} --username ${username} --password ${password} --quiet --authenticationDatabase admin --outputFormat="json"`;
    } else {
        statement = `variety ${db}/${collection} --host ${server} --port ${port}  --quiet  --outputFormat="json"`;
    }

    let output = await execAsync(statement);
    let result = output.stdout.trim();
    result = JSON.parse(result);
    return result;

}

function getFile(path) {
    return new Promise(function (resolve, reject) {
        fs.access(path, (err) => {
            if (err) resolve(null);
            else resolve(require(path));
        });
    });
}