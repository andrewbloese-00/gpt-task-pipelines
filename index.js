//utils 
const { chunkText } = require("./utils/chunky")
const { countTokens } = require("./utils/countTokens")
const { getEmbedding }  = require("./utils/getEmbedding")
const { jsToJson } = require("./utils/writeJson.js")
const { jsonToJs } =require("./utils/readJson.js")
const { davinciInstruct } = require("./utils/davinci-instruction")
const { ChatManagerBasic  } = require("./utils/chatManager")

//llms
const  { useOpenAI } = require("./llms/openai")

//pipelines
const { embedArray} = require("./pipes/embed_array")
const { embedJSON} = require("./pipes/embed_json")
const { getFolderEmbeddings } = require("./pipes/folder_text_to_embedding")
const {  embedTextFile } = require("./pipes/textfile_to_embedded_array")
const { embedMongoDBCollection } = require("./pipes/mongodb/embed_mongo_db")
const { mongoCollectionFromFolder } = require("./pipes/mongodb/create_collection_from_folder_text")
const { queryEmbeddedArray, useDataForContext} = require('./pipes/query_embedded_array')

//export in groups

exports.utils = { 
    chunkText,
    countTokens,
    getEmbedding, //text-embedding-ada-002
    davinciInstruct,//text-davinci-003
    ChatManagerBasic, //gpt-3.5-turbo , gpt-4
    jsToJson,jsonToJs
}

exports.llms = { 
    useOpenAI,
}


exports.pipelines = {
    embedArray,
    embedJSON,
    embedTextFile,
    getFolderEmbeddings,
    embedMongoDBCollection,
    mongoCollectionFromFolder,
    queryEmbeddedArray,
    useDataForContext,

    
}