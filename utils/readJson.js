const fs = require('fs');
/**
 * 
 * @param {string} jsonFilePath - path to json file to parse
 * @returns {*} the data parsed from json file in javascript format
 */
function jsonToJs(jsonFilePath){
    const content = fs.readFileSync(jsonFilePath,{encoding: 'utf8'});
    return JSON.parse(content)

}
module.exports = {jsonToJs}