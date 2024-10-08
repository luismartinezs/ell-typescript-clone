import './providers/openai'
import './models/openai'

import { config } from './configurator'
import { Message } from './types'

import { user, system, assistant } from './types'

const getModelClient = (args) => {
  if (args.client) {
    return args.client
  }
  const [client, _fallback] = config.getClientFor(args.model)
  return client
}

function convertMultimodalResponseToString(response): string | Array<string> {
  if (Array.isArray(response)) {
    if (response.length === 1) {
      return response[0].content[0].text
    }
    return response.map((x) => x.content[0].text)
  }
  return response.content[0].text
}

type SimpleLMPInner = (...args: any[]) => Promise<string | Array<Message>>

export const simple = <PromptFnc extends SimpleLMPInner>(options: Record<string, unknown>, promptFnc: PromptFnc) => {
  // TODO add logger
  // TODO add tracking
  // return function that takes prompt and calls LLM
  const wrapper = async (...args) => {
    // call lmpf
    const lmpfnOutput = await promptFnc(...args)
    // get model client
    const modelClient = await getModelClient(options)
    // get client provider
    const provider = config.getProviderFor(modelClient)
    if (!provider) {
      throw new Error(`No provider found for model ${options.model} ${modelClient}`)
    }
    // get messages from args
    const messages = typeof lmpfnOutput === 'string' ? [
      system(config.defaultSystemPrompt),
      user(lmpfnOutput)
    ] : lmpfnOutput
    // model api params from args
    const apiParams = { ...options }
    // call model
    const callResult = await provider.callModel(modelClient, options.model, messages, apiParams)
    // parse model response and return i
    const [trackedResults, metadata] = await provider.processResponse(callResult)
    const result = convertMultimodalResponseToString(trackedResults)
    return result
  }
  return wrapper
}

export const complex = <PromptFnc extends SimpleLMPInner>(options: Record<string, unknown>, promptFnc: PromptFnc) => {
  // TODO add logger
  // TODO add tracking
  // return function that takes prompt and calls LLM
  const wrapper = async (...args) => {
    // call lmpf
    const lmpfnOutput = await promptFnc(...args)
    // get model client
    const modelClient = await getModelClient(options)
    // get client provider
    const provider = config.getProviderFor(modelClient)
    if (!provider) {
      throw new Error(`No provider found for model ${options.model} ${modelClient}`)
    }
    // get messages from args
    const messages = typeof lmpfnOutput === 'string' ? [new Message('user', lmpfnOutput)] : lmpfnOutput
    // model api params from args
    const apiParams = { ...options }
    // call model
    const callResult = await provider.callModel(modelClient, options.model, messages, apiParams, options.tools)
    // console.log(JSON.stringify(callResult, null, 2));

    // parse model response and return i
    const [trackedResults, metadata] = await provider.processResponse(callResult, options.tools)
    // console.log(JSON.stringify(trackedResults, null, 2));

    return trackedResults.length === 1 ? trackedResults[0] : trackedResults
  }
  return wrapper
}


export { init } from './configurator'
export { user, system, assistant }