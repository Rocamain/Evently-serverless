process.env.NODE_ENV = 'test'
const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `npm run offline`,
    launchTimeout: 50000,
    debug: true,
  })
}
