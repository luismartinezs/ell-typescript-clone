class BaseModel { }

type Image = any

export class ContentBlock {
  text?: string
  // image?: Image|string
  // image_detail?: string
  // audio?: number[] | Float32Array
  // tool_call?: ToolCall
  parsed?: BaseModel
  // tool_result?: ToolResult

  constructor(data) {
    Object.assign(this, data)
  }

  get type() {
    if (this.text !== undefined) return 'text'
    if (this.parsed !== undefined) return 'parsed'
    return null
  }

  static coerce(content): ContentBlock {
    if (content instanceof ContentBlock) return content
    if (typeof content === 'string') return new ContentBlock({ text: content })
    if (content instanceof BaseModel) return new ContentBlock({ parsed: content })
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