const fs = require('fs')
const getEmbedding = require("../utils/getEmbedding")
const embedJSON = async function ( jsonArrayString, filename="embeddedJson.json" ){
    //get data array from json string
    let data = JSON.parse(jsonArrayString)
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

    //write the new string to json file of 'filename
    let newString = JSON.stringify(data,null,4)
    fs.writeFileSync(filename,newString)    
    //returns the updated data array
    return data
}

module.exports = {embedJSON}