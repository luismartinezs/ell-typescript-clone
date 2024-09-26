export type TContentBlock = {
  type: string | null
  text?: string
}

export function ContentBlock(data: Partial<TContentBlock>): TContentBlock {
  let text = data.text
  return {
    text,
    ...data, // not needed??
    get type() {
      if (this.text !== undefined) return 'text'
      // if (this.image !== undefined) return 'image'
      // if (this.audio !== undefined) return 'audio'
      // if (this.tool_call !== undefined) return 'tool_call'
      // if (this.parsed !== undefined) return 'parsed'
      // if (this.tool_result !== undefined) return 'tool_result'
      return null
    }
  }
}

// "static" method
ContentBlock.is = (obj: any): obj is TContentBlock =>
  obj && typeof obj === 'object' && 'text' in obj && 'type' in obj;

// "static" method
ContentBlock.coerce = (content: string | TContentBlock) => {
  // logger.log('ContentBlock.coerce')
  // logger.log(content)
  if (ContentBlock.is(content)) return content
  if (typeof content === 'string') return ContentBlock({ text: content })
  throw new Error(`Invalid content type: ${typeof content}`)
}

function coerceContentList(content?: string | TContentBlock[] | string[], contentBlockKwargs: any = {}) {
  if (!content) {
    return [ContentBlock(contentBlockKwargs)]
  }
  let _content
  if (!Array.isArray(content)) {
    _content = [content]
  } else {
    _content = content
  }
  // logger.log('coerceContentList')
  // logger.log(_content)
  return _content?.map((c) => ContentBlock.coerce(c))
}

export type TMessage = {
  role: string
  content: TContentBlock[]
  text?: string
  textOnly?: string
}

export function Message(role: string, _content: string | TContentBlock[], contentBlockKwargs = {}): TMessage {
  let content = coerceContentList(_content, contentBlockKwargs)

  return {
    role,
    content,
    get text() {
      return content.map((c) => c.text).join('')
    },
    get textOnly() {
      const textOnly = content.filter(c => c.text).map(c => c.text)
      return textOnly.length ? textOnly.join('') : undefined
    }
  }
}

export function system(content: string | TContentBlock[]) {
  return Message('system', content)
}

export function user(content: string | TContentBlock[]) {
  return Message('user', content)
}

export function assistant(content: string | TContentBlock[]) {
  return Message('assistant', content)
}

