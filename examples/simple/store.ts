import * as ell from "@/ell"

ell.init({
  store: './logdir',
})

const hello = ell.simple({ model: 'gpt-4o-mini' }, async (name: string) => {
  return [
    ell.system('You are a helpful assistant'),
    ell.user(`Say hello to ${name}`)
  ]
})

  ; (async () => {
    const greeting = await hello('world')
    console.log(greeting)
  })()