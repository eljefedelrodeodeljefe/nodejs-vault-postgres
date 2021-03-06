const test = require('tape')
const sinon = require('sinon')
const DynamicPool = require('../../lib/helpers/dbs/pg/dynamic-pool/pool')
const createAndGetAPIUserCredentials = require('../../lib/helpers/vault/get-api-user-credentials')

async function setup () {
  await createAndGetAPIUserCredentials()
}

setup()

test('Dynamic Token: can instantiate token retrieval', (t) => {
  t.plan(2)

  t.doesNotThrow(() => {
    const pool = new DynamicPool()
    t.ok(pool, 'Pool is truthy existing.')
    pool.destroy()
  }, 'Pool does not throw upon instantiation.')

  t.end()
})

test('Dynamic Token: can provide singleton that is of instance DynamicPool', (t) => {
  t.plan(10)

  const singleton1 = require('../../lib/helpers/dbs/pg/dynamic-pool')

  t.ok(singleton1)
  t.ok(singleton1 instanceof DynamicPool)

  const singleton2 = require('../../lib/helpers/dbs/pg/dynamic-pool')
  t.deepEquals(singleton1, singleton2)
  t.ok(Object.is(singleton1, singleton2))

  singleton1.isDirty = true
  t.equals(singleton1.isDirty, true)
  t.equals(singleton2.isDirty, true)
  singleton1.isDirty = false
  t.equals(singleton1.isDirty, false)
  t.equals(singleton2.isDirty, false)

  const pool1 = new DynamicPool()
  const pool2 = new DynamicPool()
  t.notOk(Object.is(singleton1, pool1))
  t.notOk(Object.is(pool1, pool2))

  singleton1.destroy()
  singleton2.destroy()
  pool1.destroy()
  pool2.destroy()

  t.end()
})

test('Dynamic Token: will be initialised w/o and then get credentials', (t) => {
  t.plan(6)
  const callback = sinon.spy((instance, credentials) => {
    t.ok(credentials, 'sucessfully fetched credentials')
    t.ok(Number.isFinite(credentials.lease_duration), 'got a lease and it\'s a Number')
    t.ok(credentials.data.password && typeof credentials.data.password === 'string', 'received password as string')
    t.ok(credentials.data.username && typeof credentials.data.username === 'string', 'received username as string')

    pool.destroy()

    t.ok(callback.calledOnce)
  })

  const pool = new DynamicPool()
  t.equals(pool.credentials, null, 'credentials are not initially')

  pool.on('credentials', callback)
})

test('Dynamic Token: can destroy pool instance', (t) => {
  t.plan(6)

  const pool = new DynamicPool()

  t.equals(pool.credentials, null, 'credentials are not initially')

  pool.once('credentials', (instance, credentials) => {
    t.ok(credentials, 'sucessfully fetched credentials')

    pool.destroy()

    t.equals(pool._expires, null)
    t.equals(pool.destroyed, true)
    t.equals(pool.isDirty, false)
    t.equals(pool.credentials, null)

    t.end()
  })
})
