import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {getQueriesForElement, prettyDOM, fireEvent} from 'dom-testing-library'

const mountedContainers = new Set()

function render(ui, {container, baseElement = container, queries} = {}) {
  if (!container) {
    // default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output
    baseElement = document.body
    container = document.body.appendChild(document.createElement('div'))
  }

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container)

  ReactDOM.render(ui, container)
  return {
    container,
    baseElement,
    // eslint-disable-next-line no-console
    debug: (el = baseElement) => console.log(prettyDOM(el)),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => {
      render(rerenderUi, {container, baseElement})
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
  if (container.parentNode === document.body) {
    document.body.removeChild(container)
  }
  ReactDOM.unmountComponentAtNode(container)
  mountedContainers.delete(container)
}

const originalChange = fireEvent.change
fireEvent.change = function reactChange(node, init) {
  if (init && init.target && init.target.hasOwnProperty('value')) {
    setNativeValue(node, init.target.value)
  }
  return originalChange(node, init)
}

// function written after some investigation here:
// https://github.com/facebook/react/issues/10135#issuecomment-401496776
function setNativeValue(element, value) {
  const {set: valueSetter} =
    Object.getOwnPropertyDescriptor(element, 'value') || {}
  const prototype = Object.getPrototypeOf(element)
  const {set: prototypeValueSetter} =
    Object.getOwnPropertyDescriptor(prototype, 'value') || {}

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value)
  } else if (valueSetter) {
    valueSetter.call(element, value)
  } else {
    throw new Error('The given element does not have a value setter')
  }
}

// fallback to synthetic events for React events that the DOM doesn't support
const syntheticEvents = ['select', 'mouseEnter', 'mouseLeave']
syntheticEvents.forEach(eventName => {
  document.addEventListener(eventName.toLowerCase(), e => {
    Simulate[eventName](e.target, e)
  })
})

// just re-export everything from dom-testing-library
export * from 'dom-testing-library'
export {render, cleanup}

/* eslint complexity:0, func-name-matching:0 */
