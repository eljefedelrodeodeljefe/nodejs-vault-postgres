const EventEmitter = require('events')
const vault = require('node-vault')()
const debug = require('debug')('demo:pool')

class DynamicPool extends EventEmitter {
  constructor (options) {
    super(options)

    this.options = Object.assign({}, options)

    this.credentials = null
    this.destroyed = false
    this.isDirty = false
    this._expires = null
    this._timeout = null

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
  }

  get expires () {
    return this._expires
  }

  set expires (value) {
    let hasCalled = false
    // before the credentials expire, we
    // will try to get new. The timing will be 90% of TTL
    const willRetrieveNextIn = Math.floor(value * 0.9)
    this._expires = value * 1000

    this._timeout = setTimeout(() => {
      hasCalled = true
      // TODO: there still is a tiny error margin
      // between hasCalled and the return of the next fn
      this.retrieveCredentials()
    }, willRetrieveNextIn * 1000)

    // this timeout dirties the instsance,
    // if the timeout runs, through without having
    // the creds replaced.
    setTimeout(() => {
      if (!hasCalled) this.isDirty = true
    }, this._expires)
  }

  destroy () {
    clearTimeout(this._timeout)

    this._expires = null
    this.destroyed = true
    this.isDirty = false
    this.credentials = null

    this.removeAllListeners()
  }
}

module.exports = DynamicPool
