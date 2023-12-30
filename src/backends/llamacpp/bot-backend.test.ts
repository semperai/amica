import { BotBackend } from '../bot-backend';
import { LlamaCppBotBackend } from './bot-backend'

describe('LlamaCppBotBackend', () => {
  it('should register LlamaCppBotBackend Item', ()=>{
    expect(BotBackend.registeredClass('LlamaCppBot')).toBe(LlamaCppBotBackend)
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
  it('should get Bot attributes', ()=>{
    const expectedResult = {name: 'LlamaCppBot', temperature: 0.7, cache_prompt:true, n_predict: 400}
    const t = new BotBackend(null, 'LlamaCppBot')
    expect(t).toBeInstanceOf(LlamaCppBotBackend)
    expect(t.toJSON()).toMatchObject(expectedResult)
  })
})
