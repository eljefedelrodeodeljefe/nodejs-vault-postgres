const vault = require('node-vault')()
const configure = require('./configure')
const createRole = require('./create-role')
const getCredentials = require('./credentials')

async function run (options) {
  await configure(options)
  await createRole(options)
  return getCredentials(options)
}

/**
 * Vault PG options to override defaults, e.g. in tests
 *
 * @typedef {Object} DBOptions
 * @property {(String|Number)} default_ttl - override the default lifetime of a DB user
 * @property {(String|Number)} max_ttl - override the max lifetime of a DB user
*/

/**
 * Create and get API user credentials for all available DBs
 *
 * @param {DBOptions} options
 */
async function createAndGetAPIUserCredentials (options) {
  return vault.mounts()
    .then((result) => {
      if (result.hasOwnProperty('database/')) return run(options)

      return vault.mount({
        mount_point: 'database',
        type: 'database',
        description: 'general databse connection mount'
      }).then(async () => {
        return run(options)
      })
    })
}

module.exports = createAndGetAPIUserCredentials
