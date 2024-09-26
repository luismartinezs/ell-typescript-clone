import { ell } from "@e/ell"

ell.init({})

const hello = ell.simple({ model: 'gpt-4o-mini' }, async (name: string) => `Say hello to ${name}`)

  ; (async () => {
    const greeting = await hello('world')
    console.log(greeting)
  })()