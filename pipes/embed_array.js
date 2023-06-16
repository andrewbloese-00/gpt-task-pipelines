

const {getEmbedding} = require("../utils/getEmbedding")


/**
 * 
 * @param {*[]} array the array of objects to calculate embeddings for
 * @about the array passed is directly modified by appending the field 'embedding' on each element of the array
 * @important each element of the array must have a text field (eg. for x of array x.text != undefined)
 * 
 */
const embedArray = async function ( array ){
    //get data array from json string
    if (!(array instanceof Array)) return { error : "Must provide json of array"}
    //push embedding requests to the async jobs queue
    let jobs = [];
    for( let i = 0; i < array.length; i++){
        //exit on invalid input
        if(!array[i].text){return {error: "Invalid, Must have text field on all elements of data array"}}
        jobs.push(getEmbedding(array[i].text))
    }

    //wait for jobs to complete
    let doneJobs = await Promise.all(jobs)

    //use embedding results to transform original array
    for(let j = 0; j < doneJobs.length; j++){
        if(doneJobs[j].error) continue
        array[j]['embedding'] = doneJobs[j].embedding
    }   
    return { success: true}
    
}

module.exports = {embedArray}