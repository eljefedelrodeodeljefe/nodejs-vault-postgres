const vault = require('node-vault')()
const debug = require('debug')('demo')
const { oneLine } = require('common-tags')

const connection = 'postgresql://root:strongrootpassword@postgres:5432/?sslmode=disable'

const query = oneLine`
  CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID
  UNTIL '{{expiration}}';
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO "{{name}}";
`

async function configure () {
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

async function createRole () {
  debug('will create role')

  return vault.write('database/roles/readonly', {
    db_name: 'postgresql',
    creation_statements: query,
    default_ttl: '30m',
    max_ttl: '6h'
  })
}

async function getCredentials () {
  debug('will get credentials')

  return vault.read('database/creds/readonly')
}

async function run () {
  await configure()
  await createRole()
  return getCredentials()
}

module.exports = async () => {
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
