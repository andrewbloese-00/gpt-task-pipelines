const fs = require('fs')
const {getEmbedding} = require("../utils/getEmbedding")
const { jsonToJs } = require('../utils/readJson')
/**
 * 
 * @param {string|null} jsonArrayString - optional string of JSON data to be embedded. 
 * @param {string|null} infile - optional, path to the json file to be embedded. 
 * @param {string|null} outfile - optional, if provided will write the embedded result to the specified file path. Can be used to overwrite infile
 * @returns 
 */
const embedJSON = async function ( jsonArrayString=null, infile=null, outfile=null,  ) {
    
    let data;
    if(infile){ //if infile specified then read from file
        data = jsonToJs(infile)
    } else { 
        if(!jsonArrayString) return { error: "Must provide an input json file or an input json string"}
        //get data array from json string
        data = JSON.parse(jsonArrayString)
    }
    
    if (!(data instanceof Array)) return { error : "Must provide json of array"}
    
    //push embedding requests to the async jobs queue
    let jobs = []
    for(let i = 0; i < data.length; i++){
        if(data[i].text){
            jobs.push(getEmbedding(data[i].text))
        }
    }

    //wait for jobs to complete
    let doneJobs = await Promise.all(jobs)

    //use embedding results to transform original array
    for(let j = 0; j < doneJobs.length; j++){
        if(doneJobs[j].error) continue
        data[j]['embedding'] = doneJobs[j].embedding
    }   

    //write the new string to json file of 'outfile' if present. 
    let newString = JSON.stringify(data,null,4)
    if(outfile){
        fs.writeFileSync(outfile,newString)    
    } 

    //return the string and the object array
    return { stringified: newString, data}
    

}

module.exports = {embedJSON}