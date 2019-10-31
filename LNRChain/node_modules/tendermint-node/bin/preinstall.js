const { closeSync, openSync } = require('fs')
const { join } = require('path')

let binPath = join(__dirname, 'tendermint')

if (process.platform === 'win32') {
  binPath += '.exe'
}

closeSync(openSync(binPath, 'w'))