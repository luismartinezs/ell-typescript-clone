import OpenAI from "openai"
import { config } from "@/configurator"

const logger = console

export function register(client) {
  const modelData = [
    {
      modelId: 'gpt-4o-mini'
    },
    {
      modelId: 'gpt-4-vision-preview'
    }
  ]

  modelData.forEach(({ modelId }) => {
    config.registerModel(modelId, client)
  })
}

let defaultClient = null
try {
  defaultClient = new OpenAI()
} catch (e) {
  logger.error('Failed to create default OpenAI client:', e.message)
}

if (defaultClient) {
  register(defaultClient)
  config.defaultClient = defaultClient
}