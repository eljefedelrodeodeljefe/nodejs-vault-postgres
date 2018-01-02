// const initVault = require('./lib/vault-init')
const getApiUserCreds = require('../../helpers/vault/get-api-user-credentials')

exports.all = async (req, res, next) => {
  const result = await getApiUserCreds()

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
