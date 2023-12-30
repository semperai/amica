import { Backend } from "./backend"
import { BotBackend } from "./bot-backend"

describe('BotBackend', () => {
  class TestBrainBackend extends BotBackend {}
  beforeAll(()=>{
    BotBackend.registerItem(TestBrainBackend);
  })
  afterAll(()=>{
    BotBackend.unregister(TestBrainBackend)
  })
  it('should be exists the BotBackend Factory', ()=>{
    expect(Backend.registeredClass('Bot')).toBe(BotBackend)
    expect(BotBackend.enabled).toBeTruthy()
    expect(BotBackend.isDir).toBeTruthy()
    expect(typeof BotBackend).toBe('function')
  })
  it('should register new BrainBackend', ()=>{
    expect(BotBackend.registeredClass('TestBrain')).toBe(TestBrainBackend)
    expect(TestBrainBackend.enabled).toBeTruthy()
    expect(TestBrainBackend.isDir).toBeFalsy()
  })
  it('should get Bot attributes', ()=>{
    const expectedResult = {name: 'TestBrain', temperature: 0.7}
    const t = new BotBackend(null, 'TestBrain')
    expect(t).toBeInstanceOf(TestBrainBackend)
    expect(t.toJSON()).toMatchObject(expectedResult)
  })

})
