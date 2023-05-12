const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `sls export-env --all && npm run offline`,
    launchTimeout: 50000,
    port: 3000,
  })
}
