const test = require('tape')
// const sinon = require('sinon')
const debug = require('debug')('demo:test')
const vault = require('node-vault')()
const DynamicPool = require('../../lib/helpers/dbs/pg/dynamic-pool/pool')
const createAndGetAPIUserCredentials = require('../../lib/helpers/vault/get-api-user-credentials')

async function setup (options) {
  try {
    await vault.delete('database/roles/readonly')
    await createAndGetAPIUserCredentials(options)
  } catch (err) {
    debug(err)
  }
}

test('Dynamic Token: can continuously write to db', async (t) => {
  t.plan(1)

  const options = { default_ttl: '10s' }
  await setup(options)

  const pool = new DynamicPool()

  pool.once('ready', () => {
    pool.connect((err, client, release) => {
      if (err) {
        debug(err)
        return t.fail()
      }

      client.query('SELECT 1', (err, result) => {
        if (err) {
          debug(err)
          client.release()
          return t.fail(err)
        }

        client.release()

        t.ok(result)

        pool.destroy()

        t.end()
      })
    })
  })
})
