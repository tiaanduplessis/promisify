'use strict'
const fs = require('fs')
const spawnSync = require('child_process').spawnSync
const promisify = require('./')

function deferred () {
  const result = {}
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

test('should export a function and reject invalid input', () => {
  expect(typeof promisify).toBe('function')
  expect(() => promisify(10)).toThrow('function should be provided')
})

test('should settle from a fulfilled returned Promise', () => {
  const wrapped = promisify(x => Promise.resolve(x))
  const result = wrapped(5)
  expect(typeof wrapped).toBe('function')
  expect(result).toBeInstanceOf(Promise)
  return expect(result).resolves.toBe(5)
})

test('should preserve falsy fulfilled Promise values', () => {
  return Promise.all([0, false, '', null, undefined].map(value => {
    return expect(promisify(() => Promise.resolve(value))()).resolves.toBe(value)
  }))
})

test('should settle from a rejected returned Promise', () => {
  const error = new Error('returned rejection')
  return expect(promisify(() => Promise.reject(error))()).rejects.toBe(error)
})

test('should preserve falsy Promise rejection reasons', () => {
  return Promise.all([0, false, '', null, undefined].map(reason => {
    return expect(promisify(() => Promise.reject(reason))()).rejects.toBe(reason)
  }))
})

test('should settle from a synchronous thenable', () => {
  return expect(promisify(() => ({ then: resolve => resolve(5) }))()).resolves.toBe(5)
})

test('should settle from an asynchronous thenable', () => {
  const result = deferred()
  const wrapped = promisify(() => ({ then: resolve => result.promise.then(resolve) }))()
  result.resolve(5)
  return expect(wrapped).resolves.toBe(5)
})

test('should reject from a thenable', () => {
  const error = new Error('thenable rejection')
  return expect(promisify(() => ({ then: (resolve, reject) => reject(error) }))()).rejects.toBe(error)
})

test('should support callable thenables', () => {
  const result = function () {}
  result.then = resolve => resolve(5)
  return expect(promisify(() => result)()).resolves.toBe(5)
})

test('should read then once and preserve its receiver', () => {
  let reads = 0
  const result = {
    get then () {
      reads++
      return function (resolve) {
        expect(this).toBe(result)
        resolve(5)
      }
    }
  }
  return promisify(() => result)().then(value => {
    expect(value).toBe(5)
    expect(reads).toBe(1)
  })
})

test('should assimilate nested thenable values', () => {
  return expect(promisify(() => ({
    then: resolve => resolve({ then: innerResolve => innerResolve(Promise.resolve(5)) })
  }))()).resolves.toBe(5)
})

test('should ignore a callable then method\'s own call property', () => {
  const result = {
    then (resolve) {
      expect(this).toBe(result)
      resolve(5)
    }
  }
  result.then.call = null
  return expect(promisify(() => result)()).resolves.toBe(5)
})

test('should reject when reading then throws', () => {
  const error = new Error('then getter')
  return expect(promisify(() => ({ get then () { throw error } }))()).rejects.toBe(error)
})

test('should reject when calling then throws', () => {
  const error = new Error('then call')
  return expect(promisify(() => ({ then () { throw error } }))()).rejects.toBe(error)
})

test('should ignore thenable rejection and throws after its first resolution', () => {
  return expect(promisify(() => ({
    then (resolve, reject) {
      resolve(5)
      reject(new Error('too late'))
      throw new Error('also too late')
    }
  }))()).resolves.toBe(5)
})

test('should convert an actual callback API', () => {
  return promisify(fs.readFile)(__filename, 'utf8').then(value => {
    expect(value).toContain('should convert an actual callback API')
  })
})

test('should preserve the first callback result', () => {
  return expect(promisify(callback => callback(null, 5, 6))()).resolves.toBe(5)
})

test('should support callbacks without a result', () => {
  return expect(promisify(callback => callback())()).resolves.toBeUndefined()
})

test('should reject callback errors', () => {
  const error = new Error('callback error')
  return expect(promisify(callback => callback(error))()).rejects.toBe(error)
})

test('should preserve falsy callback error behavior', () => {
  return Promise.all([0, false, '', null, undefined].map(error => {
    return expect(promisify(callback => callback(error, 5))()).resolves.toBe(5)
  }))
})

test('should reject asynchronous callback errors', () => {
  const error = new Error('async callback error')
  return expect(promisify(callback => setImmediate(() => callback(error)))()).rejects.toBe(error)
})

test('should reject synchronous throws', () => {
  const error = new Error('function throw')
  return expect(promisify(() => { throw error })()).rejects.toBe(error)
})

test('should wait for callbacks when ordinary return values are present', () => {
  return Promise.all([0, 7, false, '', 'handle', null, undefined, {}, { then: true }].map(handle => {
    return expect(promisify(callback => {
      setImmediate(() => callback(null, 5))
      return handle
    })()).resolves.toBe(5)
  }))
})

test('should ignore actual timer handles', () => {
  return expect(promisify(callback => setTimeout(() => callback(null, 5), 0))()).resolves.toBe(5)
})

test('should not settle from a synchronous scalar return alone', () => {
  let settled = false
  const result = promisify(() => 5)()
  result.then(() => { settled = true }, () => { settled = true })
  return new Promise(resolve => setImmediate(resolve)).then(() => {
    expect(settled).toBe(false)
  })
})

test('should preserve arguments and the existing unbound invocation', () => {
  const marker = {}
  const wrapped = promisify(function (first, second, callback) {
    expect(this).toBeUndefined()
    expect(arguments.length).toBe(3)
    expect(first).toBe(marker)
    expect(second).toBe(5)
    expect(typeof callback).toBe('function')
    return Promise.resolve(second)
  })
  return expect(wrapped.call({ receiver: true }, marker, 5)).resolves.toBe(5)
})

test('should preserve explicitly bound receivers', () => {
  const receiver = { value: 5 }
  const wrapped = promisify(function (callback) {
    callback(null, this.value)
  }.bind(receiver))
  return expect(wrapped()).resolves.toBe(5)
})

test('should keep the first callback settlement', () => {
  return expect(promisify(callback => {
    callback(null, 5)
    callback(new Error('too late'))
    callback(null, 6)
    throw new Error('also too late')
  })()).resolves.toBe(5)
})

test('should keep a synchronous callback ahead of a returned Promise', () => {
  return expect(promisify(callback => {
    callback(null, 5)
    return Promise.resolve(6)
  })()).resolves.toBe(5)
})

test('should keep a callback rejection ahead of a returned Promise', () => {
  const error = new Error('callback first')
  return expect(promisify(callback => {
    callback(error)
    return Promise.resolve(6)
  })()).rejects.toBe(error)
})

test('should keep an asynchronous callback ahead of a later Promise settlement', () => {
  const result = deferred()
  const wrapped = promisify(callback => {
    setImmediate(() => {
      callback(null, 5)
      result.resolve(6)
    })
    return result.promise
  })()
  return expect(wrapped).resolves.toBe(5)
})

test('should keep a returned Promise ahead of a later callback', () => {
  let callback
  const wrapped = promisify(done => {
    callback = done
    return Promise.resolve(5)
  })()
  return wrapped.then(value => {
    callback(null, 6)
    expect(value).toBe(5)
    return expect(wrapped).resolves.toBe(5)
  })
})

test('should keep a returned rejection ahead of a later callback', () => {
  const error = new Error('Promise first')
  let callback
  const wrapped = promisify(done => {
    callback = done
    return Promise.reject(error)
  })()
  return wrapped.then(() => { throw new Error('expected rejection') }, reason => {
    callback(null, 5)
    expect(reason).toBe(error)
    return expect(wrapped).rejects.toBe(error)
  })
})

test('should preserve a pending Promise selected by the first callback', () => {
  const first = deferred()
  const wrapped = promisify(callback => {
    callback(null, first.promise)
    return Promise.resolve(6)
  })()
  return Promise.resolve().then(() => {
    first.resolve(5)
    return expect(wrapped).resolves.toBe(5)
  })
})

test('should consume returned rejections even when a callback settles first', () => {
  const child = spawnSync(process.execPath, ['-e', `
    const promisify = require(${JSON.stringify(require.resolve('./'))})
    process.on('unhandledRejection', error => {
      console.error(error)
      process.exitCode = 1
    })
    const error = new Error('expected rejection')
    Promise.all([
      promisify(() => Promise.reject(error))().then(
        () => { throw new Error('expected rejection') },
        reason => { if (reason !== error) throw new Error('wrong rejection') }
      ),
      promisify(callback => {
        callback(null, 5)
        return Promise.reject(error)
      })().then(value => { if (value !== 5) throw new Error('wrong value') }),
      promisify(callback => {
        callback(error)
        return Promise.reject(new Error('second rejection'))
      })().then(
        () => { throw new Error('expected callback rejection') },
        reason => { if (reason !== error) throw new Error('wrong callback rejection') }
      )
    ]).then(() => setImmediate(() => console.log('settled')), error => {
      console.error(error)
      process.exitCode = 1
    })
  `], { encoding: 'utf8', timeout: 2000 })
  expect(child.error).toBeUndefined()
  expect(child.status).toBe(0)
  expect(child.stdout.trim()).toBe('settled')
})
