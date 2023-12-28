import { CustomBotBackend } from '../custom-bot-backend';
import { LlamaCppBotBackend } from './bot-backend'

describe('LlamaCppBotBackend', () => {
  it('should register LlamaCppBotBackend Item', ()=>{
    expect(CustomBotBackend.registeredClass('LlamaCppBot')).toBe(LlamaCppBotBackend)
    expect(LlamaCppBotBackend.enabled).toBeTruthy()
    expect(LlamaCppBotBackend.isDir).toBeFalsy()
  })
  it('should create new bot backend', ()=>{
    const myTest = new LlamaCppBotBackend({url: 'http://myurl'})
    expect(myTest.name).toBe('LlamaCppBot')
    expect(myTest).toHaveProperty('enabled', true)
    expect(myTest).toHaveProperty('url', 'http://myurl')
    expect(myTest.toJSON()).toMatchObject({url: 'http://myurl', name: 'LlamaCppBot'})
  })
})
