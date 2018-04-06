import extensions from './jest-extensions'

const {toBeInTheDOM, toHaveTextContent, toHaveAttribute} = extensions
expect.extend({toBeInTheDOM, toHaveTextContent, toHaveAttribute})
