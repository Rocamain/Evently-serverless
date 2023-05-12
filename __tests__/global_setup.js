const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `npx kill-port 3000 && npx kill-port 8000 &&sls export-env --all && npm run offline`,
    launchTimeout: 50000,
    port: 3000,
  })
}
