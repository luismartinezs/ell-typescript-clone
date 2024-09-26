import { logger } from "./logger"
import { TMessage } from "./message"

export type APICallResult = {
  response: any
  callParams: Record<string, any>
}

export function Provider() {
  return {
    getClientType: () => {
      throw new Error('Not implemented')
    },
    callModel: (params: {
      client: any,
      model: string,
      messages: TMessage[],
    } & Record<string, any>): Promise<APICallResult> => {
      throw new Error('Not implemented')
    },
    processResponse: (callResult: APICallResult): TMessage[] => {
      throw new Error('Not implemented')
    }
  }
}