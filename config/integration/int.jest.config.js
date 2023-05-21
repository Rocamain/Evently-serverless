const { config } = require('dotenv')
const { resolve } = require('path')

module.exports = {
  // A list of paths to directories that Jest should use to search for files in
  roots: ['../../__tests__/'],

  // The regexp pattern or array of patterns that Jest uses to detect test files

  testMatch: ['**/*.(int).js'],
  moduleFileExtensions: ['js'],

  // The test environment that will be used for testing
  testEnvironment: 'jest-dynalite/environment',

  // A list of paths to modules that run some code to configure or set up the
  // testing framework before each test
  setupFilesAfterEnv: [
    'jest-dynalite/setupTables',
    // Optional (but recommended)
    'jest-dynalite/clearAfterEach',
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'jest-dynalite',

  // Whether to use watchman for file crawling
  watchman: true,
}

config({
  path: resolve(__dirname, '../../.awsenv'),
  bail: 1,
  testEnvironment: 'node',
})
