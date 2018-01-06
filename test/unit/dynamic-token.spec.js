const test = require('tape')
const DynamicPool = require('../../lib/helpers/dbs/pg/dynamic-pool/pool')

test('Dynamic Token: can instantiate token retrieval', (t) => {
  t.plan(2)

  t.doesNotThrow(() => {
    const pool = new DynamicPool()
    t.ok(pool, 'Pool is truthy existing.')
  }, 'Pool does not throw upon instantiation.')

  t.end()
})
