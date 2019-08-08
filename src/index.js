import React from 'react'
import ReactDOM from 'react-dom'
import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
  configure as configureDTL,
} from '@testing-library/dom'
import act, {asyncAct} from './act-compat'

configureDTL({
  asyncWrapper: async cb => {
    let result
    await asyncAct(async () => {
      result = await cb()
    })
    return result
  },
})

const mountedContainers = new Set()

function render(
  ui,
  {
    container,
    baseElement = container,
    queries,
    hydrate = false,
    wrapper: WrapperComponent,
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

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container)

  const wrapUiIfNeeded = innerElement =>
    WrapperComponent
      ? React.createElement(WrapperComponent, null, innerElement)
      : innerElement

  act(() => {
    if (hydrate) {
      ReactDOM.hydrate(wrapUiIfNeeded(ui), container)
    } else {
      ReactDOM.render(wrapUiIfNeeded(ui), container)
    }
  })

  return {
    container,
    baseElement,
    // eslint-disable-next-line no-console
    debug: (el = baseElement) => console.log(prettyDOM(el)),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => {
      render(wrapUiIfNeeded(rerenderUi), {container, baseElement})
      // Intentionally do not return anything to avoid unnecessarily complicating the API.
      // folks can use all the same utilities we return in the first place that are bound to the container
    },
    asFragment: () => {
      /* istanbul ignore if (jsdom limitation) */
      if (typeof document.createRange === 'function') {
        return document
          .createRange()
          .createContextualFragment(container.innerHTML)
      }

      const template = document.createElement('template')
      template.innerHTML = container.innerHTML
      return template.content
    },
    ...getQueriesForElement(baseElement, queries),
  }
}

function cleanup() {
  mountedContainers.forEach(cleanupAtContainer)
}

// maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
function cleanupAtContainer(container) {
  ReactDOM.unmountComponentAtNode(container)
  if (container.parentNode === document.body) {
    document.body.removeChild(container)
  }
  mountedContainers.delete(container)
}

// react-testing-library's version of fireEvent will call
// dom-testing-library's version of fireEvent wrapped inside
// an "act" call so that after all event callbacks have been
// been called, the resulting useEffect callbacks will also
// be called.
function fireEvent(...args) {
  let returnValue
  act(() => {
    returnValue = dtlFireEvent(...args)
  })
  return returnValue
}

Object.keys(dtlFireEvent).forEach(key => {
  fireEvent[key] = (...args) => {
    let returnValue
    act(() => {
      returnValue = dtlFireEvent[key](...args)
    })
    return returnValue
  }
})

// React event system tracks native mouseOver/mouseOut events for
// running onMouseEnter/onMouseLeave handlers
// @link https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/react-dom/src/events/EnterLeaveEventPlugin.js#L24-L31
fireEvent.mouseEnter = fireEvent.mouseOver
fireEvent.mouseLeave = fireEvent.mouseOut

fireEvent.select = (node, init) => {
  // React tracks this event only on focused inputs
  node.focus()

  // React creates this event when one of the following native events happens
  // - contextMenu
  // - mouseUp
  // - dragEnd
  // - keyUp
  // - keyDown
  // so we can use any here
  // @link https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/react-dom/src/events/SelectEventPlugin.js#L203-L224
  fireEvent.keyUp(node, init)
}

// if we're running in a test runner that supports afterEach
// then we'll automatically run cleanup afterEach test
// this ensures that tests run in isolation from each other
if (typeof afterEach === 'function' && !process.env.RTL_SKIP_CLEANUP) {
  afterEach(async () => {
    await asyncAct(async () => {})
    cleanup()
  })
}

// just re-export everything from dom-testing-library
export * from '@testing-library/dom'
export {render, cleanup, fireEvent, act}

// NOTE: we're not going to export asyncAct because that's our own compatibility
// thing for people using react-dom@16.8.0. Anyone else doesn't need it and
// people should just upgrade anyway.

/* eslint func-name-matching:0 */
