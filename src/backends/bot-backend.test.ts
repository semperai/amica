import { Backend } from "./backend"
import { BotBackend } from "./bot-backend"

describe('CustomBotBackend', () => {
  it('should be exists the CustomBotBackend Factory', ()=>{
    expect(Backend.registeredClass('Bot')).toBe(BotBackend)
    expect(BotBackend.enabled).toBeTruthy()
    expect(BotBackend.isDir).toBeTruthy()
    expect(typeof BotBackend).toBe('function')
  })
  it('should register new BrainBackend', ()=>{
    class TestBrainBackend extends BotBackend {}

    BotBackend.registerItem(TestBrainBackend);

    expect(BotBackend.registeredClass('TestBrain')).toBe(TestBrainBackend)
    expect(TestBrainBackend.enabled).toBeTruthy()
    expect(TestBrainBackend.isDir).toBeFalsy()
  })

})
