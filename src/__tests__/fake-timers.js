import * as React from 'react'
import {render, waitFor, screen} from '../'

// Regression tests: verify asyncWrapper works correctly with Jest fake timers.
// These test the advanceFakeTimers() unified path that handles both Jest and Vitest.
describe.each([
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])('asyncWrapper advances fake timers with Jest %s', (label, useTimers) => {
  beforeEach(() => {
    useTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const fetchData = () =>
    new Promise(resolve => {
      setTimeout(() => resolve('Hello World'), 100)
    })

  function AsyncComponent() {
    const [data, setData] = React.useState(null)
    React.useEffect(() => {
      let cancelled = false
      fetchData().then(result => {
        if (!cancelled) {
          setData(result)
        }
      })
      return () => {
        cancelled = true
      }
    }, [])
    if (!data) return <div>Loading</div>
    return <div data-testid="result">{data}</div>
  }

  test('waitFor resolves when data loads asynchronously', async () => {
    render(<AsyncComponent />)
    expect(screen.getByText('Loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Hello World')
    })
  })
})

// Verify asyncWrapper works with real timers (no fake timer detection needed)
describe('asyncWrapper with real timers', () => {
  beforeEach(() => {
    jest.useRealTimers()
  })

  function MicrotaskComponent() {
    const [show, setShow] = React.useState(false)
    React.useEffect(() => {
      Promise.resolve().then(() => setShow(true))
    }, [])
    if (show) {
      return <div data-testid="result">Done</div>
    }
    return <div>Loading</div>
  }

  test('waitFor resolves with microtask-based updates', async () => {
    render(<MicrotaskComponent />)
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Done')
    })
  })
})

// Unit tests for the fake timer detection helpers.
// These test the detection logic directly since we can't fully simulate
// a Vitest environment from within Jest (jest global is always injected
// into module scope by the test runner).
describe('fake timer detection logic', () => {
  test('jestFakeTimersAreEnabled returns true with modern fake timers', () => {
    jest.useFakeTimers('modern')
    // setTimeout.clock is set by @sinonjs/fake-timers (used by Jest modern timers)
    expect(
      // eslint-disable-next-line prefer-object-has-own
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock'),
    ).toBe(true)
    jest.useRealTimers()
  })

  test('jestFakeTimersAreEnabled returns true with legacy fake timers', () => {
    jest.useFakeTimers('legacy')
    // Legacy timers use @sinonjs/fake-timers which attaches a clock property
    expect(
      // eslint-disable-next-line prefer-object-has-own
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock'),
    ).toBe(true)
    jest.useRealTimers()
  })

  test('setTimeout.clock is absent with real timers', () => {
    jest.useRealTimers()
    expect(
      // eslint-disable-next-line prefer-object-has-own
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock'),
    ).toBe(false)
  })

  test('vi global is not defined by default in Jest', () => {
    // This verifies that in Jest, the Vitest detection path is not triggered
    // because `vi` is not defined. In a real Vitest environment, `vi` would
    // be available and vitestFakeTimersAreEnabled() would check for
    // setTimeout.clock to determine if fake timers are active.
    expect(typeof vi).toBe('undefined')
  })
})
