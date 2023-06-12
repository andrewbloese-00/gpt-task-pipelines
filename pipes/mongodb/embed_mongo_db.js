const { getEmbedding } = require("../../utils/getEmbedding")
const mongoose = require("mongoose")
/**
 * 
 * @param {string} mongo_connection_string - your database connection string
 * @param {string} collection_name = the name of the collection to embedd fields for
 * @returns {*} an error message or the result of updating all valid documents in the specified db collection.
 */
async function embedMongoDBCollection(mongo_connection_string,collection_name){

    
    try {
        await mongoose.connect(mongo_connection_string)
    } catch (error) {
        console.warn("Failed to connect to MongoDB")
        return {error}
    }
    const DB = mongoose.connection.db;
    
    const initialDocuments = await DB.collection(collection_name).find()
    let documentArray = await initialDocuments.toArray()
    let updates = []

    for(let i = 0; i < documentArray.length; i++){
        if( !documentArray[i].text)continue
        const { embedding, error  }=  await getEmbedding(documentArray[i].text)
        if(error) continue
        //update
        updates.push(
            mongoose.connection.db.collection(collection_name).updateOne(
                {_id: documentArray[i]._id},
                {embedding:embedding}
            )
        )

    }
    let n = updates.length;
    try {
        const results = await Promise.all(updates);
        console.log("Embedded " + n + " documents. ")
        return { data: results }
    } catch (error) {
        console.warn("Pipeline failed")
        console.error(error)
        return {error}
    }

    


}
module.exports = {embedMongoDBCollection}