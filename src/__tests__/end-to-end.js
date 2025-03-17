/* eslint-disable jest/no-conditional-in-test, jest/no-if, jest/no-conditional-expect -- different behavior based on React version */
let React, cleanup, render, screen, waitFor, waitForElementToBeRemoved

describe.each([
  ['real timers', () => jest.useRealTimers()],
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])(
  'it waits for the data to be loaded in a macrotask using %s',
  (label, useTimers) => {
    beforeEach(() => {
      jest.resetModules()
      global.IS_REACT_ACT_ENVIRONMENT = true
      process.env.RTL_SKIP_AUTO_CLEANUP = '0'

      useTimers()

      React = require('react')
      ;({
        cleanup,
        render,
        screen,
        waitFor,
        waitForElementToBeRemoved,
      } = require('..'))
    })

    afterEach(async () => {
      await cleanup()
      global.IS_REACT_ACT_ENVIRONMENT = false
      jest.useRealTimers()
    })

    const fetchAMessageInAMacrotask = () =>
      new Promise(resolve => {
        // we are using random timeout here to simulate a real-time example
        // of an async operation calling a callback at a non-deterministic time
        const randomTimeout = Math.floor(Math.random() * 100)
        setTimeout(() => {
          resolve({returnedMessage: 'Hello World'})
        }, randomTimeout)
      })

    function ComponentWithMacrotaskLoader() {
      const [state, setState] = React.useState({data: undefined, loading: true})
      React.useEffect(() => {
        let cancelled = false
        fetchAMessageInAMacrotask().then(data => {
          if (!cancelled) {
            setState({data, loading: false})
          }
        })

        return () => {
          cancelled = true
        }
      }, [])

      if (state.loading) {
        return <div>Loading...</div>
      }

      return (
        <div data-testid="message">
          Loaded this message: {state.data.returnedMessage}!
        </div>
      )
    }

    test('waitForElementToBeRemoved', async () => {
      await render(<ComponentWithMacrotaskLoader />)
      const loading = () => screen.getByText('Loading...')
      await waitForElementToBeRemoved(loading)
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    })

    test('waitFor', async () => {
      await render(<ComponentWithMacrotaskLoader />)
      await waitFor(() => screen.getByText(/Loading../))
      await waitFor(() => screen.getByText(/Loaded this message:/))
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    })

    test('findBy', async () => {
      await render(<ComponentWithMacrotaskLoader />)
      await expect(screen.findByTestId('message')).resolves.toHaveTextContent(
        /Hello World/,
      )
    })
  },
)

describe.each([
  ['real timers', () => jest.useRealTimers()],
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])(
  'it waits for the data to be loaded in many microtask using %s',
  (label, useTimers) => {
    beforeEach(() => {
      jest.resetModules()
      global.IS_REACT_ACT_ENVIRONMENT = true
      process.env.RTL_SKIP_AUTO_CLEANUP = '0'

      useTimers()

      React = require('react')
      ;({
        cleanup,
        render,
        screen,
        waitFor,
        waitForElementToBeRemoved,
      } = require('..'))
    })

    afterEach(async () => {
      await cleanup()
      global.IS_REACT_ACT_ENVIRONMENT = false
      jest.useRealTimers()
    })

    const fetchAMessageInAMicrotask = () =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({title: 'Hello World'}),
      })

    function ComponentWithMicrotaskLoader() {
      const [fetchState, setFetchState] = React.useState({fetching: true})

      React.useEffect(() => {
        if (fetchState.fetching) {
          fetchAMessageInAMicrotask().then(res => {
            return (
              res
                .json()
                // By spec, the runtime can only yield back to the event loop once
                // the microtask queue is empty.
                // So we ensure that we actually wait for that as well before yielding back from `waitFor`.
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => data)
                .then(data => {
                  setFetchState({todo: data.title, fetching: false})
                })
            )
          })
        }
      }, [fetchState])

      if (fetchState.fetching) {
        return <p>Loading..</p>
      }

      return (
        <div data-testid="message">Loaded this message: {fetchState.todo}</div>
      )
    }

    test('waitForElementToBeRemoved', async () => {
      await render(<ComponentWithMicrotaskLoader />)
      const loading = () => screen.getByText('Loading..')
      // Already flushed microtasks so we'll never see the loading state in a test.
      expect(loading).toThrowError(/Unable to find an element with the text/)
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    })

    test('waitFor is not needed since microtasks are flushed', async () => {
      await render(<ComponentWithMicrotaskLoader />)

      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    })

    test('findBy', async () => {
      await render(<ComponentWithMicrotaskLoader />)
      await expect(screen.findByTestId('message')).resolves.toHaveTextContent(
        /Hello World/,
      )
    })
  },
)

describe.each([
  ['real timers', () => jest.useRealTimers()],
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])(
  'it waits for the data to be loaded in a microtask using %s',
  (label, useTimers) => {
    beforeEach(() => {
      jest.resetModules()
      global.IS_REACT_ACT_ENVIRONMENT = true
      process.env.RTL_SKIP_AUTO_CLEANUP = '0'

      useTimers()

      React = require('react')
      ;({
        cleanup,
        render,
        screen,
        waitFor,
        waitForElementToBeRemoved,
      } = require('..'))
    })

    afterEach(async () => {
      await cleanup()
      global.IS_REACT_ACT_ENVIRONMENT = false
      jest.useRealTimers()
    })

    const fetchAMessageInAMicrotask = () =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({title: 'Hello World'}),
      })

    function ComponentWithMicrotaskLoader() {
      const [fetchState, setFetchState] = React.useState({fetching: true})

      React.useEffect(() => {
        if (fetchState.fetching) {
          fetchAMessageInAMicrotask().then(res => {
            return res.json().then(data => {
              setFetchState({todo: data.title, fetching: false})
            })
          })
        }
      }, [fetchState])

      if (fetchState.fetching) {
        return <p>Loading..</p>
      }

      return (
        <div data-testid="message">Loaded this message: {fetchState.todo}</div>
      )
    }

    test('waitFor', async () => {
      await render(<ComponentWithMicrotaskLoader />)
      // Already flushed microtasks from `ComponentWithMicrotaskLoader` here.
      expect(screen.queryByText('Loading..')).not.toBeInTheDocument()
      expect(screen.getByText(/Loaded this message:/)).toBeInTheDocument()
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    })

    test('findBy', async () => {
      await render(<ComponentWithMicrotaskLoader />)
      await expect(screen.findByTestId('message')).resolves.toHaveTextContent(
        /Hello World/,
      )
    })
  },
)

describe.each([
  ['real timers', () => jest.useRealTimers()],
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])('testing intermediate states using %s', (label, useTimers) => {
  let isReact18

  beforeEach(() => {
    jest.resetModules()
    global.IS_REACT_ACT_ENVIRONMENT = false
    process.env.RTL_SKIP_AUTO_CLEANUP = '0'

    useTimers()

    React = require('react')
    isReact18 = typeof React.use !== 'function'
    ;({
      cleanup,
      render,
      screen,
      waitFor,
      waitForElementToBeRemoved,
    } = require('..'))
  })

  afterEach(async () => {
    await cleanup()
    jest.useRealTimers()
    global.IS_REACT_ACT_ENVIRONMENT = true
  })

  const fetchAMessageInAMicrotask = () =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({title: 'Hello World'}),
    })

  function ComponentWithMicrotaskLoader() {
    const [fetchState, setFetchState] = React.useState({fetching: true})

    React.useEffect(() => {
      if (fetchState.fetching) {
        fetchAMessageInAMicrotask().then(res => {
          return res.json().then(data => {
            setFetchState({todo: data.title, fetching: false})
          })
        })
      }
    }, [fetchState])

    if (fetchState.fetching) {
      return <p>Loading..</p>
    }

    return (
      <div data-testid="message">Loaded this message: {fetchState.todo}</div>
    )
  }

  test('waitFor', async () => {
    const {container} = await render(<ComponentWithMicrotaskLoader />)

    if (isReact18 && label !== 'real timers') {
      // React 18 has no sync updates by default so we need to wait for the commit.
      expect(container).toHaveProperty('textContent', '')

      await waitFor(() => {
        expect(container).not.toHaveProperty('textContent', '')
      })

      // But we can't assert on the intermediate state.
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    } else {
      await waitFor(() => {
        expect(screen.getByText('Loading..')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
      })
    }
  })

  test('findBy', async () => {
    const {container} = await render(<ComponentWithMicrotaskLoader />)

    if (isReact18 && label !== 'real timers') {
      // React 18 has no sync updates by default so we need to wait for the commit.
      expect(container).toHaveProperty('textContent', '')

      await expect(screen.findByText('Loading..')).rejects.toThrow(
        'Unable to find an element',
      )

      // But we can't assert on the intermediate state.
      expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
    } else {
      await expect(screen.findByText('Loading..')).resolves.toBeInTheDocument()

      await expect(
        screen.findByText(/Loaded this message:/),
      ).resolves.toBeInTheDocument()
    }
  })
})
