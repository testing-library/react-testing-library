import {asyncAct} from '../act-compat'

jest.mock('../react-dom-16.9.0-is-released', () => ({
  reactDomSixteenPointNineIsReleased: true,
}))

jest.mock('react-dom/test-utils', () => ({
  act: cb => {
    const promise = cb()
    return {
      then() {
        console.error('blah, do not do this')
        return promise
      },
    }
  },
}))

test('async act works even when the act is an old one', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  const callback = jest.fn()
  await asyncAct(async () => {
    await Promise.resolve()
    await callback()
  })
  expect(console.error.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "It looks like you're using a version of react-dom that supports the \\"act\\" function, but not an awaitable version of \\"act\\" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.",
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

  console.error.mockRestore()
})

/* eslint no-console:0 */
