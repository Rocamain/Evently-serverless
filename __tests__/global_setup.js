process.env.NODE_ENV = 'test'
const { setup } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setup({
    command: `npx kill-port 8000 && npx kill-port 4000 npm run offline`,
    launchTimeout: 50000,
    waitOnScheme: {
      delay: 1000,
    },

    debug: true,
  })
}
