import expect from 'expect' //eslint-disable-line import/no-extraneous-dependencies
import extensions from './jest-extensions'

const {toBeInTheDOM, toHaveTextContent} = extensions
expect.extend({toBeInTheDOM, toHaveTextContent})

export default expect
