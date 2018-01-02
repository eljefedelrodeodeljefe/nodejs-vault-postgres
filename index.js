const debug = require('debug')('demo-main')
// const initVault = require('./lib/vault-init')
const getApiUserCreds = require('./lib/get-api-user-credentials')

async function main () {
  // await initVault()
  let credentials
  try {
    credentials = await getApiUserCreds()
  } catch (err) {
    debug(err)
    return
  }

  debug(credentials)
}

main()
