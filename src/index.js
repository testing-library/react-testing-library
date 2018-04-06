import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import {queries, wait} from 'dom-testing-library'

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

export {render, Simulate, wait}
