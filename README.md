
<h1 align="center">promisify</h1>
<div align="center">
  <strong>Convert function to one returning a promise</strong>
</div>
<div align="center">
  <a href="https://npmjs.org/package/@tiaanduplessis/promisify">
    <img src="https://img.shields.io/npm/v/@tiaanduplessis/promisify.svg?style=flat-square" alt="npm package version" />
  </a>
  <a href="https://npmjs.org/package/@tiaanduplessis/promisify">
  <img src="https://img.shields.io/npm/dm/@tiaanduplessis/promisify.svg?style=flat-square" alt="npm downloads" />
  </a>
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="standard JS linter" />
  </a>
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square" alt="prettier code formatting" />
  </a>
  <a href="https://travis-ci.org/tiaanduplessis/promisify">
    <img src="https://img.shields.io/travis/tiaanduplessis/promisify.svg?style=flat-square" alt="travis ci build status" />
  </a>
  <a href="https://github.com/tiaanduplessis/promisify/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/@tiaanduplessis/promisify.svg?style=flat-square" alt="project license" />
  </a>
  <a href="http://makeapullrequest.com">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="make a pull request" />
  </a>
</div>
<br>
<div align="center">
  <a href="https://github.com/tiaanduplessis/promisify/watchers">
    <img src="https://img.shields.io/github/watchers/tiaanduplessis/promisify.svg?style=social" alt="Github Watch Badge" />
  </a>
  <a href="https://github.com/tiaanduplessis/promisify/stargazers">
    <img src="https://img.shields.io/github/stars/tiaanduplessis/promisify.svg?style=social" alt="Github Star Badge" />
  </a>
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20promisify!%20https://github.com/tiaanduplessis/promisify%20%F0%9F%91%8D">
    <img src="https://img.shields.io/twitter/url/https/github.com/tiaanduplessis/promisify.svg?style=social" alt="Tweet" />
  </a>
</div>
<br>
<div align="center">
  Built with ❤︎ by <a href="https://github.com/tiaanduplessis">tiaanduplessis</a> and <a href="https://github.com/tiaanduplessis/promisify/contributors">contributors</a>
</div>

<h2>Table of Contents</h2>
<details>
  <summary>Table of Contents</summary>
  <li><a href="#install">Install</a></li>
  <li><a href="#usage">Usage</a></li>
  <li><a href="#related">Related</a></li>
  <li><a href="#contribute">Contribute</a></li>
  <li><a href="#license">License</a></li>
</details>

## Install

```sh
$ npm install @tiaanduplessis/promisify
# OR
$ yarn add @tiaanduplessis/promisify
```

## Usage

```js

const fs = require('fs')
const promisify = require('@tiaanduplessis/promisify')

const a = (x) => x;
const b = (x) => Promise.resolve(x)
const c = (x) => Promise.reject(x)


promisify(a)('foo').then(console.log)
promisify(b)('bar').then(console.log)
promisify(c)('baz').catch(console.log)
promisify(fs.readFile)('package.json', 'utf8').then(console.log)

```

# Related

- [es6-promisify](https://github.com/digitaldesignlabs/es6-promisify)
- [pify](https://github.com/sindresorhus/pify)

## Contributing

Contributions are welcome!

1. Fork it.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

Or open up [a issue](https://github.com/tiaanduplessis/promisify/issues).

## License

Licensed under the MIT License.
