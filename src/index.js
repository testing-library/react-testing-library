import ReactDOM from 'react-dom'
import {Simulate} from 'react-dom/test-utils'
import * as queries from './queries'

function render(
  ui,
  {container = document.createElement('div'), throwRenderError = true} = {},
) {
  try {
    ReactDOM.render(ui, container)
  } catch (error) {
    if (throwRenderError) {
      throw new Error(error)
    }
  }
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

// this returns a new promise and is just a simple way to
// wait until the next tick so resolved promises chains will continue
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

export {render, flushPromises, Simulate}
