const { teardown: teardownDevServer } = require('jest-dev-server')
console.log('tear Down')
module.exports = async function globalTeardown() {
  await teardownDevServer(globalThis.servers)
  // Your global teardown
}
