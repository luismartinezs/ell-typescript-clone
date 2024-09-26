export const logger = {
  json: (...args: Record<string, any>[]) => {
    console.log(JSON.stringify(args, null, 2))
  },
  // all other methods are proxied to console
  ...console
}