import * as ReactDOM from 'react-dom'

const pure = jest.requireActual('../pure')

const originalRender = pure.render
// Test concurrent react in the experimental release channel
function possiblyConcurrentRender(ui, options) {
  return originalRender(ui, {
    concurrent: ReactDOM.version.includes('-experimental-'),
    ...options,
  })
}
pure.render = possiblyConcurrentRender

module.exports = pure
