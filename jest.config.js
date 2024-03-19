const {jest: jestConfig} = require('kcd-scripts/config')

module.exports = Object.assign(jestConfig, {
  coverageThreshold: {
    ...jestConfig.coverageThreshold,
    // Full coverage across the build matrix (React versions) but not in a single job
    // Ful coverage is checked via codecov
    './src/pure.js': {
      // minimum coverage of jobs using different React versions
      branches: 97,
      functions: 88,
      lines: 94,
      statements: 94,
    },
  },
})
