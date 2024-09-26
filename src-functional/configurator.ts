import { logger } from "./logger"
import OpenAI from 'openai'
import { singletonDecorator } from "./utils"
import { openAIProvider } from "./providers/openai";
import { register } from "./models/openai";

function createConfig() {
  const _registry = new Map()
  let defaultClient = new OpenAI();
  let defaultModel = 'gpt-4o-mini'
  const providers = new Map()
  let defaultSystemPrompt = 'You are a helpful AI assistant'

  function registerModel(modelName: string, client: any) {
    _registry.set(modelName, client)
  }

  function getClientFor(modelName: string) {
    let client = _registry.get(modelName)
    let fallback = false

    if (!client) {
      const warningMessage = `Warning: A default provider for model '${modelName}' could not be found. Falling back to default OpenAI client from environment variables.`
      logger.debug(warningMessage)
      client = defaultClient
      fallback = true
    }

    return [client, fallback]
  }

  function registerProvider(providerClass: any) {
    providers.set(providerClass.getClientType(), providerClass)
  }

  function getProviderFor(client: any) {
    for (const [key, value] of providers.entries()) {
      if (client instanceof key) {
        return value
      }
    }
  }

  function registerDefaultClient(APIClient: any, registerFnc: (client: any) => void) {
    let defaultClient = null
    try {
      defaultClient = new APIClient()
    } catch (e) {
      logger.error('Failed to create default OpenAI client:', e.message)
    }

    if (defaultClient) {
      registerFnc(defaultClient)
    }
  }

  return {
    getClientFor,
    registerModel,
    getProviderFor,
    registerProvider,
    registerDefaultClient,
    defaultClient,
    defaultModel,
    defaultSystemPrompt
  }
}

export const config = singletonDecorator(createConfig).getInstance()
config.registerProvider(openAIProvider)
config.registerDefaultClient(OpenAI, register)

export const init = (options: any) => {

}