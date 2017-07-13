const fs = require('fs')
const promisify = require('./')

test('should be export function', () => {
  expect(promisify).toBeDefined()
  expect(typeof promisify).toBe('function')
})

test('should convert function to one returning promise', () => {
  const func = x => x
  const pFunc = promisify(func)

  expect(typeof pFunc).toBe('function')
  expect(pFunc(5)).resolves.toBe(5)
  expect(pFunc(5)).toBeInstanceOf(Promise)
})

test('should convert callback style function to one returning promise', () => {
  const pFunc = promisify(fs.readFile)

  expect(pFunc('package.json', 'utf8')).resolves.toBeTruthy()
})

test('should not effect function that already returns promise', () => {
  const func = x => Promise.resolve(x)
  const pFunc = promisify(func)

  expect(typeof pFunc).toBe('function')
  expect(pFunc(5)).resolves.toBe(5)
  expect(pFunc(5)).toBeInstanceOf(Promise)
})

test('should throw if no function is provided', () => {
  expect(() => promisify(10)).toThrow()
})
