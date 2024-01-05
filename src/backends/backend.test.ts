import { Backend } from "./backend"

describe('Backend', () => {
  class MyTestBackend extends Backend {}

  beforeAll(()=>{
    Backend.register(MyTestBackend)
  })
  afterAll(()=>{
    expect(Backend.unregister(MyTestBackend)).toBeTruthy()
  })

  function testMyTest(myTest: MyTestBackend) {
    expect(myTest).toBeInstanceOf(MyTestBackend)
    expect(myTest.name).toBe('MyTest')
    expect(myTest).toHaveProperty('enabled', true)
  }

  it('should register sub-factory backend', ()=>{
    expect(Backend.registeredClass('MyTest')).toBe(MyTestBackend)
    expect(MyTestBackend.enabled).toBeTruthy()
  })
  it('should register product item backend', ()=>{
    class ItemBackend {}
    Backend.registerItem(ItemBackend)
    expect(Backend.registeredClass('Item')).toBe(ItemBackend)
    expect(Backend.unregister(ItemBackend)).toBeTruthy()
    expect(Backend.registeredClass('Item')).toBeUndefined()
  })
  it('should get BackendSchema', ()=>{
    const expetedResult = {name: {required: true, type: 'string'}, enabled: {type: 'boolean', value: true}}
    expect(Backend.getProperties()).toMatchObject(expetedResult)
  })
  it('should create new backend', ()=>{
    testMyTest(new MyTestBackend)
    testMyTest(new Backend(null, 'MyTest'))
  })
})