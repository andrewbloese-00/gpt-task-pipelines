const { useOpenAI} = require("../llms/openai")
const openai = useOpenAI()

const DEFAULT_DAVINCI = {
    temparature: 0.5,
    max_tokens: 500,

}

/**
 * 
 * @param {string} prompt the prompt to feed the davinci 3 model with 
 * @param {{temparature:number,max_tokens:number}} params - the model parameters. Default temperature is 0.5, and tokens is 500
 * @returns {Promise<{error?:any,data?:string}>} - an error response or reply text
 */
async function davinciInstruct(prompt, params=DEFAULT_DAVINCI){
    
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            prompt
        })
        const reply = response.data.choices[0].text
        return { data: reply}
    } catch (error) {
        return { error }
    }
}

module.exports = {davinciInstruct}