const MongoClient = require('mongodb').MongoClient;
const dao = require("./conn.dao");
module.exports = {

    getSet: async function (req, res) {

        const conn_set = dao.getSet();
        res.send({
            success: true,
            errorSet: [],
            data: conn_set
        })
    },

    create: async function (req, res) {

        let { name, authentication, username, password, server, port } = req.body;

        // validate params

        // Test connection using MongoClient
        // let url = geturl({ authentication, username, password, server, port });

        // const client = await MongoClient.connect(url, {
        //     useNewUrlParser: true
        // });

        let params = { server, port, authentication };
        if (authentication) {
            params.username = username;
            params.password = password;
        }

        let reqSave = { name, params };

        const conn_set = await dao.save(reqSave);

        res.send({
            success: true,
            errorSet: [],
            data: conn_set
        });
    },



}

