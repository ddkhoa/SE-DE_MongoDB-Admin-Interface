const MongoClient = require('mongodb').MongoClient;

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

module.exports = {

    connect: async function (params) {

        let { username, password, server, port, authentication, name } = params;
        // validate params

        // if all good connect to db and get info
        let url = geturl({ username, password, server, port, authentication });

        const client = await MongoClient.connect(url, {
            useNewUrlParser: true
        });

        // save the connection
        this.connection = client;
        this.config = { username, password, server, port, authentication, name };
    },

    // the connection will be established when the method connect is invoked
    connection: null,
    config: null,
}