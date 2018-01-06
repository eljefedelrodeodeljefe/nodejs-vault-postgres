const EventEmitter = require('events')

class DynamicPool extends EventEmitter {
  constructor (options) {
    super(options)
    this.options = Object.assign({}, options)
  }
}

module.exports = DynamicPool
