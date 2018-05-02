const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  rootDir: __dirname,
  displayName: 'example',
  setupTestFrameworkScriptFile: require.resolve('../other/setup-test-env'),
  moduleNameMapper: {
    // this is just here so our examples look like they would in a real project
    'react-testing-library': require.resolve('../src'),
  },
})
