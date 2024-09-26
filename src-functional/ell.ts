import { config } from './configurator'
import { logger } from './logger'
import { system, TMessage, user } from './message'

type Message = any
type Options = any
type LMPFn = (...args: any[]) => Promise<string | string[] | Message | Message[]>
type SimpleLMP = any

async function getModelClient(args: { model: string, client?: any }) {
  if (args.client) {
    return args.client
  }
  const [client, _fallback] = config.getClientFor(args.model)
  return client
}

function hasSystemPrompt(lmpoutput: any[]): Boolean {
  const first = lmpoutput[0]
  if (first.role !== 'system') {
    logger.warn('LMP output does not have system prompt. You might have forgotten to add it')
    return false
  }
  return true
}

function buildMessages(lmpoutput: string | any[]) {
  if (typeof lmpoutput === 'string') {
    return [
      system(config.defaultSystemPrompt),
      user(lmpoutput)
    ]
  }
  if (hasSystemPrompt(lmpoutput)) {
    return [system(config.defaultSystemPrompt), ...lmpoutput]
  }
  // we assume here that the lmpoutput already has system prompt
  return lmpoutput
}

function convertMultimodalResponseToString(response: TMessage | TMessage[]): string | string[] {
  // logger.json(response)
  if (Array.isArray(response)) {
    if (response.length === 1) {
      const content = response[0].content[0].text
      if (!content) {
        throw new Error('Content is undefined')
      }
      return content
    }
    return response.map((x) => {
      const content = x.content[0].text
      if (!content) {
        throw new Error('Content is undefined')
      }
      return content
    })
  }
  const content = response.content[0].text
  if (!content) {
    throw new Error('Content is undefined')
  }
  return content
}

export const simple = (options: Options, lmpfn: LMPFn) => {
  const wrapperFnc: SimpleLMP = async (...args: any[]) => {
    // call promptFnc
    const lmpoutput = await lmpfn(...args)
    // get model client
    const modelClient = await getModelClient(options)
    // get provider from client
    const provider = config.getProviderFor(modelClient)
    if (!provider) {
      throw new Error(`No provider found for model ${options.model} ${modelClient}`)
    }
    // build messages
    const messages = buildMessages(lmpoutput)
    // parse api options
    const apiOptions = {
      ...options,
    }
    // call provider.callModel
    const callResult = await provider.callModel({
      client: modelClient,
      model: options.model,
      messages,
      ...apiOptions
    })
    // process model response
    const result: TMessage[] = await provider.processResponse(callResult)
    // return
    return convertMultimodalResponseToString(result)
  }

  return wrapperFnc
}

export { init } from "./configurator"