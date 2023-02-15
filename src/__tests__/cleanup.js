import * as React from 'react'
import {render, cleanup} from '../'

test('cleans up the document', () => {
  const spy = jest.fn()
  const divId = 'my-div'

  class Test extends React.Component {
    componentWillUnmount() {
      expect(document.getElementById(divId)).toBeInTheDocument()
      spy()
    }

    render() {
      return <div id={divId} />
    }
  }

  render(<Test />)
  cleanup()
  expect(document.body).toBeEmptyDOMElement()
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup does not error when an element is not a child', () => {
  render(<div />, {container: document.createElement('div')})
  cleanup()
})

test('cleanup runs effect cleanup functions', () => {
  const spy = jest.fn()

  const Test = () => {
    React.useEffect(() => spy)

    return null
  }

  render(<Test />)
  cleanup()
  expect(spy).toHaveBeenCalledTimes(1)
})

describe('fake timers and missing act warnings', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {
      // assert messages explicitly
    })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  test('cleanup does not flush microtasks', () => {
    const microTaskSpy = jest.fn()
    function Test() {
      const counter = 1
      const [, setDeferredCounter] = React.useState(null)
      React.useEffect(() => {
        let cancelled = false
        Promise.resolve().then(() => {
          microTaskSpy()
          // eslint-disable-next-line jest/no-if, jest/no-conditional-in-test -- false positive
          if (!cancelled) {
            setDeferredCounter(counter)
          }
        })

        return () => {
          cancelled = true
        }
      }, [counter])

      return null
    }
    render(<Test />)

    cleanup()

    expect(microTaskSpy).toHaveBeenCalledTimes(0)
    // console.error is mocked
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(0)
  })

  test('cleanup does not swallow missing act warnings', () => {
    const deferredStateUpdateSpy = jest.fn()
    function Test() {
      const counter = 1
      const [, setDeferredCounter] = React.useState(null)
      React.useEffect(() => {
        let cancelled = false
        setTimeout(() => {
          deferredStateUpdateSpy()
          // eslint-disable-next-line jest/no-conditional-in-test -- false-positive
          if (!cancelled) {
            setDeferredCounter(counter)
          }
        }, 0)

        return () => {
          cancelled = true
        }
      }, [counter])

      return null
    }
    render(<Test />)

    jest.runAllTimers()
    cleanup()

    expect(deferredStateUpdateSpy).toHaveBeenCalledTimes(1)
    // console.error is mocked
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line no-console
    expect(console.error.mock.calls[0][0]).toMatch(
      'a test was not wrapped in act(...)',
    )
  })
})
