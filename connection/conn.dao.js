const fs = require("fs");
const path = require("path");
const datafile = "../metadata/db.json";
const promisify = require('util').promisify;
const writeFileAsync = promisify(fs.writeFile);
module.exports = {


    getSet: function () {

        const data = require(datafile);
        return data;
    },

    save: async function (req) {


        const { name, params } = req;
        const data = require(datafile);

        data[name] = params;

        const jsonString = JSON.stringify(data);
        await writeFileAsync(path.join(__dirname, datafile), jsonString);

        return data;
    },


}
