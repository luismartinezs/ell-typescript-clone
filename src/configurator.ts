import { OpenAI } from 'openai'

class Config {
  // add fields
  private registry = new Map()
  public defaultClient?: OpenAI
  public providers = new Map()
  public store
  public autocommit: boolean = false
  public defaultSystemPrompt: string = 'You are a helpful AI assistant.'

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

  reset() {
    this.registry.clear()
    this.providers.clear()
    this.store = undefined
    this.defaultClient = undefined
    this.autocommit = false
    this.defaultSystemPrompt = 'You are a helpful AI assistant.'
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

  setStore(store, autocommit) {
    if (typeof store === 'string') {
      const SQLiteStore = require('./serialize/sql').SQLiteStore
      this.store = new SQLiteStore(store, autocommit)
    } else {
      this.store = store
    }
    this.autocommit = autocommit || this.autocommit
  }

  getStore() {
    return this.store
  }

  setDefaultSystemPrompt(prompt: string): void {
    this.defaultSystemPrompt = prompt
  }
}

export function init(options) {
  if (options.store) {
    config.setStore(options.store, options.autocommit)
  }

  if (options.defaultSystemPrompt) {
    config.setDefaultSystemPrompt(options.defaultSystemPrompt)
  }
}

export const config = new Config()


// Helper functions
export const getStore = () => config.getStore()
export const setStore = (store, autocommit?: boolean) => config.setStore(store, autocommit)
export const setDefaultSystemPrompt = (prompt: string) => config.setDefaultSystemPrompt(prompt)
export const registerProvider = (providerClass) => config.registerProvider(providerClass)
export const getProviderFor = (client) => config.getProviderFor(client)