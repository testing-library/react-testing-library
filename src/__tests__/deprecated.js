import {flushPromises, waitForExpect} from '../'

test('flushPromises (DEPRECATED) still works', async () => {
  const fn = jest.fn()
  Promise.resolve().then(fn)
  await flushPromises()
  expect(fn).toHaveBeenCalledTimes(1)
})

test('waitForExpect (DEPRECATED) still works', async () => {
  const fn = jest.fn()
  Promise.resolve().then(fn)
  await waitForExpect(() => expect(fn).toHaveBeenCalledTimes(1))
})
