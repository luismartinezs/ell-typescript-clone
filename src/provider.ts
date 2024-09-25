import { Tool } from "./types/tools"

export interface APICallResult {
  response: any
  // actualStreaming: boolean
  actualN: number
  finalCallParams: Record<string, any>
}


export interface Provider {
  callModel(
    client: any,
    model: string,
    messages: any[],
    apiParams: Record<string,any>
    tools?: Tool<any, any>[]
  ): Promise<ApiCallResult>
}