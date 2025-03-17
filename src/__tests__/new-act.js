let actIfEnabled

jest.mock('react', () => {
  return {
    ...jest.requireActual('react'),
    act: cb => {
      return cb()
    },
  }
})

beforeEach(() => {
  jest.resetModules()
  actIfEnabled = require('../act-compat').actIfEnabled
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('async act works when it does not exist (older versions of react)', async () => {
  const callback = jest.fn()
  await actIfEnabled(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(callback).toHaveBeenCalledTimes(1)

  callback.mockClear()
  console.error.mockClear()

  await actIfEnabled(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(callback).toHaveBeenCalledTimes(1)
})

test('async act recovers from errors', async () => {
  try {
    await actIfEnabled(async () => {
      await null
      throw new Error('test error')
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    [
      [
        call console.error,
      ],
    ]
  `)
})

test('async act recovers from sync errors', async () => {
  try {
    await actIfEnabled(() => {
      throw new Error('test error')
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    [
      [
        call console.error,
      ],
    ]
  `)
})

/* eslint no-console:0 */
