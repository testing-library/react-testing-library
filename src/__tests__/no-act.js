let act, asyncAct

beforeEach(() => {
  jest.resetModules()
  act = require('../pure').act
  asyncAct = require('../act-compat').asyncAct
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
})

jest.mock('react-dom/test-utils', () => ({}))

test('act works even when there is no act from test utils', () => {
  const callback = jest.fn()
  act(callback)
  expect(callback).toHaveBeenCalledTimes(1)
  expect(console.error).toHaveBeenCalledTimes(0)
})

test('async act works when it does not exist (older versions of react)', async () => {
  const callback = jest.fn()
  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(callback).toHaveBeenCalledTimes(1)

  callback.mockClear()
  console.error.mockClear()

  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(0)
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
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        call console.error,
      ],
    ]
  `)
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
