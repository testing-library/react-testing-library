import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {queries, wait, fireEvent} from 'dom-testing-library'

function render(ui, {container = document.createElement('div')} = {}) {
  ReactDOM.render(ui, container)
  const containerHelpers = Object.entries(queries).reduce(
    (helpers, [key, fn]) => {
      helpers[key] = fn.bind(null, container)
      return helpers
    },
    {},
  )
  return {
    container,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    ...containerHelpers,
  }
}

function renderIntoDocument(ui) {
  return render(ui, {
    container: document.body.appendChild(document.createElement('div')),
  })
}

function clearDocument() {
  document.body.innerHTML = ''
}

// fallback to synthetic events for DOM events that React doesn't handle
const syntheticEvents = ['change', 'select', 'mouseEnter', 'mouseLeave']
syntheticEvents.forEach(eventName => {
  document.addEventListener(eventName.toLowerCase(), e => {
    Simulate[eventName](e.target, e)
  })
})

export {render, Simulate, wait, fireEvent, renderIntoDocument, clearDocument}
