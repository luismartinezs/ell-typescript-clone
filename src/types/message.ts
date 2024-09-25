export class Message {
  content // TODO

  constructor(public role, content) {
    this.role = role
    this.content = content
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