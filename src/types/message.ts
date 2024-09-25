type Image = any

export class ContentBlock {
  text?: string
  // image?: Image|string
  // image_detail?: string
  // audio?: number[] | Float32Array
  // tool_call?: ToolCall
  // parsed?: BaseModel
  // tool_result?: ToolResult

  constructor(data) {
    Object.assign(this, data)
  }

  get type() {
    if (this.text !== undefined) return 'text'
    return null
  }

  static coerce(content):ContentBlock {
    if (content instanceof ContentBlock) return content
    if (typeof content === 'string') return new ContentBlock({text:content})
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
    content =[content]
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