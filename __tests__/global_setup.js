const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `npm run offline`,
    launchTimeout: 50000,
    port: 3000,
  })
}
