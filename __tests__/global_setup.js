process.env.NODE_ENV = 'test'
const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `npm run offline --port 4000`,
    launchTimeout: 50000,
    usedPortAction: 'kill',
    waitOnScheme: {
      delay: 1000,
    },
    host: 'localhost',
    port: 4000,
    debug: true,
  })
}
