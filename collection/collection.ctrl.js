const exec = require('child_process').exec;
const util = require('util');
const execAsync = util.promisify(exec);
module.exports = {


    getSchema: async function (req, res) {

        let { username, password, server, port, db, collection } = req.body;

        // validate params

        // get collection structure
        let statement = `variety ${db}/${collection} --host ${server} --port ${port} --username ${username} --password ${password} --quiet --authenticationDatabase admin --outputFormat="json"`;

        try {

            let output = await execAsync(statement);
            let result = output.stdout.trim();
            result = JSON.parse(result);

            res.send({
                success: true,
                errorSet: [],
                data: result
            });
        } catch (e) {
            console.error(e);
        }

    }
}
