import { logger } from "@f/logger";
import { ContentBlock, Message, TContentBlock, TMessage } from "@f/message";
import { APICallResult, Provider } from "@f/provider";
import OpenAI from "openai";

type CallModelParams = {
  client: OpenAI
  model: string
  messages: TMessage[]
} & Record<string, any>

function contentBlockToOpenAIFormat(contentBlock: TContentBlock) {
  if (contentBlock.type === 'text') {
    return {
      type: 'text',
      text: contentBlock.text
    }
  } else {
    return null
  }
}

function messageToOpenAIFormat(message: TMessage) {
  const openaiMessage = {
    role: message.role,
    content: message.content.map(c => contentBlockToOpenAIFormat(c)).filter(Boolean)
  }

  return openaiMessage
}

function OpenAIProvider() {
  const provider = Provider()
  function getClientType() {
    return OpenAI
  }

  async function callModel(params: CallModelParams): Promise<APICallResult> {
    const { client, model, messages, ...apiOptions } = params
    const apiParams: any = { ...apiOptions, model }
    const openaiMessages = messages.map(m => messageToOpenAIFormat(m))
    apiParams.messages = openaiMessages

    let response
    response = await client.chat.completions.create(apiParams)

    // logger.json(response)

    return {
      response,
      callParams: apiParams
    }
  }

  async function processResponse(callResult: APICallResult) {
    // logger.json(callResult)
    const messages: TMessage[] = []
    const response = Array.isArray(callResult) ? callResult[0].response : callResult.response

    for (const choice of response.choices) {
      const {message} = choice
      // logger.json(message)
      const content = []
      if (message.refusal) {
        throw new Error(message.refusal)
      }
      if (message.content) {
        content.push(ContentBlock({ text: message.content }))
      }
      messages.push(Message(message.role, content))
    }

    return messages
  }

  // "abstract class" implementation
  return Object.assign(provider, {
    getClientType,
    callModel,
    processResponse
  })
}

export const openAIProvider = OpenAIProvider()