const { countTokens } = require("./countTokens")
const { useOpenAI}= require("../llms/openai")
const GPT_TURBO_CAP=8000
const GPT_4_CAP = 9000

const openai = useOpenAI()
class ChatManagerBasic { 
    static GPT_TURBO = "gpt-3.5-turbo"
    static GPT_4 = "gpt-4"
    static DEFAULT_MESSAGE="You are a helpful AI assistant who will answer the user questions"
    
    /**
     * 
     * @param {string} model - the model to use for chat completions. Either 'gpt-3.5-turbo' or 'gpt-4'
     * @param {string} sysMessage the system message to use to prompt chat completions messages.  
     */
    constructor(model,sysMessage){
        this.history = []
        this.messages = [{content: sysMessage, role: "system"}]
        this.model = model
    }
    spliceNumber(){
        return Math.floor((this.messages.length-2) / 2)
    }
    currentTokens(){
        let text = this.messages.map(msg=>msg.content).join(" ")
        return countTokens(text)
    }
    async userChat(message){

        //insert new
        this.messages.push({content:message,role: "user"})
        //capcacity check 
        if(this.model === ChatManagerBasic.GPT_TURBO){ 
            if(this.currentTokens() > GPT_TURBO_CAP){//flush if over cap
                this.history.push(...this.messages.splice(1,this.spliceNumber()))
            }
        }        
        else if(this.model === ChatManagerBasic.GPT_4) {
            if(this.currentTokens() > GPT_4_CAP){
                this.history.push(...this.messages.splice(1,this.spliceNumber()))
            }
        }

        if(!this.messages.at(-1).content === message){//ensure latest is user message
            this.messages.push({content:message, role: "user"})
        }

        
        try {
            //after flush we can do the completion 
            const response = await openai.createChatCompletion({
                model: this.model,
                temperature: 0.5, 
                messages: this.messages
            })

            const msg = response.data.choices[0].message
            //insert completion message into the message pool
            this.messages.push(msg)
            return { data: msg.content}    
        } catch (error) {
            return { error }
        }

    }




}

module.exports = {ChatManagerBasic}