import { config } from '@f/configurator'
import { logger } from '@f/logger'
import { OpenAI } from 'openai'

interface ModelData {
  modelId: string
  ownedBy: string // what is this?
}

export function register(client:OpenAI) {
  const modelData: ModelData[] = [
    { modelId: 'gpt-4-1106-preview', ownedBy: 'system' },
    { modelId: 'gpt-4-32k-0314', ownedBy: 'openai' },
    { modelId: 'text-embedding-3-large', ownedBy: 'system' },
    { modelId: 'gpt-4-0125-preview', ownedBy: 'system' },
    { modelId: 'babbage-002', ownedBy: 'system' },
    { modelId: 'gpt-4-turbo-preview', ownedBy: 'system' },
    { modelId: 'gpt-4o', ownedBy: 'system' },
    { modelId: 'gpt-4o-2024-05-13', ownedBy: 'system' },
    { modelId: 'gpt-4o-mini-2024-07-18', ownedBy: 'system' },
    { modelId: 'gpt-4o-mini', ownedBy: 'system' },
    { modelId: 'gpt-4o-2024-08-06', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-0301', ownedBy: 'openai' },
    { modelId: 'gpt-3.5-turbo-0613', ownedBy: 'openai' },
    { modelId: 'tts-1', ownedBy: 'openai-internal' },
    { modelId: 'gpt-3.5-turbo', ownedBy: 'openai' },
    { modelId: 'gpt-3.5-turbo-16k', ownedBy: 'openai-internal' },
    { modelId: 'davinci-002', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-16k-0613', ownedBy: 'openai' },
    { modelId: 'gpt-4-turbo-2024-04-09', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-0125', ownedBy: 'system' },
    { modelId: 'gpt-4-turbo', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-1106', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-instruct-0914', ownedBy: 'system' },
    { modelId: 'gpt-3.5-turbo-instruct', ownedBy: 'system' },
    { modelId: 'gpt-4-0613', ownedBy: 'openai' },
    { modelId: 'gpt-4', ownedBy: 'openai' },
    { modelId: 'gpt-4-0314', ownedBy: 'openai' },
    { modelId: 'o1-preview', ownedBy: 'system' },
    { modelId: 'o1-mini', ownedBy: 'system' },
  ]

  modelData.forEach(({ modelId, ownedBy }) => {
    config.registerModel(modelId, client)
  })
}

export function registerOpenaiAsDefaultClient() {
  let defaultClient = null
  try {
    defaultClient = new OpenAI()
  } catch (e) {
    logger.error('Failed to create default OpenAI client:', e.message)
  }

  if (defaultClient) {
    register(defaultClient)
  }
}