let act, asyncAct, React, consoleErrorMock

beforeEach(() => {
  jest.resetModules()
  act = require('../pure').act
  asyncAct = require('../act-compat').asyncAct
  React = require('react')
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorMock.mockRestore()
})

// no react-dom/test-utils also means no isomorphic act since isomorphic act got released after test-utils act
jest.mock('react-dom/test-utils', () => ({}))
jest.mock('react', () => {
  const ReactActual = jest.requireActual('react')

  delete ReactActual.unstable_act

  return ReactActual
})

test('act works even when there is no act from test utils', () => {
  const callback = jest.fn()
  act(callback)
  expect(callback).toHaveBeenCalledTimes(1)
  expect(console.error).toHaveBeenCalledTimes(
    // ReactDOM.render is deprecated in React 18
    React.version.startsWith('18') ? 1 : 0,
  )
})

test('async act works when it does not exist (older versions of react)', async () => {
  const callback = jest.fn()
  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(
    // ReactDOM.render is deprecated in React 18
    React.version.startsWith('18') ? 2 : 0,
  )
  expect(callback).toHaveBeenCalledTimes(1)

  callback.mockClear()
  console.error.mockClear()

  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(
    // ReactDOM.render is deprecated in React 18
    React.version.startsWith('18') ? 2 : 0,
  )
  expect(callback).toHaveBeenCalledTimes(1)
})

test('async act recovers from errors', async () => {
  try {
    await asyncAct(async () => {
      await null
      throw new Error('test error')
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(
    // ReactDOM.render is deprecated in React 18
    React.version.startsWith('18') ? 2 : 1,
  )
  expect(
    console.error.mock.calls[
      // ReactDOM.render is deprecated in React 18
      React.version.startsWith('18') ? 1 : 0
    ][0],
  ).toMatch('call console.error')
})

test('async act recovers from sync errors', async () => {
  try {
    await asyncAct(() => {
      throw new Error('test error')
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        call console.error,
      ],
    ]
  `)
})

/* eslint no-console:0 */
