const vault = require('node-vault')()
const debug = require('debug')('demo')
const { oneLine } = require('common-tags')

const connection = 'postgresql://root:strongrootpassword@postgres:5432/?sslmode=disable'

const query = oneLine`
  CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID
  UNTIL '{{expiration}}';
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO "{{name}}";
`

async function configure (options) {
  debug('will configure postgres')

  return vault.write('database/config/postgresql', {
    plugin_name: 'postgresql-database-plugin',
    allowed_roles: 'readonly',
    connection_url: connection,
    max_open_connections: 20,
    max_idle_connections: 0,
    max_connection_lifetime: '5s',
    verify_connection: true
  })
}

async function createRole (options) {
  debug('will create role')

  return vault.write('database/roles/readonly', {
    db_name: 'postgresql',
    creation_statements: query,
    default_ttl: options.default_ttl || '30m',
    max_ttl: options.max_ttl || '6h'
  })
}

async function getCredentials (options) {
  debug('will get credentials')

  return vault.read('database/creds/readonly')
}

async function run () {
  await configure()
  await createRole()
  return getCredentials()
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
      if (result.hasOwnProperty('database/')) return run()

      return vault.mount({
        mount_point: 'database',
        type: 'database',
        description: 'general databse connection mount'
      }).then(async () => {
        return run()
      })
    })
}

module.exports = createAndGetAPIUserCredentials
module.exports.configure = configure
module.exports.createRole = createRole
module.exports.getCredentials = getCredentials
