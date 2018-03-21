import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'

// we may expose this eventually
function select(id) {
  return `[data-testid="${id}"]`
}

// we may expose this eventually
function queryByTestId(div, id) {
  return div.querySelector(select(id))
}

// we may expose this eventually
function getByTestId(div, id) {
  const el = queryByTestId(div, id)
  if (!el) {
    throw new Error(`Unable to find element by ${select(id)}`)
  }
  return el
}

function render(ui, {container = document.createElement('div')} = {}) {
  ReactDOM.render(ui, container)
  return {
    container,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    queryByTestId: queryByTestId.bind(null, container),
    getByTestId: getByTestId.bind(null, container),
  }
}

// this returns a new promise and is just a simple way to
// wait until the next tick so resolved promises chains will continue
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

export {render, flushPromises, Simulate}
