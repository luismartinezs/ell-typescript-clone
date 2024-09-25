import { Provider } from "../provider";
import { registerProvider } from "../configurator"
import OpenAI from 'openai'
import { ContentBlock, Message } from "@/types";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

class _OpenAIProvider implements Provider {
  // TODO

  getClientType() {
    return OpenAI
  }

  contentBlockToOpenAIFormat(contentBlock: ContentBlock) {
    if (contentBlock.text) {
      return {
        type: 'text',
        text: contentBlock.text
      }
    }
    return null
  }

  messageToOpenAIFormat(message: Message) {
    const openaiMessage = {
      role: message.role,
      content: message.content.map(c => OpenAIProvider.contentBlockToOpenAIFormat(c))
    }

    return openaiMessage
  }

  async callModel(client: OpenAI, model, messages: Array<Message>, apiParams, responseFormat) {
    const finalCallParams = { ...apiParams }
    const openaiMessages = messages.map(message => OpenAIProvider.messageToOpenAIFormat(message))
    const actualN = apiParams || 1
    finalCallParams.model = model
    finalCallParams.messages = openaiMessages

    let response

    if (finalCallParams.responseFormat) {
      // TODO check that responseFormat is a valid zod schema (it could be another schema definition)
      // TODO the model used is constrained when using zod schema, to gpt-4o-mini and gpt-4o https://platform.openai.com/docs/guides/structured-outputs/supported-models
      finalCallParams.response_format = zodResponseFormat(finalCallParams.responseFormat, "response")
      delete finalCallParams.responseFormat

      response = await client.beta.chat.completions.parse(finalCallParams)
    } else {
      response = await client.chat.completions.create(finalCallParams)
    }

    return {
      response,
      actualN,
      finalCallParams
    }
  }

  async processResponse(callResult) {
    const apiParams = callResult.finalCallParams
    const response = callResult.response

    const trackedResults: Array<Message> = []
    let metadata = {}

    // TODO handle streaming
    for (const choice of response.choices) {
      const content = []
      if (choice.refusal) {
        throw new Error(choice.refusal)
      }
      if (apiParams.response_format) {
        content.push(new ContentBlock({ parsed: choice.message.parsed }))
      } else if (choice.message.content) {
        content.push(new ContentBlock({ text: choice.message.content }))
      }

      trackedResults.push(new Message(choice.message.role, content))
    }

    return [trackedResults, metadata]
  }
}

const OpenAIProvider = new _OpenAIProvider()

registerProvider(OpenAIProvider)