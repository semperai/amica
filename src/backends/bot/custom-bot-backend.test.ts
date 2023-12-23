import { CustomBackend } from "../custom-backend"
import { CustomBotBackend } from "./custom-bot-backend"

describe('CustomBotBackend', () => {
  it('should be exists the CustomBotBackend Factory', ()=>{
    expect(CustomBackend.registeredClass('CustomBot')).toBe(CustomBotBackend)
    expect(CustomBotBackend.enabled).toBeTruthy()
    expect(CustomBotBackend.isDir).toBeTruthy()
    expect(typeof CustomBotBackend).toBe('function')
  })
  it('should register new BrainBackend', ()=>{
    class TestBrainBackend extends CustomBotBackend {}

    CustomBotBackend.register(TestBrainBackend);

    expect(CustomBotBackend.registeredClass('TestBrain')).toBe(TestBrainBackend)
    expect(TestBrainBackend.enabled).toBeTruthy()
    expect(TestBrainBackend.isDir).toBeFalsy()
  })

})