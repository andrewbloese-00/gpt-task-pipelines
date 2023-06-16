const openai = require("../llms/openai").useOpenAI()

const { smartVector } = require("embedding-search-node")
async function getEmbedding(text){
    try {
        const response = await openai.createEmbedding({
            input: text,
            model: "text-embedding-ada-002"
        })
        const embedding = smartVector(response.data.data[0].embedding)
        return { embedding}
    } catch (error) {
        return {error}
    }
}

module.exports = {getEmbedding}
