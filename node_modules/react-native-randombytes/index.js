if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

let sjcl = require('sjcl')
let RNRandomBytes = require('react-native').NativeModules.RNRandomBytes

function noop () {}

function toBuffer (nativeStr) {
  return new Buffer(nativeStr, 'base64')
}

function init () {
  if (RNRandomBytes.seed) {
    let seedBuffer = toBuffer(RNRandomBytes.seed)
    addEntropy(seedBuffer)
  } else {
    seedSJCL()
  }
}

function addEntropy (entropyBuf) {
  let hexString = entropyBuf.toString('hex')
  let stanfordSeed = sjcl.codec.hex.toBits(hexString)
  sjcl.random.addEntropy(stanfordSeed)
}

export function seedSJCL (cb) {
  cb = cb || noop
  randomBytes(4096, function (err, buffer) {
    if (err) return cb(err)

    addEntropy(buffer)
  })
}

export function randomBytes (length, cb) {
  if (!cb) {
    let size = length
    let wordCount = Math.ceil(size * 0.25)
    let randomBytes = sjcl.random.randomWords(wordCount, 10)
    let hexString = sjcl.codec.hex.fromBits(randomBytes)
    hexString = hexString.substr(0, size * 2)
    return new Buffer(hexString, 'hex')
  }

  RNRandomBytes.randomBytes(length, function(err, base64String) {
    if (err) {
      cb(err)
    } else {
      cb(null, toBuffer(base64String))
    }
  })
}

init()
