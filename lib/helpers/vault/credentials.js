const vault = require('node-vault')()
const debug = require('debug')('demo')

async function getCredentials (options = {}) {
  debug('will get credentials')

  return vault.read('database/creds/readonly')
}

module.exports = getCredentials
