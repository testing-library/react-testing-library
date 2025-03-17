import * as React from 'react'
import {render, cleanup} from '../'

test('cleans up the document', async () => {
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

  await render(<Test />)
  await cleanup()
  expect(document.body).toBeEmptyDOMElement()
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup does not error when an element is not a child', async () => {
  await render(<div />, {container: document.createElement('div')})
  await cleanup()
})

test('cleanup runs effect cleanup functions', async () => {
  const spy = jest.fn()

  const Test = () => {
    React.useEffect(() => spy)

    return null
  }

  await render(<Test />)
  await cleanup()
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup cleans up every root and disconnects containers', async () => {
  const {container: container1} = await render(<div />)
  const {container: container2} = await render(<span />)

  await cleanup()

  expect(container1).toBeEmptyDOMElement()
  expect(container1.isConnected).toBe(false)
  expect(container2).toBeEmptyDOMElement()
  expect(container2.isConnected).toBe(false)
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

  test('cleanup does flush microtasks', async () => {
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
          Promise.resolve().then(() => {
            microTaskSpy()
          })
        }
      }, [counter])

      return null
    }
    await render(<Test />)
    expect(microTaskSpy).toHaveBeenCalledTimes(1)

    await cleanup()
    expect(microTaskSpy).toHaveBeenCalledTimes(2)
    // console.error is mocked
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(0)
  })

  test('cleanup does not swallow missing act warnings', async () => {
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
    await render(<Test />)

    jest.runAllTimers()
    await cleanup()

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
