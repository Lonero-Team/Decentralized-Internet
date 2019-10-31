# circular-append-file

A simple appendable-file interface which enforces a size cap by overwriting itself.
A good way to maintain a log where you want to drop history after you hit a size limit.

Currently clears the file on open, then will write each append to the end until the `maxSize` is hit.
Will then circle back to the top and continue writing.

Currently only supports strings.

```js
const CircularAppendFile = require('circular-append-file')

let log = CircularAppendFile('./app.log', {
  maxSize: 1024 // 1kb (default is 32mb)
})
log.append('Hello\n')
log.append('World!\n')
log.createReadStream().pipe(process.stdout)
log.close()
```