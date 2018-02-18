require('./bootstrap')

require('./src/api')((err) => {
  if (err) throw err
  log.info('-------')
  log.info('Port: ' + CONFIG.api.port)
  log.info('API running!')
})

process.on('uncaughtException', (err) => {
  err.stack && log.error(err)
  process.exit(1)
})

if (process.platform === 'win32') {
  var readLine = require('readline')
  var rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.on('SIGINT', () => {
    process.emit('SIGINT')
  })
}

process.on('SIGINT', () => {
  process.exit()
})
