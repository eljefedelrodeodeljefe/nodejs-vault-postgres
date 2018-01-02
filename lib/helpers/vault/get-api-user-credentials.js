const vault = require('node-vault')()
const debug = require('debug')('demo')
const { oneLine } = require('common-tags')

const connection = 'postgresql://root:strongrootpassword@postgres:5432/postgres?sslmode=disable'

const query = oneLine`
  CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID
  UNTIL '{{expiration}}';
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO "{{name}}";
`

async function configure () {
  return vault.write('postgresql/config/lease', {
    lease: '1h',
    lease_max: '24h'
  }).then(() => vault.write('postgresql/config/connection', {
    value: connection
  }))
}

async function createRole () {
  return vault.write('postgresql/roles/readonly', {
    sql: query
  })
}

async function getCredentials () {
  debug('will get credentials')
  return vault.read('postgresql/creds/readonly')
}

async function run () {
  await configure()
  await createRole()

  return getCredentials()
}

module.exports = async () => {
  return vault.mounts()
    .then((result) => {
      if (result.hasOwnProperty('postgresql/')) return run()

      return vault.mount({
        mount_point: 'postgresql',
        type: 'postgresql',
        description: 'postgresql mount test'
      }).then(async () => {
        return run()
      })
    })
}
