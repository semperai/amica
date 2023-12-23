import { CustomBackend } from "./custom-backend"

describe('CustomBackend', () => {
  class MyTestBackend extends CustomBackend {}
  it('should register backend', ()=>{
    CustomBackend.registerBackend(MyTestBackend)
    expect(CustomBackend.registeredClass('MyTest')).toBe(MyTestBackend)
    expect(MyTestBackend.enabled).toBeTruthy()
  })
  it('should create new backend', ()=>{
    const myTest = new MyTestBackend
    expect(myTest.name).toBe('MyTest')
    expect(myTest).toHaveProperty('enabled', true)
  })
})