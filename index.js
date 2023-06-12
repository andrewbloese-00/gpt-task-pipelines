//utils 
const { chunkText } = require("./utils/chunky")
const { countTokens } = require("./utils/countTokens")
const { getEmbedding }  = require("./utils/getEmbedding")
const { jsToJson } = require("./utils/writeJson.js")
const { jsonToJs } =require("./utils/readJson.js")

//llms
const  { useOpenAI } = require("./llms/openai")

//pipelines
const { embedArray} = require("./pipes/embed_array")
const { embedJSON} = require("./pipes/embed_json")
const { getFolderEmbeddings } = require("./pipes/folder_text_to_embedding")
const {  embedTextFile } = require("./pipes/textfile_to_embedded_array")

exports.utils = { 
    chunkText,
    countTokens,
    getEmbedding,
    jsToJson,jsonToJs
}

exports.llms = { 
    useOpenAI,
}



exports.pipelines = {
    embedArray,embedJSON,embedTextFile,getFolderEmbeddings
    
}