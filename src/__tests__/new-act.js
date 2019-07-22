let asyncAct

jest.mock('react-dom/test-utils', () => ({
  act: cb => {
    return cb()
  },
}))

beforeEach(() => {
  jest.resetModules()
  asyncAct = require('../act-compat').asyncAct
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
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
        "call console.error",
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
        "call console.error",
      ],
    ]
  `)
})

/* eslint no-console:0 */
