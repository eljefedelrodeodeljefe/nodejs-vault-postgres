const EventEmitter = require('events')
const vault = require('node-vault')()
const { Pool } = require('pg')
const debug = require('debug')('demo:pool')

class DynamicPool extends EventEmitter {
  constructor (options) {
    super(options)

    this.options = Object.assign({}, options)

    this.credentials = null
    this._pool = null

    this.ready = false
    this.destroyed = false
    this.isDirty = false
    this._expires = null
    this._timeout = null
    this._expiresInTimeout = null

    if (!process.env.hasOwnProperty('VAULT_TOKEN')) {
      throw new Error('dynamic pool: VAULT_TOKEN env is required')
    }

    this.setup()
  }

  async setup () {
    await this.retrieveCredentials()
  }

  credentials () {
    return this.credentials
  }

  async retrieveCredentials () {
    this.emit('before-credentials', this)

    let credentials
    try {
      credentials = await vault.read('database/creds/readonly')
    } catch (err) {
      this.isDirty = true
      if (this.listeners('error').length > 0) this.emit('error', err)

      debug(err)

      return
    }

    this.emit('credentials', this, credentials)

    this.isDirty = false
    this.credentials = credentials
    this.expires = credentials.lease_duration

    this._instantiatePool()
  }

  get expires () {
    return this._expires
  }

  set expires (value) {
    if (this.destroyed) return

    let hasCalled = false
    // before the credentials expire, we
    // will try to get new. The timing will be 90% of TTL
    const willRetrieveNextIn = Math.floor(value * 0.9) * 1000
    this._expires = value * 1000

    this._timeout = setTimeout(() => {
      hasCalled = true
      // TODO: there still is a tiny error margin
      // between hasCalled and the return of the next fn
      this.retrieveCredentials()
    }, willRetrieveNextIn)

    // this timeout dirties the instsance,
    // if the timeout runs, through without having
    // the creds replaced.
    this._expiresInTimeout = setTimeout(() => {
      if (!hasCalled) this.isDirty = true
    }, this._expires)
  }

  destroy () {
    this.destroyed = true
    // interestingly, not calling setImmediate will leak timers here
    setImmediate(() => {
      clearTimeout(this._timeout)
      clearTimeout(this._expiresInTimeout)

      this._expires = null
      this.isDirty = false
      this.credentials = null

      this.removeAllListeners()
    })
  }

  connect (cb) {
    if (!this._pool) return cb(new Error('dynamic pool: no pool instance available'))

    this._pool.connect(cb)
  }

  _instantiatePool () {
    const oldPool = this._pool

    const pool = new Pool({
      host: this.options.host || 'localhost',
      port: this.options.port || 5432,
      database: this.options.database || 'postgres',
      user: this.credentials.data.username,
      password: this.credentials.data.password
    }).on('error', (err) => {
      if (this.listeners('error').length > 0) this.emit('error', err)
      debug(err)
    })

    this._pool = pool

    if (this.ready === false) {
      this.ready = true
      this.emit('ready')
    }

    this._drainPool(oldPool)
  }

  _drainPool (pool, cb) {
    if (!pool) return

    pool.removeAllListeners()

    pool.end(() => {
      debug('pool drained')
    })
  }
}

module.exports = DynamicPool
