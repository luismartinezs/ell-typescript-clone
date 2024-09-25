// TODO make it work
import * as  ell from '@/ell'

ell.init({})

const hello = ell.complex({
  model: 'gpt-4o-mini',
  n: 2
}, async (name: string) => {
  return [
    ell.system('You are a helpful assistant'),
    ell.user(`Say hello to ${name}`),
  ]
})

; (async () => {
  const result = await hello('Bruce Wayne')
  console.log(result.map((x) => x.text).join('\n'))
})()
