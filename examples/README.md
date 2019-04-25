# Examples

Here we have some examples for you to know how to not only use
`react-testing-library` but also in general how to test common scenarios that
pop up with React. Check out the `__tests__` directory for the different
examples.

## Setup

The examples have a unique jest/eslint set up so the test files will resemble
how they might appear in your project. (You'll see in the tests that we can
`import {render} from 'react-testing-library'`).

## Contribute

We're always happy to accept contributions to the examples. Can't have too many
of these as there are TONs of different ways to test React. Examples of testing
components that use different and common libraries is always welcome. Try to
keep examples simple enough for people to understand the main thing we're trying
to demonstrate from the example.

Please follow the guidelines found in [CONTRIBUTING.md][contributing] to set up
the project.

To run the tests, you can run `npm test examples`, or if you're working on a
specific example, you can run `npm test name-of-your-file`. This will put you
into Jest's interactive watch mode with a filter based on the name you provided.

[contributing]:
  https://github.com/testing-library/react-testing-library/blob/master/CONTRIBUTING.md
[jest-dom]: https://github.com/gnapse/jest-dom
