const test = require('tape')
const { DynamicPool } = require('../../lib/helpers/dbs/pg/dynamic-pool')

test('Dymaic Token: can instantiate token retrieval', function (t) {
  t.plan(2)

  t.doesNotThrow(() => {
    const pool = new DynamicPool()
    t.ok(pool, 'Pool is truthy existing.')
  }, 'Pool does not throw upon instantiation.')

  t.end()
})
