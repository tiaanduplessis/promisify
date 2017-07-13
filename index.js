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

      return func(...args)
    })
  }
}

module.exports = promisify
