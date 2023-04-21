const crypto = require('crypto')
const KSUID = require('ksuid')

module.exports = (createdAt) => {
  const payload = crypto.randomBytes(16)
  return `${KSUID.fromParts(createdAt.getTime(), payload).string}`
}
