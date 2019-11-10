#!/usr/bin/env node

const { createHash } = require('crypto')
const {
  createWriteStream,
  readFileSync,
  renameSync,
  accessSync,
  copyFileSync
} = require('fs')
const { homedir } = require('os')
const { join, dirname } = require('path')
const { get } = require('axios')
const ProgressBar = require('progress')
const unzip = require('unzip').Parse
const mkdirp = require('mkdirp').sync

let versionPath = join(__dirname, 'version')
let tendermintVersion = readFileSync(versionPath, 'utf8').trim()

let cacheBinPath = join(
  homedir(),
  '.tendermint-node',
  `tendermint_${tendermintVersion}`
)

let binPath = join(__dirname, 'tendermint')

if (process.platform === 'win32') {
  binPath += '.exe'
}

try {
  accessSync(cacheBinPath)
  // binary was already downloaded
  copyFileSync(cacheBinPath, binPath)
  process.exit(0)
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

console.log(`downloading tendermint v${tendermintVersion}`)
let binaryDownloadUrl = getBinaryDownloadURL(tendermintVersion)
get(binaryDownloadUrl, { responseType: 'stream' }).then((res) => {
  if (res.status !== 200) {
    throw Error(`Request failed, status: ${res.status}`)
  }
  let length = +res.headers['content-length']

  let template = '[:bar] :rate/Mbps :percent :etas'
  let bar = new ProgressBar(template, {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: length / 1e6 * 8
  })

  let tempBinPath = join(__dirname, '_tendermint')
  let shasumPath = join(__dirname, 'SHA256SUMS')

  // unzip, write to file, and check hash
  let file = createWriteStream(tempBinPath, { mode: 0o755 })
  res.data.pipe(unzip()).once('entry', (entry) => {
    // write to file
    // (a temporary file which we rename if the hash check passes)
    entry.pipe(file)
  })

  // verify hash of file
  // Since the SHA256SUMS file comes from npm, and the binary
  // comes from GitHub, both npm AND GitHub would need to be
  // compromised for the binary download to be compromised.
  let hasher = createHash('sha256')
  res.data.on('data', (chunk) => hasher.update(chunk))
  file.on('finish', () => {
    let actualHash = hasher.digest().toString('hex')

    // get known hash from SHA256SUMS file
    let shasums = readFileSync(shasumPath).toString()
    let expectedHash
    for (let line of shasums.split('\n')) {
      let [ shasum, filename ] = line.split(' ')
      if (binaryDownloadUrl.includes(filename)) {
        expectedHash = shasum
        break
      }
    }

    if (actualHash !== expectedHash) {
      console.error('ERROR: hash of downloaded tendermint binary did not match')
      process.exit(1)
    }

    console.log('✅ verified hash of tendermint binary\n')
    renameSync(tempBinPath, binPath)

    mkdirp(dirname(cacheBinPath))
    copyFileSync(binPath, cacheBinPath)
  })

  // increment progress bar
  res.data.on('data', (chunk) => bar.tick(chunk.length / 1e6 * 8))
  res.data.on('end', () => console.log())
})

// gets a URL to the binary zip, hosted on GitHub
function getBinaryDownloadURL (version) {
  let platforms = {
    'darwin': 'darwin',
    'linux': 'linux',
    'win32': 'windows'
  }
  let arches = {
    'x64': 'amd64'
  }
  let platform = platforms[process.platform]
  let arch = arches[process.arch]
  return `https://github.com/tendermint/tendermint/releases/download/v${version}/tendermint_v${version}_${platform}_${arch}.zip`
}
