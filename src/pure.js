import * as React from 'react'
import ReactDOM from 'react-dom'
import {
  getQueriesForElement,
  prettyDOM,
  configure as configureDTL,
} from '@testing-library/dom'
import act, {asyncAct} from './act-compat'
import {fireEvent} from './fire-event'

configureDTL({
  asyncWrapper: async cb => {
    let result
    await asyncAct(async () => {
      result = await cb()
    })
    return result
  },
  eventWrapper: cb => {
    let result
    act(() => {
      // TODO: Remove ReactDOM.flushSync once `act` flushes the microtask queue.
      // Otherwise `act` wrapping updates that schedule microtask would need to be followed with `await null` to flush the microtask queue manually
      result = ReactDOM.flushSync(cb)
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

function createConcurrentRoot(container, options) {
  if (typeof ReactDOM.createRoot !== 'function') {
    throw new TypeError(
      `Attempted to use concurrent React with \`react-dom@${ReactDOM.version}\`. Be sure to use the \`next\` or \`experimental\` release channel (https://reactjs.org/docs/release-channels.html).'`,
    )
  }
  const root = ReactDOM.createRoot(container, options)

  return {
    hydrate(element) {
      if (!options.hydrate) {
        throw new Error(
          'Attempted to hydrate a non-hydrateable root. This is a bug in `@testing-library/react`.',
        )
      }
      root.render(element)
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
  {baseElement, container, hydrate, queries, root, wrapper: WrapperComponent},
) {
  const wrapUiIfNeeded = innerElement =>
    WrapperComponent
      ? React.createElement(WrapperComponent, null, innerElement)
      : innerElement

  act(() => {
    if (hydrate) {
      root.hydrate(wrapUiIfNeeded(ui), container)
    } else {
      root.render(wrapUiIfNeeded(ui), container)
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
      renderRoot(wrapUiIfNeeded(rerenderUi), {
        container,
        baseElement,
        root,
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
    concurrent = false,
    queries,
    hydrate = false,
    wrapper,
  } = {},
) {
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
    const createRoot = concurrent ? createConcurrentRoot : createLegacyRoot
    root = createRoot(container, {hydrate})

    mountedRootEntries.push({container, root})
    // we'll add it to the mounted containers regardless of whether it's actually
    // added to document.body so the cleanup method works regardless of whether
    // they're passing us a custom container or not.
    mountedContainers.add(container)
  } else {
    mountedRootEntries.forEach(rootEntry => {
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

// just re-export everything from dom-testing-library
export * from '@testing-library/dom'
export {render, cleanup, act, fireEvent}

// NOTE: we're not going to export asyncAct because that's our own compatibility
// thing for people using react-dom@16.8.0. Anyone else doesn't need it and
// people should just upgrade anyway.

/* eslint func-name-matching:0 */
