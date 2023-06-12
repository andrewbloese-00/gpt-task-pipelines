const fs = require('fs');
const { embedTextFile } = require("./textfile_to_embedded_array");
const path = require('path');


//helper to allow async syntax for readdir
const wrapped_readdir = (path,options={encoding: "utf-8"}) => new Promise((resolve,reject)=>{
    fs.readdir(path,(err,files)=>{
        if(err) { reject(err)}
        else { 
            console.log('files',files)
            resolve(files)
        }
    })
})


/**
 * 
 * @param {string} folderPath - the path to the folder of files to embed 
 * @param {number} tokensPerChunk - the number of tokens per chunk (default 200)
 * @returns {Promise<{chunks:[{text:string,embedding: {v:number[],m:number}}],misses:[]}>}
 */
const getFolderEmbeddings = async (folderPath,tokensPerChunk=200) => { 
    //get the files names in folder
    const files = await wrapped_readdir(folderPath)
    let jobs = []
    for(let filename of files ){ 
        jobs.push(embedTextFile(path.join(folderPath,filename), tokensPerChunk))
    }
    
    const completed = await Promise.all(jobs);
    //merge the results
    let chunks= [], misses = []
    for(let completedJob of completed){
        for(let missedJob of completedJob.misses){
            misses.push(missedJob)
        }
        for(let successJob of completedJob.chunks){
            chunks.push(successJob)
        }
    }
    
    //return the joined results
    return { chunks, misses}


}

module.exports = {getFolderEmbeddings}