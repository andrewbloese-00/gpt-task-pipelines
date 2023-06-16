const fs = require("fs")
const {chunkText} = require("../utils/chunky")
const {getEmbedding} = require("../utils/getEmbedding")
const {countTokens} = require("../utils/countTokens")

const wait = (ms) => new Promise(resolve=>{
    setTimeout(resolve, ms)
})
const MIN_MS = 60000, RATE_LIMIT = 250000;

/**
 * 
 * @param {number} max_chunk_limit - the maximum number of chunks to process from a file. default is Infinity, but values can be set to prevent overcharging openai account. 
 * @param {string} pathToTextFile - the path to file to read text using utf-8 encoding 
 * @param {number} tokensPerChunk - the number of tokens to split chunks by. (1 token is ≈ 4 characters)
 * @returns {Promise<{chunks:{text:string,embedding:{v:number[],m:number}}[], misses:[]}>} - an array of successfully read and embedded chunks, misses contains potentail errors. if all works properly then misses will just be an empty array
 */
const embedTextFile = async (pathToTextFile, tokensPerChunk, max_chunk_limit=Infinity) => {  
    //read
    const contents = fs.readFileSync(pathToTextFile,{encoding: 'utf8'})
    console.log(`counted : ${countTokens(contents)} tokens in contents of file` )
    //chunk
    let chunks = chunkText(contents,tokensPerChunk)
    //embed
    let n = Math.min(chunks.length, max_chunk_limit), tokensUsed = 0, misses= [];
    for(let c = 0; c < n; c++){ 
        let text = chunks[c]
        tokensUsed += tokensPerChunk
        //throttle and reset counter
        if(tokensUsed > RATE_LIMIT){ await wait(MIN_MS); tokensUsed = tokensPerChunk;}
        //embed
        const {embedding, error} = await getEmbedding(chunks[c])
        if(error) {
            //try if error was just a request limit error after waiting a minute
            await wait(MIN_MS)
            let tryAgain = await getEmbedding(chunks[c])
            if(tryAgain.error){
                misses.push([c,tryAgain.error])
                continue
            } else { 
                chunks[c] = {text,embedding:tryAgain.embedding}
            }
        }
        //no error just reassign chunk to its new 'text','embedding' form
        else { 
            chunks[c] = {text,embedding}
        }

    }
    
    return {chunks,misses}
}



module.exports = {embedTextFile}





