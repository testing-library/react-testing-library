import '@testing-library/jest-dom/extend-expect'

let consoleErrorMock

beforeEach(() => {
  const originalConsoleError = console.error
  consoleErrorMock = jest
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
  consoleErrorMock.mockRestore()
})

// eslint-disable-next-line import/no-extraneous-dependencies -- need the version from React not an explicitly declared one
jest.mock('scheduler', () => require('scheduler/unstable_mock'))
