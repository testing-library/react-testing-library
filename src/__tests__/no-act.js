import {act} from '..'

jest.mock('react-dom/test-utils', () => ({}))

test('act works even when there is no act from test utils', () => {
  const callback = jest.fn()
  act(callback)
  expect(callback).toHaveBeenCalledTimes(1)
})
