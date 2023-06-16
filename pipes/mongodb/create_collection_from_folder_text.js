const mongoose = require("mongoose");
const { getFolderEmbeddings } = require("../folder_text_to_embedding")



/**
 * 
 * @param {string} connectionString - the connection string to connect to mongodb atlas
 * @param {string} collectionName - the name of the collection to insert to or create
 * @param {string} pathToFolder - the path to the folder of text to upload into the collection
 * @param {number} tokensPerDoc - how many tokens present per document -> translates to the tokens per chunk of total text
 */
async function mongoCollectionFromFolder(connectionString,collectionName,pathToFolder,tokensPerDoc=256){


    try {
        await mongoose.connect(connectionString)
        const DB = mongoose.connection.db

    
        const { chunks } = await getFolderEmbeddings(pathToFolder,tokensPerDoc)
    
        const insertResult = await DB.collection(collectionName).insertMany(chunks)
        console.log(insertResult.insertedCount + " documents were inserted into collection '" + collectionName + "'")
        return { data: insertResult}
    
    } catch (error) {
        console.warn("Failed to connect to mongodb");
        return {error}
    }

    

}

module.exports = {mongoCollectionFromFolder}