const fs = require('fs');
function jsToJson(filename,data){
    fs.writeFileSync(filename,JSON.stringify(data,null,4),{encoding: "utf-8"})
}
module.exports = {jsToJson}