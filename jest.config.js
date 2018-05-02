const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  testEnvironment: 'jest-environment-jsdom',
  projects: ['./examples', './src'],
})
