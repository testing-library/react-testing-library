import ReactDOM from 'react-dom'
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

// just re-export everything from dom-testing-library
export * from 'dom-testing-library'
export {render, cleanup}

/* eslint func-name-matching:0 */
