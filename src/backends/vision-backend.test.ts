import { Backend } from "./backend"
import { VisionBackend } from "./vision-backend"

describe('VisionBackend', () => {
  class TestVisionBackend extends VisionBackend {}
  beforeAll(()=>{
    VisionBackend.registerItem(TestVisionBackend);
  })
  afterAll(()=>{
    VisionBackend.unregister(TestVisionBackend)
  })
  it('should be exists the Vision Factory', ()=>{
    expect(Backend.registeredClass('Vision')).toBe(VisionBackend)
    expect(VisionBackend.enabled).toBeTruthy()
    expect(VisionBackend.isDir).toBeTruthy()
    expect(typeof VisionBackend).toBe('function')
  })
  it('should register new Vision', ()=>{
    expect(VisionBackend.registeredClass('TestVision')).toBe(TestVisionBackend)
    expect(TestVisionBackend.enabled).toBeTruthy()
    expect(TestVisionBackend.isDir).toBeFalsy()
  })
  it('should get Vision attributes', ()=>{
    const expectedResult = {name: 'TestVision', temperature: 0}
    const t = new VisionBackend(null, 'TestVision')
    expect(t).toBeInstanceOf(TestVisionBackend)
    expect(t.toJSON()).toMatchObject(expectedResult)
  })
})
