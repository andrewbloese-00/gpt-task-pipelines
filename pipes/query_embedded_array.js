const { GetRankedEmbeddingSearch } = require("embedding-search-node");
const getEmbedding = require("../utils/getEmbedding");
const chunkText = require("../utils/chunky");
const openai = require("../llms/openai")()

const SYSTEM_MESSAGE = (ctx)=>`You are a helpful assistant who will use the following information to help guide your answers. Information: ${ctx}`

const DEFAULT_QUERY_PARAMS = { 
    threshold: 0.75,
    n: 10
}
async function queryEmbeddedArray(queryString,source,options=DEFAULT_QUERY_PARAMS){
    const queryVector = await getEmbedding(queryString);
    const ranked = GetRankedEmbeddingSearch(source,queryVector,options.threshold,options.n)
    return ranked.filter(i=>!!i).map(([score,idx])=>source[idx])

}



async function useDataForContext(input,messageHistory=[],data=[]){
    const contextPool = await queryEmbeddedArray(input,data)
    const chunkyContext = chunkText(contextPool.map(i=>i.text).join("\n"),1000)
    const msgs = [
        {role:"system", content:SYSTEM_MESSAGE(chunkyContext[0])}, 
        ...messageHistory, 
        {role:"user",content: input},
    ]
    const response = await openai.createChatCompletion({
        messages: msgs,
        model: "gpt-3.5-turbo",
        temperature: 0.5,
    })
    msgs.push(response.data.choices[0].message)
    return {messages:msgs.slice(1), answer: response.data.choices[0].message.content}
    
}



module.exports = {queryEmbeddedArray,useDataForContext};

