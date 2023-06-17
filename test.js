const rl = require('readline')

const readline = rl.createInterface({input: process.stdin, output: process.stdout})
const prompt =(text ) => new Promise((resolve, reject) =>{
    readline.question(text,answer=>resolve(answer))
})
const { pipelines, utils} = require("./index")
const { MONGO_CONNECTION_STRING } = require("./config.json")
const { embedArray } = require('./pipes/embed_array')
const VERBOSE = true
const MENU = "Enter A Test Number (0-13) or -1 to quit\n > "



const inputData = [{text: "Hello World", code: 10,}, { text: "This is a test case", code: 15,}, { text: "Goodbye Now!", code: 12}]
const inputDataString = JSON.stringify(inputData, null, 4)
const path_to_folder= `${__dirname}/textfiles/`, path_to_file=`${__dirname}/textfiles/text2.txt`;
const outfile_path_json = `${__dirname}/OutputTest.json`
const tokens_per_chunk = 150
const davinci_prompt = "Write 'this is a test for the davinci instructions' "
const text_to_chunk = `Abundant worldwide, most fungi are inconspicuous because of the small size of their structures, and their cryptic lifestyles in soil or on dead matter.
Fungi include symbionts of plants, animals, or other fungi and also parasites. They may become noticeable when fruiting, either as mushrooms or as molds. Fungi perform an essential 
role in the decomposition of organic matter and have fundamental roles in nutrient cycling and exchange in the environment. They have long been used as a direct source of human food, 
in the form of mushrooms and truffles; as a leavening agent for bread; and in the fermentation of various food products, such as wine, beer, and soy sauce. Since the 1940s, fungi have
been used for the production of antibiotics, and, more recently, various enzymes produced by fungi are used industrially and in detergents. 
Fungi are also used as biological pesticides to control weeds, plant diseases, and insect pests. Many species produce bioactive compounds called mycotoxins, such as alkaloids and polyketides,
that are toxic to animals, including humans. The fruiting structures of a few species contain psychotropic compounds and are consumed recreationally or in traditional spiritual ceremonies.
Fungi can break down manufactured materials and buildings, and become significant pathogens of humans and other animals. Losses of crops due to fungal diseases (e.g., rice blast disease) or 
food spoilage can have a large impact on human food supplies and local economies. The fungus kingdom encompasses an enormous diversity of taxa with varied ecologies, life cycle strategies,
and morphologies ranging from unicellular aquatic chytrids to large mushrooms. However, little is known of the true biodiversity of the fungus kingdom, which has been estimated at 2.2 million
to 3.8 million species.[5] Of these, only about 148,000 have been described,[6] with over 8,000 species known to be detrimental to plants and at least 300 that can be pathogenic to humans.[7]
Ever since the pioneering 18th and 19th century taxonomical works of Carl Linnaeus, Christiaan Hendrik Persoon, and Elias Magnus Fries, fungi have been classified according to their morphology
(e.g., characteristics such as spore color or microscopic features) or physiology. Advances in molecular genetics have opened the way for DNA analysis to be incorporated into taxonomy, which 
has sometimes challenged the historical groupings based on morphology and other traits. Phylogenetic studies published in the first decade of the 21st century have helped reshape the classification
within the fungi kingdom, which is divided into one subkingdom, seven phyla, and ten subphyla.`

const collection_name = "new_test"






async function run(mode){
    let src = utils.chunkText(text_to_chunk,50 ).map(chunk=>({text:chunk}))
    await embedArray(src)
    let needsCleanup = false
    switch(mode){
        case -1: {
            process.exit(0)
        }
        case 0: {//test embedd array
        var testData = [...inputData]
        const {time} = await timeAsync(pipelines.embedArray,testData)
        console.log(`Embedded Array of Length ${testData.length} in ${time}ms`)
        break;}
        case 1: {//test embed json
        needsCleanup = true
        const { time, result } = await timeAsync(pipelines.embedJSON,inputDataString,null,outfile_path_json) 
        if(result.error){
            console.warn("Failed to embed JSON string")
            console.error(result.error)
        } else { 
            console.log(`Embedded JSON string without file in ${time}ms`)
            if(VERBOSE){console.log("Result:" , result)}
            
        }
        break;}
        case 2: {// test folder to embedding array
        const { time, result } = await timeAsync(pipelines.getFolderEmbeddings,path_to_folder,tokens_per_chunk)
        console.log(result)
        console.log(`Embedded text in directory "${path_to_folder}" in ${time}ms`)
        // console.log(`Missed ${misses.length}`)
        // console.log(`Created ${chunks.length} chunks`)
        if(VERBOSE){
            console.log('Chunks Embedded: ')
            console.log(result)
        }
        

        break;}
        case 3: {//test textfile to embedding array
            const { time, result} = await timeAsync(pipelines.embedTextFile,...[path_to_file,tokens_per_chunk,100])
            if(!result) { 
                console.warn("embedd file failed")
            }
            console.log(`Embedded text in file "${path_to_file}" in ${time}ms`)
            console.log(`Missed ${result.misses?.length}`)
            console.log(`Created ${result.chunks?.length} chunks`)
            if(VERBOSE){
                console.log('Chunks Embedded: ')
                console.log(result.chunks)
            }
        break;}
        case 4:{ // test create collection mongo
            const { time, result } = await timeAsync(pipelines.mongoCollectionFromFolder,MONGO_CONNECTION_STRING,collection_name,path_to_folder,tokens_per_chunk)
            console.log(`Created collection from directory "${path_to_folder}" in ${time}ms`)
            if(VERBOSE){
                console.log("Results")
                console.log(result)
            }
        break;}
        case 5: {//TODOtest embed collection mongo
            const {time,result} = await timeAsync(pipelines.embedMongoDBCollection, MONGO_CONNECTION_STRING,collection_name)
            const {error,data}= result
            if(error){
                console.warn("Error embedding collection from mongodb")
                console.error(error)
            } else {
                console.log(`Embedded collection ${collection_name} in ${time}ms`)
                if(VERBOSE){
                    console.log("Results:")
                    console.log(data)
                }
            }
        break;}
        case 6: {//TODOtest  create collection firebase
        break;}
        case 7: {//TODOtest embed collection firebase
        break;}
        case 8: {//TODOtest create collection supabase
        break;}
        case 9: {//test embed collection supabase
        break;}
        case 10: {//test countTokens
            console.log('Running Count Tokens')
            const { time, result }= timeSync(utils.countTokens,text_to_chunk)
            console.log(`Counted tokens in text in ${time}ms`)
            if(VERBOSE){
                console.log('# tokens = ',result)
            }
        break;}
        case 11: {//test chunk text
            
            const { time , result } = timeSync(utils.chunkText,text_to_chunk,tokens_per_chunk)
            console.log(`Chunked text of initial length ${text_to_chunk.length} characters into chunks of ${tokens_per_chunk} in ${time}ms` )
            console.log(`# of Chunks: ${result.length}`);
            if(VERBOSE){
                console.log(`Result Chunks`)
                console.log(result)
            }
        break;}
        case 12: {//test get embedding
            const testText = "The quick brown fox jumped over the lazy dog"
            const { result , time } = await timeAsync(utils.getEmbedding,testText)
            if(result.error){
                console.warn("Embedding Utility Failed")
                console.error(result.error)
                
            } else { 
                console.log(`Created embedding using text-embedding-ada-002 in ${time}ms`)
                if(VERBOSE){
                    console.log("Embedding Result")
                    console.log(result.embedding)
                }
            }
        break;}
        case 13: {//test davinci instruction
            const {result, time } = await timeAsync(utils.davinciInstruct, davinci_prompt)
            const { error, data } = result 
            if(error){
                console.warn("Davinci Instruction Failed")
                console.error(error)
            } else { 
                console.log(`Completed Davinci Instruction in ${time}ms`)
                if(VERBOSE){
                    console.log("Davinci Respsonse - ", data)
                }
            }

        break;}
        case 14: { //test query embedded array
            const queryOptions = {threshold: 0.75, n: 5}     
            const result = await pipelines.queryEmbeddedArray(
                "How many subphyla are in the fungi kingdom?", 
                src,
                queryOptions
                )
                console.log(result)
                break;
            }
        case 15: { //test useDataForContext completion pipeline. 
                let history =[]
                const {result,time} = await timeAsync(pipelines.useDataForContext,"How many subphyla are in the fungi kingdom?",src,history)
                console.log(`Created chat completion using embedding query on data in ${time}ms`)
                if(VERBOSE){console.log("Completion Results", result);}
            break;
        }

        default:break;
    }

    if(needsCleanup){
        cleanup()
    }




}
(async function main(){
    let input = await prompt(MENU)
    while(input >= 0){
        await run(Number(input))
        input = await prompt(MENU)
    }
    if(input < 0) process.exit(0)


})()

function cleanup(){

}


async function timeAsync(fn,...args){
    const s = performance.now()
    const result = await fn(...args)
    return { result, time: (performance.now()-s).toFixed(4)}
}

function timeSync(fn,...args){
    const s = performance.now()
    const result = fn(...args)
    return {result,time: (performance.now() - s).toFixed(4)};

}
