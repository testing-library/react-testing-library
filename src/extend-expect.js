import extensions from './jest-extensions'

const {toBeInTheDOM, toHaveTextContent} = extensions
expect.extend({toBeInTheDOM, toHaveTextContent})
