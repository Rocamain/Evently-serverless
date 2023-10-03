const crypto = require('crypto')
const KSUID = require('ksuid')

module.exports = () => {
  const now = Date.now()
  const payload = crypto.randomBytes(16)
  return `${KSUID.fromParts(now, payload).string}`
}
