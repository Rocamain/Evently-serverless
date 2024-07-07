process.env.NODE_ENV = 'test'
const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `kill-port 4000 && kill-port 8000 && npm run offline --httpPort=4000`,
    launchTimeout: 100000,
    port: 4000,
  })
}
