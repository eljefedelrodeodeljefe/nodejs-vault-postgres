const DynamicPool = require('./pool')
// provide a singleton for all in-project consumers
module.exports = new DynamicPool()
