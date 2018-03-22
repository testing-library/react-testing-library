const expect = require('expect') //eslint-disable-line import/no-extraneous-dependencies
const extensions = require('./dist/jest-extensions')

const {toBeInTheDOM, toHaveTextContent, toSatisfyDOM} = extensions.default
expect.extend({toBeInTheDOM, toHaveTextContent, toSatisfyDOM})

module.exports = expect
