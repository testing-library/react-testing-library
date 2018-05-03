import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {bindElementToQueries, wait, fireEvent, waitForElement} from 'dom-testing-library'

function render(ui, {container = document.createElement('div')} = {}) {
  ReactDOM.render(ui, container)
  return {
    container,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    rerender: rerenderUi => render(rerenderUi, {container}),
    ...bindElementToQueries(container),
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

export {
  render,
  Simulate,
  wait,
  waitForElement,
  fireEvent,
  renderIntoDocument,
  cleanup,
}
