const {jest: jestConfig} = require('kcd-scripts/config')

module.exports = Object.assign(jestConfig, {
  coverageThreshold: {
    ...jestConfig.coverageThreshold,
    // Full coverage across the build matrix (React 18, 19) but not in a single job
    // Ful coverage is checked via codecov
    './src/act-compat': {
      branches: 80,
    },
    './src/pure': {
      // minimum coverage of jobs using React 18 and 19
      branches: 90,
      functions: 81,
      lines: 91,
      statements: 91,
    },
  },
})
