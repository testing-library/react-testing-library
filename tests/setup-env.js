import '@testing-library/jest-dom/extend-expect'

afterEach(() => {
  // have to do a dynamic import so we don't mess up jest mocking for old-act.js
  require('../src').cleanup()
})
