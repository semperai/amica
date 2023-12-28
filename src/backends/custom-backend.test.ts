import { CustomBackend } from "./custom-backend"

describe('CustomBackend', () => {
  class MyTestBackend extends CustomBackend {}

  beforeAll(()=>{
    CustomBackend.registerBackend(MyTestBackend)
  })
  afterAll(()=>{
    expect(CustomBackend.unregister(MyTestBackend)).toBeTruthy()
  })

  function testMyTest(myTest: MyTestBackend) {
    expect(myTest).toBeInstanceOf(MyTestBackend)
    expect(myTest.name).toBe('MyTest')
    expect(myTest).toHaveProperty('enabled', true)
  }

  it('should register backend', ()=>{
    expect(CustomBackend.registeredClass('MyTest')).toBe(MyTestBackend)
    expect(MyTestBackend.enabled).toBeTruthy()
  })
  it('should get BackendSchema', ()=>{
    const expetedResult = {name: {required: true, type: 'string'}, enabled: {type: 'boolean', value: true}}
    expect(CustomBackend.getProperties()).toMatchObject(expetedResult)
  })
  it('should create new backend', ()=>{
    testMyTest(new MyTestBackend)
    testMyTest(new CustomBackend(null, 'MyTest'))
  })
})