const crypto = require('crypto')
const KSUID = require('ksuid')

module.exports = (createdAt, entityName) => {
  const payload = crypto.randomBytes(16)
  return `${entityName}-${KSUID.fromParts(createdAt.getTime(), payload).string}`
}
