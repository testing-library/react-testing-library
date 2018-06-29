import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {getQueriesForElement, prettyDOM, fireEvent} from 'dom-testing-library'

const mountedContainers = new Set()

function render(ui, {container, baseElement = container} = {}) {
  if (!container) {
    baseElement = document.documentElement
    container = document.body.appendChild(document.createElement('div'))
  }

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container)

  ReactDOM.render(ui, container)
  return {
    container,
    // eslint-disable-next-line no-console
    debug: (el = baseElement) => console.log(prettyDOM(el)),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => {
      render(rerenderUi, {container, baseElement})
      // Intentionally do not return anything to avoid unnecessarily complicating the API.
      // folks can use all the same utilities we return in the first place that are bound to the container
    },
    ...getQueriesForElement(baseElement),
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

// fallback to synthetic events for React events that the DOM doesn't support
// const syntheticEvents = ['change', 'select', 'mouseEnter', 'mouseLeave']
// syntheticEvents.forEach(eventName => {
//   document.addEventListener(eventName.toLowerCase(), e => {
//     Simulate[eventName](e.target, e)
//   })
// })

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

const fireReactEvent = (...args) => fireEvent(...args)
Object.assign(fireReactEvent, fireEvent)

fireReactEvent.change = (node, init) => {
  if (init.value !== undefined) {
    setNativeValue(node, init.value)
  }
  return fireEvent.change(node, init)
}

// just re-export everything from dom-testing-library
export * from 'dom-testing-library'

export {render, cleanup, fireReactEvent}
