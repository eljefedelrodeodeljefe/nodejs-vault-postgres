// const initVault = require('./lib/vault-init')
const debug = require('debug')('demo')
const serializeErr = require('serialize-error')
const getApiUserCreds = require('../../helpers/vault/get-api-user-credentials')

exports.all = async (req, res, next) => {
  let result
  try {
    result = await getApiUserCreds()
  } catch (err) {
    debug(serializeErr(err))
    return res.status(500).json({
      status: 500
    })
  }

  return res.status(200).json({
    status: 200,
    count: 1,
    results: [
      result
    ]
  })
}

exports.one = (req, res, next) => {
  return res.status(501).json({
    status: 501,
    msg: 'Not implemented yet.'
  })
}
