const promisify = require('./')

test('should be export function', () => {
  expect(promisify).toBeDefined()
  expect(typeof promisify).toBe('function')
})

test('should convert function to one returning promise', () => {
  const func = x => x
  const promiseFunc = promisify(func)

  expect(typeof promiseFunc).toBe('function')
  expect(promiseFunc(5)).resolves.toBe(5)
  expect(promiseFunc(5)).toBeInstanceOf(Promise)
})

test('should not effect function that already returns promise', () => {
  const func = x => Promise.resolve(x)
  const promiseFunc = promisify(func)

  expect(typeof promiseFunc).toBe('function')
  expect(promiseFunc(5)).resolves.toBe(5)
  expect(promiseFunc(5)).toBeInstanceOf(Promise)
})
