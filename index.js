const debug = require('debug')('demo-main')
const express = require('express')
const app = express()

app.get('/api/v0/transactions', require('./lib/handlers/transactions/get').all)
app.get('/api/v0/transactions/:id', require('./lib/handlers/transactions/get').one)

app.listen(3000, () => debug('Example app listening on port 3000!'))

process.on('unhandledRejection', (reason, p) => {
  debug('Unhandled Rejection at:', p, 'reason:', reason)
  console.log('Fatal crash')
  process.exit(1)
})
