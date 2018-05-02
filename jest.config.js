const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  displayName: 'library',
  setupTestFrameworkScriptFile: require.resolve('./other/setup-test-env'),
})
