import { Provider } from "../provider";
import { registerProvider } from "../configurator"
import OpenAI from 'openai'
import { Message } from "@/types";

class _OpenAIProvider implements Provider {
  // TODO

  getClientType() {
    return OpenAI
  }

  contentBlockToOpenAIFormat(contentBlock) {
    // TODO
    return contentBlock
  }

  messageToOpenAIFormat(message: Message) {
    const openaiMessage = {
      role: message.role,
      content: message.content // TODO
    }

    return openaiMessage
  }

  async callModel(client:OpenAI, model, messages:Array<Message>, apiParams) {
    const finalCallParams = {...apiParams}
    const openaiMessages = messages.map(message => OpenAIProvider.messageToOpenAIFormat(message))
    const actualN = apiParams || 1
    finalCallParams.model = model
    finalCallParams.messages = openaiMessages

    let response

    response = await client.chat.completions.create(finalCallParams)

    return {
      response,
      actualN,
      finalCallParams
    }
  }

  async processResponse(callResult) {
    const apiParams = callResult.finalCallParams
    const response = callResult.response
    console.log(response);

    const trackedResults: Array<Message> = []
    let metadata = {}

    // TODO handle streaming
    for (const choice of response.choices) {
      trackedResults.push(new Message(choice.message.role, choice.message.content))
    }

    return [trackedResults, metadata]
  }
}

const OpenAIProvider = new _OpenAIProvider()

registerProvider(OpenAIProvider)