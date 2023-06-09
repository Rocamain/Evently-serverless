const { config } = require('dotenv')
const { resolve } = require('path')

module.exports = {
  testEnvironment: 'node',
  roots: ['../../__tests__/'],
  testMatch: ['**/(createItem-event.e2e).js'],
  testTimeout: 60000 * 7, // 7 minutes timeout
  // Enable this if you're using aws-testing-library
  globalSetup: '../../__tests__/global_setup.js',

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: '../../__tests__/global_tearDown.js',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  coverageProvider: 'v8',
}

// Load environment variables generated by serverless-export-env plugin
config({
  path: resolve(__dirname, '../../.aws.env'),
  bail: 1,
})
