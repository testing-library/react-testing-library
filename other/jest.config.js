module.exports = {
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    '**/src/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  projects: ['./', './examples'],
}
