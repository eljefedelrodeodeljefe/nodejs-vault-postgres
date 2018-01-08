const vault = require('node-vault')()
const debug = require('debug')('demo')

const connection = 'postgresql://root:strongrootpassword@postgres:5432/?sslmode=disable'

async function configure (options = {}) {
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

module.exports = configure
