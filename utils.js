var Excel = require('exceljs');
var fs = require('fs');

module.exports = {

    // Given some size in bytes, returns it in a converted, friendly size
    // credits: http://stackoverflow.com/users/1596799/aliceljm

    bytesToSize: function (bytes) {
        if (bytes === 0) return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        // determine the proper unit based on the size
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },

    jsonToExcel: async function (pathToJSONFile, pathToExcelFile) {

        var workbook = new Excel.Workbook();
        var dbstruc = require(pathToJSONFile);

        // push info files
        for (let dbname in dbstruc) {

            let db = dbstruc[dbname];
            for (let collname in db) {

                let collection = db[collname];
                let worksheet = workbook.addWorksheet(collname);

                worksheet.columns = [
                    { header: 'ATTRIBUTE', key: 'col', width: 32 },
                    { header: 'TYPE', key: 'type', width: 50 },
                    { header: 'DESCRIPTION', key: 'des', width: 50 },
                    { header: 'BUSINESS RULE', key: 'br', width: 50 },
                    { header: 'PERCENT CONTAINING', key: 'pc', width: 5 },
                ];

                for (let i = 0; i < collection.length; i = i + 1) {
                    let { attribute, types, percentContaining, description, business_rule } = collection[i];
                    let type = "";
                    let type_items = [];
                    for (let key in types) {
                        type_items.push("Type: " + key + ". Documents: " + types[key]);
                    }
                    type = type_items.join(" \n");

                    worksheet.addRow([attribute, type, description, business_rule, percentContaining]);
                }
            }
        }

        // styling
        const fills = {
            header: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '006495ED' },
            },
        };

        const fonts = {
            header: {
                color: { argb: '00FFFFFF' },
                bold: true
            }
        }

        for (let i = 0; i < workbook.worksheets.length; i = i + 1) {
            workbook.worksheets[i].getRow(1).font = fonts.header;
            workbook.worksheets[i].getRow(1).fill = fills.header;
        };

        // write to file
        await workbook.xlsx.writeFile(pathToExcelFile);
        return;
    }
}