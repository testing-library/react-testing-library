import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {getQueriesForElement, prettyDOM} from 'dom-testing-library'

function render(ui, {container = document.createElement('div')} = {}) {
  ReactDOM.render(ui, container)
  return {
    container,
    // eslint-disable-next-line no-console
    debug: () => console.log(prettyDOM(container)),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => {
      render(rerenderUi, {container})
      // Intentionally do not return anything to avoid unnecessarily complicating the API.
      // folks can use all the same utilities we return in the first place that are bound to the container
    },
    ...getQueriesForElement(container),
  }
}

const mountedContainers = new Set()

function renderIntoDocument(ui) {
  const container = document.body.appendChild(document.createElement('div'))
  mountedContainers.add(container)
  return render(ui, {container})
}

function cleanup() {
  mountedContainers.forEach(container => {
    document.body.removeChild(container)
    ReactDOM.unmountComponentAtNode(container)
    mountedContainers.delete(container)
  })
}

// fallback to synthetic events for React events that the DOM doesn't support
const syntheticEvents = ['change', 'select', 'mouseEnter', 'mouseLeave']
syntheticEvents.forEach(eventName => {
  document.addEventListener(eventName.toLowerCase(), e => {
    Simulate[eventName](e.target, e)
  })
})

// just re-export everything from dom-testing-library
export * from 'dom-testing-library'
export {render, Simulate, renderIntoDocument, cleanup}
