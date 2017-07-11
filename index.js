const promisify = function (func) {
  return function () {
    return new Promise((resolve, reject) => {
      const result = func.apply(null, Array.from(arguments))
      try {
        return result.then(resolve, reject)
      } catch (error) {
        if (error instanceof TypeError) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    })
  }
}

module.exports = promisify
