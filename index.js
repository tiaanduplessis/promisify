'use strict'
const promisify = function (func) {
  if (typeof func !== 'function') {
    throw new Error('function should be provided')
  }
  return function (...args) {
    return new Promise((resolve, reject) => {
      args.push((error, ...result) => {
        if (error) {
          return reject(error)
        }
        resolve(...result)
      })

      const result = func(...args)
      if (result !== null && (typeof result === 'object' || typeof result === 'function')) {
        const then = result.then
        if (typeof then === 'function') {
          Function.prototype.call.call(then, result, resolve, reject)
        }
      }
    })
  }
}

module.exports = promisify
