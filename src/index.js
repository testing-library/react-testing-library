import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'

// we may expose this eventually
function sel(id) {
  return `[data-testid="${id}"]`
}

// we may expose this eventually
function queryDivByTestId(div, id) {
  return div.querySelector(sel(id))
}

function render(ui, {container = document.createElement('div')} = {}) {
  ReactDOM.render(ui, container)
  return {
    container,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
    queryByTestId: queryDivByTestId.bind(null, container),
  }
}

// this returns a new promise and is just a simple way to
// wait until the next tick so resolved promises chains will continue
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

export {render, flushPromises, Simulate}
