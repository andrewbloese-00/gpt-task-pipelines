const countTokens = require("./countTokens")

function chunkText(text,tokensPerChunk=100){
    let chunks = []
    let lines = text.split("\n").filter(self=>!!self)
    let chunk = ""
    for(let line of lines){
        if(countTokens(chunk) +  countTokens(line) < tokensPerChunk){
            chunk += line + " "
        } else {
            chunk += " "
            chunks.push(chunk)
            chunk = ""
        }
    }
    if(chunk.length > 0){
        chunks.push(chunk)
    }
    return chunks
}
module.exports = {chunkText}


