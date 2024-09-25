import { describe, it, expect } from 'vitest'
import { init, simple, complex, user, system } from '@/ell'

describe('ell module', () => {
  it('init function should be defined', () => {
    expect(init).toBeDefined()
  })

  it('simple function should return null', () => {
    expect(simple({}, () => {})).toBeNull()
  })

  it('complex function should return null', () => {
    expect(complex({}, () => {})).toBeNull()
  })

  it('user function should return null', () => {
    expect(user('test message')).toBeNull()
  })

  it('system function should return null', () => {
    expect(system('test message')).toBeNull()
  })
})