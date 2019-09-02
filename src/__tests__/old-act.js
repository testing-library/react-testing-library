let asyncAct

beforeEach(() => {
  jest.resetModules()
  asyncAct = require('../act-compat').asyncAct
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  console.error.mockRestore()
})

jest.mock('react-dom/test-utils', () => ({
  act: cb => {
    cb()
    return {
      then() {
        console.error(
          'Warning: Do not await the result of calling ReactTestUtils.act(...), it is not a Promise.',
        )
      },
    }
  },
}))

test('async act works even when the act is an old one', async () => {
  const callback = jest.fn()
  await asyncAct(async () => {
    console.error('sigil')
    await Promise.resolve()
    await callback()
    console.error('sigil')
  })
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "It looks like you're using a version of react-dom that supports the \\"act\\" function, but not an awaitable version of \\"act\\" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.",
      ],
      Array [
        "sigil",
      ],
    ]
  `)
  expect(callback).toHaveBeenCalledTimes(1)

  // and it doesn't warn you twice
  callback.mockClear()
  console.error.mockClear()

  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error).toHaveBeenCalledTimes(0)
  expect(callback).toHaveBeenCalledTimes(1)
})

test('async act recovers from async errors', async () => {
  try {
    await asyncAct(async () => {
      await null
      throw new Error('test error')
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "It looks like you're using a version of react-dom that supports the \\"act\\" function, but not an awaitable version of \\"act\\" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.",
      ],
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

test('async act handles values that are not strings', async () => {
  try {
    await asyncAct(async () => {
      console.error({message: 'some message'})
      await null
    })
  } catch (err) {
    console.error('call console.error')
  }
  expect(console.error).toHaveBeenCalledTimes(2)
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "message": "some message",
        },
      ],
      Array [
        "It looks like you're using a version of react-dom that supports the \\"act\\" function, but not an awaitable version of \\"act\\" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.",
      ],
    ]
  `)
})

/* eslint no-console:0 */
