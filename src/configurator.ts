import { OpenAI } from 'openai'

class Config {
  // add fields
  private registry = new Map()
  public defaultClient?: OpenAI
  public providers = new Map()
  constructor() {
    // TODO
  }

  registerModel(modelName: string, client) {
    this.registry.set(modelName, client)
  }

  getClientFor(modelName: string) {
    let client = this.registry.get(modelName)
    let fallback = false
    // TODO improve implementation
    // get client from registry based on modelName
    // if no client, set client to default and fallback to true
    return [client, fallback]
  }

  registerProvider(providerClass) {
    this.providers.set(providerClass.getClientType(), providerClass)
  }

  getProviderFor(client: OpenAI) {
    for (const [key, value] of this.providers.entries()) {
      if (client instanceof key) {
        return value
      }
    }
  }
}

export function init() {

}

export const config = new Config()

export const registerProvider = (providerClass) => config.registerProvider(providerClass)