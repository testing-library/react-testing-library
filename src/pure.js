import * as React from 'react'
import ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import {
  getQueriesForElement,
  prettyDOM,
  configure as configureDTL,
} from '@testing-library/dom'
import act, {
  getIsReactActEnvironment,
  setReactActEnvironment,
} from './act-compat'
import {fireEvent} from './fire-event'
import {getConfig, configure} from './config'

function jestFakeTimersAreEnabled() {
  /* istanbul ignore else */
  if (typeof jest !== 'undefined' && jest !== null) {
    return (
      // legacy timers
      setTimeout._isMockFunction === true || // modern timers
      // eslint-disable-next-line prefer-object-has-own -- No Object.hasOwn in all target environments we support.
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock')
    )
  } // istanbul ignore next

  return false
}

configureDTL({
  unstable_advanceTimersWrapper: cb => {
    return act(cb)
  },
  // We just want to run `waitFor` without IS_REACT_ACT_ENVIRONMENT
  // But that's not necessarily how `asyncWrapper` is used since it's a public method.
  // Let's just hope nobody else is using it.
  asyncWrapper: async cb => {
    const previousActEnvironment = getIsReactActEnvironment()
    setReactActEnvironment(false)
    try {
      const result = await cb()
      // Drain microtask queue.
      // Otherwise we'll restore the previous act() environment, before we resolve the `waitFor` call.
      // The caller would have no chance to wrap the in-flight Promises in `act()`
      await new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 0)

        if (jestFakeTimersAreEnabled()) {
          jest.advanceTimersByTime(0)
        }
      })

      return result
    } finally {
      setReactActEnvironment(previousActEnvironment)
    }
  },
  eventWrapper: cb => {
    let result
    act(() => {
      result = cb()
    })
    return result
  },
})

// Ideally we'd just use a WeakMap where containers are keys and roots are values.
// We use two variables so that we can bail out in constant time when we render with a new container (most common use case)
/**
 * @type {Set<import('react-dom').Container>}
 */
const mountedContainers = new Set()
/**
 * @type Array<{container: import('react-dom').Container, root: ReturnType<typeof createConcurrentRoot>}>
 */
const mountedRootEntries = []

function strictModeIfNeeded(innerElement, reactStrictMode) {
  return reactStrictMode ?? getConfig().reactStrictMode
    ? React.createElement(React.StrictMode, null, innerElement)
    : innerElement
}

function wrapUiIfNeeded(innerElement, wrapperComponent) {
  return wrapperComponent
    ? React.createElement(wrapperComponent, null, innerElement)
    : innerElement
}

function createConcurrentRoot(
  container,
  {
    hydrate,
    onCaughtError,
    onRecoverableError,
    ui,
    wrapper: WrapperComponent,
    reactStrictMode,
  },
) {
  let root
  if (hydrate) {
    act(() => {
      root = ReactDOMClient.hydrateRoot(
        container,
        strictModeIfNeeded(
          wrapUiIfNeeded(ui, WrapperComponent),
          reactStrictMode,
        ),
        {onCaughtError, onRecoverableError},
      )
    })
  } else {
    root = ReactDOMClient.createRoot(container, {
      onCaughtError,
      onRecoverableError,
    })
  }

  return {
    hydrate() {
      /* istanbul ignore if */
      if (!hydrate) {
        throw new Error(
          'Attempted to hydrate a non-hydrateable root. This is a bug in `@testing-library/react`.',
        )
      }
      // Nothing to do since hydration happens when creating the root object.
    },
    render(element) {
      root.render(element)
    },
    unmount() {
      root.unmount()
    },
  }
}

function createLegacyRoot(container) {
  return {
    hydrate(element) {
      ReactDOM.hydrate(element, container)
    },
    render(element) {
      ReactDOM.render(element, container)
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container)
    },
  }
}

function renderRoot(
  ui,
  {
    baseElement,
    container,
    hydrate,
    queries,
    root,
    wrapper: WrapperComponent,
    reactStrictMode,
  },
) {
  act(() => {
    if (hydrate) {
      root.hydrate(
        strictModeIfNeeded(
          wrapUiIfNeeded(ui, WrapperComponent),
          reactStrictMode,
        ),
        container,
      )
    } else {
      root.render(
        strictModeIfNeeded(
          wrapUiIfNeeded(ui, WrapperComponent),
          reactStrictMode,
        ),
        container,
      )
    }
  })

  return {
    container,
    baseElement,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? // eslint-disable-next-line no-console
          el.forEach(e => console.log(prettyDOM(e, maxLength, options)))
        : // eslint-disable-next-line no-console,
          console.log(prettyDOM(el, maxLength, options)),
    unmount: () => {
      act(() => {
        root.unmount()
      })
    },
    rerender: rerenderUi => {
      renderRoot(rerenderUi, {
        container,
        baseElement,
        root,
        wrapper: WrapperComponent,
        reactStrictMode,
      })
      // Intentionally do not return anything to avoid unnecessarily complicating the API.
      // folks can use all the same utilities we return in the first place that are bound to the container
    },
    asFragment: () => {
      /* istanbul ignore else (old jsdom limitation) */
      if (typeof document.createRange === 'function') {
        return document
          .createRange()
          .createContextualFragment(container.innerHTML)
      } else {
        const template = document.createElement('template')
        template.innerHTML = container.innerHTML
        return template.content
      }
    },
    ...getQueriesForElement(baseElement, queries),
  }
}

function render(
  ui,
  {
    container,
    baseElement = container,
    legacyRoot = false,
    onCaughtError,
    onUncaughtError,
    onRecoverableError,
    queries,
    hydrate = false,
    wrapper,
    reactStrictMode,
  } = {},
) {
  if (onUncaughtError !== undefined) {
    throw new Error(
      'onUncaughtError is not supported. The `render` call will already throw on uncaught errors.',
    )
  }
  if (legacyRoot && typeof ReactDOM.render !== 'function') {
    const error = new Error(
      '`legacyRoot: true` is not supported in this version of React. ' +
        'If your app runs React 19 or later, you should remove this flag. ' +
        'If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.',
    )
    Error.captureStackTrace(error, render)
    throw error
  }

  if (!baseElement) {
    // default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output
    baseElement = document.body
  }
  if (!container) {
    container = baseElement.appendChild(document.createElement('div'))
  }

  let root
  // eslint-disable-next-line no-negated-condition -- we want to map the evolution of this over time. The root is created first. Only later is it re-used so we don't want to read the case that happens later first.
  if (!mountedContainers.has(container)) {
    const createRootImpl = legacyRoot ? createLegacyRoot : createConcurrentRoot
    root = createRootImpl(container, {
      hydrate,
      onCaughtError,
      onRecoverableError,
      ui,
      wrapper,
      reactStrictMode,
    })

    mountedRootEntries.push({container, root})
    // we'll add it to the mounted containers regardless of whether it's actually
    // added to document.body so the cleanup method works regardless of whether
    // they're passing us a custom container or not.
    mountedContainers.add(container)
  } else {
    mountedRootEntries.forEach(rootEntry => {
      // Else is unreachable since `mountedContainers` has the `container`.
      // Only reachable if one would accidentally add the container to `mountedContainers` but not the root to `mountedRootEntries`
      /* istanbul ignore else */
      if (rootEntry.container === container) {
        root = rootEntry.root
      }
    })
  }

  return renderRoot(ui, {
    container,
    baseElement,
    queries,
    hydrate,
    wrapper,
    root,
    reactStrictMode,
  })
}

function cleanup() {
  mountedRootEntries.forEach(({root, container}) => {
    act(() => {
      root.unmount()
    })
    if (container.parentNode === document.body) {
      document.body.removeChild(container)
    }
  })
  mountedRootEntries.length = 0
  mountedContainers.clear()
}

function renderHook(renderCallback, options = {}) {
  const {initialProps, ...renderOptions} = options

  if (renderOptions.legacyRoot && typeof ReactDOM.render !== 'function') {
    const error = new Error(
      '`legacyRoot: true` is not supported in this version of React. ' +
        'If your app runs React 19 or later, you should remove this flag. ' +
        'If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.',
    )
    Error.captureStackTrace(error, renderHook)
    throw error
  }

  const result = React.createRef()

  function TestComponent({renderCallbackProps}) {
    const pendingResult = renderCallback(renderCallbackProps)

    React.useEffect(() => {
      result.current = pendingResult
    })

    return null
  }

  const {rerender: baseRerender, unmount} = render(
    <TestComponent renderCallbackProps={initialProps} />,
    renderOptions,
  )

  function rerender(rerenderCallbackProps) {
    return baseRerender(
      <TestComponent renderCallbackProps={rerenderCallbackProps} />,
    )
  }

  return {result, rerender, unmount}
}

// just re-export everything from dom-testing-library
export * from '@testing-library/dom'
export {render, renderHook, cleanup, act, fireEvent, getConfig, configure}

/* eslint func-name-matching:0 */
