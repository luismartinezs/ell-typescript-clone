export function singletonDecorator<T extends any>(factoryFunction: () => T): { getInstance: () => T } {
  let instance: T | null = null

  return {
    getInstance() {
      if (!instance) {
        instance = factoryFunction()
      }
      return instance
    }
  }
}