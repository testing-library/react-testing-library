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
      result = cb()
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

  const response = {
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
        ReactDOM.unmountComponentAtNode(container)
      })
    },
    rerender: rerenderUi => {
      render(wrapUiIfNeeded(rerenderUi), {container, baseElement})
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
  
  return {
    ...response,
    then: async (callback) => {
      await act(async () => {});
      callback(response);
    }
  }
}

function cleanup() {
  mountedContainers.forEach(cleanupAtContainer)
}

// maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
function cleanupAtContainer(container) {
  act(() => {
    ReactDOM.unmountComponentAtNode(container)
  })
  if (container.parentNode === document.body) {
    document.body.removeChild(container)
  }
  mountedContainers.delete(container)
}

// just re-export everything from dom-testing-library
export * from '@testing-library/dom'
export {render, cleanup, act, fireEvent}

// NOTE: we're not going to export asyncAct because that's our own compatibility
// thing for people using react-dom@16.8.0. Anyone else doesn't need it and
// people should just upgrade anyway.

/* eslint func-name-matching:0 */
