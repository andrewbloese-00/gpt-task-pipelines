const { Configuration , OpenAIApi} = require("openai")
const { OPENAI_KEY} = require("../config.json")
const cfg = new Configuration({apiKey: OPENAI_KEY})
/**
 * @about loads instance of OpenAIApi
 * @note call like "const openai = require('path/to/openai.js')()"
 * @returns {OpenAIApi}
 */
const useOpenAI = function _loadAi(){
    if(!useOpenAI.client){
        useOpenAI.client = new OpenAIApi(cfg)
    } 
    return useOpenAI.client
}
module.exports = {useOpenAI}