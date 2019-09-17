const app = require("./app");
const clc = require('cli-color');
app.listen(80, function () {

    console.log("App is running on port 80");
})

    // Technical error handling
    .on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            console.log();
            console.error(clc.red('Address ' + addressString + ' already in use! You need to pick a different host and/or port.'));
            console.log('Maybe mongo-express is already running?');
        }

        console.log();
        console.log('If you are still having trouble, try Googling for the key parts of the following error object before posting an issue');
        console.log(JSON.stringify(e));
        return process.exit(1);
    });
