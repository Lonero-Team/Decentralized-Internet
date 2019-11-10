const circularAppendFile = require('./')
const test = require('ava')
const tempy = require('tempy')
const concat = require('concat-stream')

async function append (caf, data) {
  return new Promise((resolve, reject) => {
    caf.append(data, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

async function read (caf) {
  return new Promise((resolve) => {
    caf.createReadStream().pipe(concat(resolve))
  })
}

test('appends as expected when waiting and no circle occurs', async t => {
  let caf = circularAppendFile(tempy.file({extension: 'log'}))
  let writtenData = ''
  for (let i = 0; i < 1000; i++) {
    let line = `${(''+i).padStart(4)}\n`
    writtenData += line
    await append(caf, line)
  }
  t.deepEqual(await read(caf), writtenData)
})

test('appends as expected when not waiting and no circle occurs', async t => {
  let caf = circularAppendFile(tempy.file({extension: 'log'}))
  let writtenData = ''
  let promises = []
  for (let i = 0; i < 1000; i++) {
    let line = `${(''+i).padStart(4)}\n`
    writtenData += line
    promises.push(append(caf, line))
  }
  await Promise.all(promises)
  t.deepEqual(await read(caf), writtenData)
})

test('appends as expected when waiting and circle occurs', async t => {
  let p = tempy.file({extension: 'log'})
  let caf = circularAppendFile(p, {maxSize: 2500})
  for (let i = 0; i < 1000; i++) {
    let line = `${(''+i).padStart(4)}\n`
    await append(caf, line)
  }
  t.deepEqual((await read(caf)).length, 2505)
})

test('appends as expected when not waiting and circle occurs', async t => {
  let caf = circularAppendFile(tempy.file({extension: 'log'}), {maxSize: 2500})
  let promises = []
  for (let i = 0; i < 1000; i++) {
    let line = `${(''+i).padStart(4)}\n`
    promises.push(append(caf, line))
  }
  await Promise.all(promises)
  t.deepEqual((await read(caf)).length, 2505)
})

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength,padString) {
    targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if (this.length > targetLength) {
      return String(this);
    }
    else {
      targetLength = targetLength-this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0,targetLength) + String(this);
    }
  };
}