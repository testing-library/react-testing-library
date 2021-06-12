import '@testing-library/jest-dom/extend-expect'

beforeEach(() => {
  const originalConsoleError = console.error
  jest
    .spyOn(console, 'error')
    .mockImplementation((message, ...optionalParams) => {
      // Ignore ReactDOM.render/ReactDOM.hydrate deprecation warning
      if (message.indexOf('Use createRoot instead.') !== -1) {
        return
      }
      originalConsoleError(message, ...optionalParams)
    })
})

afterEach(() => {
  // maybe another test already restore console error mocks
  if (typeof console.error.mockRestore === 'function') {
    console.error.mockRestore()
  }
})
