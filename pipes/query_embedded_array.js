const { GetRankedEmbeddingSearch } = require("embedding-search-node");
const {getEmbedding} = require("../utils/getEmbedding");
const {chunkText} = require("../utils/chunky");
const openai = require("../llms/openai").useOpenAI()

const SYSTEM_MESSAGE = (ctx)=>`You are a helpful assistant who will use the following information to help guide your answers. Information: ${ctx}`

const DEFAULT_QUERY_PARAMS = { 
    threshold: 0.75,
    n: 10
}
async function queryEmbeddedArray(queryString,source,options=DEFAULT_QUERY_PARAMS){
    const {embedding,error} = await getEmbedding(queryString);
    if(error) return {error}
    return GetRankedEmbeddingSearch(source,embedding,options.threshold,options.n)

}




/**
 * 
 * @param {string} input the message to ask the chat gpt model
 * @param {{[key:string]:any, text: string, embedding: {v: number[], m:number}}[]} data - the embedded items 
 * @param {{role:string,content:string}[]} messageHistory - optional array to track the chat history. 
 * @returns {Promise<{error:unknown}|{data: { messages: {role:string,content:string}[], answer: string}}>} a promise containing either an 'error' object or "data" object
 */
async function useDataForContext(input,data=[],messageHistory=[]){
    const contextPool = await queryEmbeddedArray(input,data,{
        threshold: 0.75, n: 10
    })
    const chunkyContext = chunkText(contextPool.map(i=>i.text).join("\n"),1000)
    const msgs = [
        {role:"system", content:SYSTEM_MESSAGE(chunkyContext[0])}, 
        ...messageHistory, 
        {role:"user",content: input},
    ]

    try {
        const response = await openai.createChatCompletion({
            messages: msgs,
            model: "gpt-3.5-turbo",
            temperature: 0.5,
        })
        msgs.push(response.data.choices[0].message)
        const data = {
            messages:msgs.slice(1), 
            answer: response.data.choices[0].message.content
        }
        return { data}
    } catch(error){
        return {error}
    }
    
}



module.exports = {queryEmbeddedArray,useDataForContext};

