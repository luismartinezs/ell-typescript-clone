type Image = any
class BaseModel { }

class ToolResult {
  constructor(
    public tool_call_id: string,
    public result: ContentBlock[]
  ) {
    this.tool_call_id = tool_call_id
    this.result = result
  }
}

export class ToolCall {
  constructor(
    public tool,
    public tool_call_id,
    public params,
  ) { }

  call() {
    return this.tool(this.params)
  }

  callAndCollectAsMessageBlock(): ContentBlock {
    const res = this.tool(this.params)
    return new ContentBlock({
      tool_result: res
    })
  }

  callAndCollectAsMessage() {
    return new Message('user', [this.callAndCollectAsMessageBlock()])
  }
}

export class ContentBlock {
  text?: string
  // image?: Image|string
  // image_detail?: string
  // audio?: number[] | Float32Array
  tool_call?: ToolCall
  parsed?: BaseModel
  tool_result?: ToolResult

  constructor(data) {
    Object.assign(this, data)
  }

  get type() {
    if (this.text !== undefined) return 'text'
    if (this.parsed !== undefined) return 'parsed'
    if (this.tool_call !== undefined) return 'tool_call'
    if (this.tool_result !== undefined) return 'tool_result'
    return null
  }

  static coerce(content: string | BaseModel | ToolResult | ToolCall | ContentBlock): ContentBlock {
    if (content instanceof ContentBlock) return content
    if (typeof content === 'string') return new ContentBlock({ text: content })
    if (content instanceof BaseModel) return new ContentBlock({ parsed: content })
    if (content instanceof ToolResult) return new ContentBlock({ tool_result: content })
    if (content instanceof ToolCall) return new ContentBlock({ tool_call: content })
    throw new Error(`Invalid content type: ${typeof content}`)
  }
}

function coerceContentList(
  content,
  contentBlockKwargs
): ContentBlock[] {
  if (!content) {
    return [new ContentBlock(contentBlockKwargs)]
  }

  if (!Array.isArray(content)) {
    content = [content]
  }

  return content.map(c => ContentBlock.coerce(c))
}

export class Message {
  content: ContentBlock[]

  constructor(public role, content, contentBlockKwargs) {
    this.role = role
    this.content = coerceContentList(content, contentBlockKwargs)
  }

  get text() {
    return this.content.map(c => c.text || `<${c.type}>`).join('\n')
  }

  get parsed(): BaseModel | BaseModel[] {
    const parsedContent = this.content.filter(c => c.parsed).map(c => c.parsed as BaseModel)
    return parsedContent.length === 1 ? parsedContent[0] : parsedContent
  }

  get textOnly(): string | undefined {
    const textOnly = this.content.filter((c) => c.text).map((c) => c.text)
    return textOnly.length ? textOnly.join('\n') : undefined
  }

  get toolCalls() {
    const toolCalls = this.content.filter(c => c.tool_call).map(c => c.tool_call)
    return toolCalls.length ? toolCalls : undefined
  }

  get toolResults(): ToolResult[] | undefined {
    const toolResults = this.content.filter((c) => c.tool_result).map((c) => c.tool_result as ToolResult)
    return toolResults.length ? toolResults : undefined
  }

  async callToolsAndCollectAsMessage(parallel: boolean = false, maxWorkers?: number) {
    let content: ContentBlock[]
    if (parallel) {
      content = await Promise.all(
        this.content.filter(c => c.tool_call).map(c => c.tool_call!.callAndCollectAsMessageBlock())
      )
    } else {
      content = []
      // content = this.content.filter(c => c.tool_call).map(c => c.tool_call!.callAndCollectAsMessageBlock())
      for (const c of this.content) {
        if (c.tool_call) {
          const toolResult = c.tool_call!.callAndCollectAsMessageBlock()
          content.push(toolResult)
        }
      }
    }
    return new Message('user', content)
  }
}

export function system(content): Message {
  return new Message('system', content)
}

export function user(content): Message {
  return new Message('user', content)
}

export function assistant(content): Message {
  return new Message('assistant', content)
}