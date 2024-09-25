import { Provider } from "../provider";
import { registerProvider } from "../configurator"
import OpenAI from 'openai'
import { ContentBlock, Message, ToolCall } from "@/types";
import { zodFunction, zodResponseFormat } from "openai/helpers/zod.mjs";

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
    if (contentBlock.image) {
      return {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${contentBlock.image.toString('base64')}`
        }
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

  async callModel(client: OpenAI, model, messages: Array<Message>, apiParams, tools) {
    const finalCallParams = { ...apiParams }
    const openaiMessages = messages.map(message => OpenAIProvider.messageToOpenAIFormat(message))
    const actualN = apiParams.n || 1
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
      if (tools) {
        finalCallParams.tool_choice = 'auto'
        finalCallParams.tools = tools.map(tool => {
          // TODO this assumes that the tool is provided as a zod schema
          const toolDefinition = zodFunction({
            name: tool.__ell_tool_name__,
            parameters: tool.__ell_tool_input__,
            description: tool.__ell_tool_description__,
          })
          return toolDefinition
        })
      }
      response = await client.chat.completions.create(finalCallParams)
    }

    return {
      response,
      actualN,
      finalCallParams
    }
  }

  async processResponse(callResult, tools) {
    const apiParams = callResult.finalCallParams
    const response = callResult.response

    const trackedResults: Array<Message> = []
    let metadata = {}

    // TODO handle streaming
    for (const { message: choice } of response.choices) {
      const content = []
      if (choice.refusal) {
        throw new Error(choice.refusal)
      }
      if (apiParams.response_format) {
        content.push(new ContentBlock({ parsed: choice.parsed }))
      } else if (choice.content) {
        content.push(new ContentBlock({ text: choice.content }))
      }

      if (choice.tool_calls?.length) {
        if (!tools?.length) {
          throw new Error('Tools not provided, yet tool calls in response. Did you manually specify a tool spec without using ell.tool?')
        }

        for (const toolCall of choice.tool_calls) {
          const matchingTool = tools.find(tool => tool.__ell_tool_name__ === toolCall.function.name)
          if (matchingTool) {
            const params = JSON.parse(toolCall.function.arguments)
            content.push(
              new ContentBlock({
                tool_call: new ToolCall(
                  matchingTool,
                  toolCall.id,
                  params
                )
              }
              )
            )
          }
        }
      }

      trackedResults.push(new Message(choice.role, content))
    }

    return [trackedResults, metadata]
  }
}

const OpenAIProvider = new _OpenAIProvider()

registerProvider(OpenAIProvider)