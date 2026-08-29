/**
 * Tests for renderAsync - the async variant of render that fully flushes
 * useLayoutEffect chains before returning. This is the fix for components
 * (e.g. React-Aria) that set ARIA attributes / roles in useLayoutEffect and
 * therefore appear "incomplete" when queried immediately after a synchronous
 * render() call in a consuming application's test suite.
 *
 * @see https://github.com/testing-library/react-testing-library/issues/1339
 */
import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import {renderAsync, fireEvent, screen, configure} from '../'

// ---------------------------------------------------------------------------
// Helper: simulates a React-Aria-style component that sets ARIA attributes
// inside useLayoutEffect (and may trigger a follow-up state update).
// ---------------------------------------------------------------------------

/**
 * Mimics a combobox-like component that:
 *  1. Renders a plain <input> on mount.
 *  2. In useLayoutEffect, assigns the `role`, `aria-expanded`, and
 *     `aria-label` attributes that React-Aria would normally set - and also
 *     triggers a state update to simulate a second render cycle.
 */
function AriaComboBox({onSearch}) {
  const inputRef = React.useRef(null)
  const [initialised, setInitialised] = React.useState(false)

  React.useLayoutEffect(() => {
    if (inputRef.current) {
      // Simulate React-Aria setting ARIA attributes after mount
      inputRef.current.setAttribute('role', 'combobox')
      inputRef.current.setAttribute('aria-expanded', 'false')
      inputRef.current.setAttribute('aria-label', 'Search')
      inputRef.current.setAttribute('aria-autocomplete', 'list')
      // Trigger a second render cycle (common in React-Aria internals)
      setInitialised(true)
    }
  }, [])

  return (
    <div>
      <input
        ref={inputRef}
        placeholder="Type to Start Searching..."
        data-initialised={initialised ? 'true' : 'false'}
        onChange={e => onSearch && onSearch(e.target.value)}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('renderAsync', () => {
  test('fully flushes useLayoutEffect before returning - ARIA attributes are present', async () => {
    await renderAsync(<AriaComboBox />)

    // With synchronous render() these attributes would be missing because
    // the useLayoutEffect -> setState -> re-render cycle hasn't completed.
    const input = screen.getByRole('combobox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-label', 'Search')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  test('second render cycle triggered by useLayoutEffect is complete', async () => {
    await renderAsync(<AriaComboBox />)

    const input = screen.getByRole('combobox')
    // data-initialised is set to "true" only after setState in useLayoutEffect
    expect(input).toHaveAttribute('data-initialised', 'true')
  })

  test('returned queries work correctly after async render', async () => {
    const handleSearch = jest.fn()
    const {getByPlaceholderText} = await renderAsync(
      <AriaComboBox onSearch={handleSearch} />,
    )

    const input = getByPlaceholderText('Type to Start Searching...')
    expect(input).toBeInTheDocument()
    // The input should be fully interactive - role is set
    expect(input).toHaveAttribute('role', 'combobox')
  })

  test('rerender (async) also flushes effects', async () => {
    const {rerender, getByRole} = await renderAsync(<AriaComboBox />)

    // Rerender with a new prop - effects should still flush
    await rerender(<AriaComboBox onSearch={() => {}} />)

    const input = getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  test('unmount works after async render', async () => {
    const {unmount} = await renderAsync(<AriaComboBox />)
    expect(() => unmount()).not.toThrow()
  })

  test('accepts the same options as render (wrapper, queries, etc.)', async () => {
    const Context = React.createContext('default')
    function Wrapper({children}) {
      return <Context.Provider value="provided">{children}</Context.Provider>
    }

    function ConsumerComponent() {
      const value = React.useContext(Context)
      return <div data-testid="ctx-value">{value}</div>
    }

    await renderAsync(<ConsumerComponent />, {wrapper: Wrapper})
    expect(screen.getByTestId('ctx-value')).toHaveTextContent('provided')
  })

  test('reactStrictMode option is respected', async () => {
    const effectSpy = jest.fn()
    function Component() {
      React.useEffect(() => {
        effectSpy()
      }, [])
      return null
    }

    await renderAsync(<Component />, {reactStrictMode: true})
    // In StrictMode effects run twice
    expect(effectSpy).toHaveBeenCalledTimes(2)
  })

  test('hydrate makes the UI interactive', async () => {
    function App() {
      const [clicked, handleClick] = React.useReducer(n => n + 1, 0)
      return (
        <button type="button" onClick={handleClick}>
          clicked:{clicked}
        </button>
      )
    }
    const ui = <App />
    const container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = ReactDOMServer.renderToString(ui)

    expect(container).toHaveTextContent('clicked:0')

    await renderAsync(ui, {container, hydrate: true})

    fireEvent.click(container.querySelector('button'))

    expect(container).toHaveTextContent('clicked:1')
  })

  test('legacyRoot throws when React does not support it', async () => {
    // React 19+ does not expose ReactDOM.render
    if (typeof require('react-dom').render !== 'function') {
      await expect(renderAsync(<div />, {legacyRoot: true})).rejects.toThrow(
        '`legacyRoot: true` is not supported',
      )
    }
  })

  describe('reactStrictMode config', () => {
    let originalConfig
    beforeEach(() => {
      configure(existingConfig => {
        originalConfig = existingConfig
        return {}
      })
    })
    afterEach(() => {
      configure(originalConfig)
    })

    test('respects global reactStrictMode config', async () => {
      configure({reactStrictMode: true})
      const effectSpy = jest.fn()
      function Component() {
        React.useEffect(() => {
          effectSpy()
        }, [])
        return null
      }

      await renderAsync(<Component />)
      expect(effectSpy).toHaveBeenCalledTimes(2)
    })
  })
})
