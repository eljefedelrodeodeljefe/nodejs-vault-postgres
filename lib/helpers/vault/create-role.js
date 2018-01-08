const vault = require('node-vault')()
const debug = require('debug')('demo')
const { oneLine } = require('common-tags')

const query = oneLine`
  CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID
  UNTIL '{{expiration}}';
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO "{{name}}";
`

async function createRole (options = {}) {
  debug('will create role')

  return vault.write('database/roles/readonly', {
    db_name: 'postgresql',
    creation_statements: query,
    default_ttl: options.default_ttl || '30m',
    max_ttl: options.max_ttl || '6h'
  })
}

module.exports = createRole
