<div align="center">
<h1>react-testing-library</h1>

<a href="https://www.emojione.com/emoji/1f410">
<img height="80" width="80" alt="goat" src="https://raw.githubusercontent.com/kentcdodds/react-testing-library/master/other/goat.png" />
</a>

<p>Simple and complete React DOM testing utilities that encourage good testing practices.</p>
</div>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-47-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

You want to write maintainable tests for your React components. As a part of
this goal, you want your tests to avoid including implementation details of your
components and rather focus on making your tests give you the confidence for
which they are intended. As part of this, you want your testbase to be
maintainable in the long run so refactors of your components (changes to
implementation but not functionality) don't break your tests and slow you and
your team down.

## This solution

The `react-testing-library` is a very light-weight solution for testing React
components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices. It's
primary guiding principle is:

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

So rather than dealing with instances of rendered react components, your tests
will work with actual DOM nodes. The utilities this library provides facilitate
querying the DOM in the same way the user would. Finding for elements by their
label text (just like a user would), finding links and buttons from their text
(like a user would). It also exposes a recommended way to find elements by a
`data-testid` as an "escape hatch" for elements where the text content and label
do not make sense or is not practical.

This library encourages your applications to be more accessible and allows you
to get your tests closer to using your components the way a user will, which
allows your tests to give you more confidence that your application will work
when a real user uses it.

This library is a replacement for [enzyme](http://airbnb.io/enzyme/). While you
_can_ follow these guidelines using enzyme itself, enforcing this is harder
because of all the extra utilities that enzyme provides (utilities which
facilitate testing implementation details). Read more about this in
[the FAQ](#faq) below.

**What this library is not**:

1.  A test runner or framework
2.  Specific to a testing framework (though we recommend Jest as our preference,
    the library works with any framework. See
    [Using Without Jest](https://github.com/kentcdodds/dom-testing-library#using-without-jest))

> NOTE: This library is built on top of
> [`dom-testing-library`](https://github.com/kentcdodds/dom-testing-library)
> which is where most of the logic behind the queries is.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [`render`](#render)
  - [`cleanup`](#cleanup)
- [`dom-testing-library` APIs](#dom-testing-library-apis)
  - [`fireEvent(node: HTMLElement, event: Event)`](#fireeventnode-htmlelement-event-event)
  - [`waitForElement`](#waitforelement)
  - [`wait`](#wait)
  - [`within`](#within)
- [`TextMatch`](#textmatch)
- [`query` APIs](#query-apis)
- [`queryAll` and `getAll` APIs](#queryall-and-getall-apis)
- [Examples](#examples)
- [Learning Material](#learning-material)
- [FAQ](#faq)
- [Other Solutions](#other-solutions)
- [Guiding Principles](#guiding-principles)
- [Contributors](#contributors)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
  - [❓ Questions](#-questions)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev react-testing-library
```

This library has a `peerDependencies` listing for `react-dom`.

You may also be interested in installing `jest-dom` so you can use
[the custom jest matchers](https://github.com/gnapse/jest-dom#readme)

## Usage

```javascript
// __tests__/fetch.js
import React from 'react'
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library'
// this add custom jest matchers from jest-dom
import 'jest-dom/extend-expect'
import axiosMock from 'axios' // the mock lives in a __mocks__ directory
import Fetch from '../fetch' // see the tests for a full implementation

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup)

test('Fetch makes an API call and displays the greeting when load-greeting is clicked', async () => {
  // Arrange
  axiosMock.get.mockResolvedValueOnce({data: {greeting: 'hello there'}})
  const url = '/greeting'
  const {getByText, getByTestId, container} = render(<Fetch url={url} />)

  // Act
  fireEvent.click(getByText('Load Greeting'))

  // let's wait for our mocked `get` request promise to resolve
  // wait will wait until the callback doesn't throw an error
  const greetingTextNode = await waitForElement(() =>
    getByTestId('greeting-text'),
  )

  // Assert
  expect(axiosMock.get).toHaveBeenCalledTimes(1)
  expect(axiosMock.get).toHaveBeenCalledWith(url)
  expect(getByTestId('greeting-text')).toHaveTextContent('hello there')
  expect(getByTestId('ok-button')).toHaveAttribute('disabled')
  // snapshots work great with regular DOM nodes!
  expect(container.firstChild).toMatchSnapshot()
})
```

### `render`

Defined as:

```typescript
function render(
  ui: React.ReactElement<any>,
  options?: {
    /* You wont often use this, expand below for docs on options */
  },
): RenderResult
```

Render into a container which is appended to `document.body`. It should be used
with [cleanup](#cleanup):

```javascript
import {render, cleanup} from 'react-testing-library'

afterEach(cleanup)

render(<div />)
```

<details>

<summary>Expand to see documentation on the options</summary>

You wont often need to specify options, but if you ever do, here are the
available options which you could provide as a second argument to `render`.

**container**: By default, `react-testing-library` will create a `div` and
append that div to the `document.body` and this is where your react component
will be rendered. If you provide your own HTMLElement `container` via this
option, it will not be appended to the `document.body` automatically.

For Example: If you are unit testing a `tablebody` element, it cannot be a child
of a `div`. In this case, you can specify a `table` as the render `container`.

```javascript
const table = document.createElement('table')

const {container} = render(<TableBody {...props} />, {
  container: document.body.appendChild(table),
})
```

**baseElement**: If the `container` is specified, then this defaults to that,
otherwise this defaults to `document.documentElement`. This is used as the base
element for the queries as well as what is printed when you use `debug()`.

</details>

In the example above, the `render` method returns an object that has a few
properties:

#### `container`

The containing DOM node of your rendered React Element (rendered using
`ReactDOM.render`). It's a `div`. This is a regular DOM node, so you can call
`container.querySelector` etc. to inspect the children.

> Tip: To get the root element of your rendered element, use
> `container.firstChild`.
>
> NOTE: When that root element is a
> [React Fragment](https://reactjs.org/docs/fragments.html),
> `container.firstChild` will only get the first child of that Fragment, not the
> Fragment itself.

#### `baseElement`

The containing DOM node where your React Element is rendered in the container.
If you don't specify the `baseElement` in the options of `render`, it will
default to `document.body`.

This is useful when the component you want to test renders something outside the
container div, e.g. when you want to snapshot test your portal component which
renders it's HTML directly in the body.

> Note: the queries returned by the `render` looks into baseElement, so you can
> use queries to test your portal component without the baseElement.

#### `debug`

This method is a shortcut for `console.log(prettyDOM(container))`.

```javascript
import {render} from 'react-testing-library'

const HelloWorld = () => <h1>Hello World</h1>
const {debug} = render(<HelloWorld />)
debug()
// <div>
//   <h1>Hello World</h1>
// </div>
// you can also pass an element: debug(getByTestId('messages'))
```

This is a simple wrapper around `prettyDOM` which is also exposed and comes from
[`dom-testing-library`](https://github.com/kentcdodds/dom-testing-library/blob/master/README.md#prettydom).

#### `rerender`

It'd probably be better if you test the component that's doing the prop updating
to ensure that the props are being updated correctly (see
[the Guiding Principles section](#guiding-principles)). That said, if you'd
prefer to update the props of a rendered component in your test, this function
can be used to update props of the rendered component.

```javascript
import {render} from 'react-testing-library'

const {rerender} = render(<NumberDisplay number={1} />)

// re-render the same component with different props
rerender(<NumberDisplay number={2} />)
```

[Open the tests](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/update-props.js)
for a full example of this.

#### `unmount`

This will cause the rendered component to be unmounted. This is useful for
testing what happens when your component is removed from the page (like testing
that you don't leave event handlers hanging around causing memory leaks).

> This method is a pretty small abstraction over
> `ReactDOM.unmountComponentAtNode`

```javascript
import {render} from 'react-testing-library'

const {container, unmount} = render(<Login />)
unmount()
// your component has been unmounted and now: container.innerHTML === ''
```

#### `getByLabelText(text: TextMatch, options: {selector: string = '*'}): HTMLElement`

This will search for the label that matches the given [`TextMatch`](#textmatch),
then find the element associated with that label.

```javascript
import {render} from 'react-testing-library'

const {getByLabelText} = render(<Login />)
const inputNode = getByLabelText('Username')

// this would find the input node for the following DOM structures:
// The "for" attribute (NOTE: in JSX with React you'll write "htmlFor" rather than "for")
// <label for="username-input">Username</label>
// <input id="username-input" />
//
// The aria-labelledby attribute
// <label id="username-label">Username</label>
// <input aria-labelledby="username-label" />
//
// Wrapper labels
// <label>Username <input /></label>
//
// It will NOT find the input node for this:
// <label><span>Username</span> <input /></label>
//
// For this case, you can provide a `selector` in the options:
const inputNode = getByLabelText('username', {selector: 'input'})
// and that would work
// Note that <input aria-label="username" /> will also work, but take
// care because this is not a label that users can see on the page. So
// the purpose of your input should be obvious for those users.
```

> Note: This method will throw an error if it cannot find the node. If you don't
> want this behavior (for example you wish to assert that it doesn't exist),
> then use `queryByLabelText` instead.

#### `getByPlaceholderText(text: TextMatch): HTMLElement`

This will search for all elements with a placeholder attribute and find one that
matches the given [`TextMatch`](#textmatch).

```javascript
import {render} from 'react-testing-library'

const {getByPlaceholderText} = render(<input placeholder="Username" />)
const inputNode = getByPlaceholderText('Username')
```

> NOTE: a placeholder is not a good substitute for a label so you should
> generally use `getByLabelText` instead.

#### `getByText(text: TextMatch): HTMLElement`

This will search for all elements that have a text node with `textContent`
matching the given [`TextMatch`](#textmatch).

```javascript
import {render} from 'react-testing-library'

const {getByText} = render(<a href="/about">About ℹ️</a>)
const aboutAnchorNode = getByText('about')
```

#### `getByAltText(text: TextMatch): HTMLElement`

This will return the element (normally an `<img>`) that has the given `alt`
text. Note that it only supports elements which accept an `alt` attribute:
[`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img),
[`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input),
and [`<area>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area)
(intentionally excluding
[`<applet>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/applet)
as it's deprecated).

```javascript
import {render} from 'react-testing-library'

const {getByAltText} = render(
  <img alt="Incredibles 2 Poster" src="/incredibles-2.png" />,
)
const incrediblesPosterImg = getByAltText(/incredibles.*poster$/i)
```

#### `getByTestId(text: TextMatch): HTMLElement`

A shortcut to `` container.querySelector(`[data-testid="${yourId}"]`) `` (and it
also accepts a [`TextMatch`](#textmatch)).

```javascript
import {render} from 'react-testing-library'

const {getByTestId} = render(<input data-testid="username-input" />)
const usernameInputElement = getByTestId('username-input')
```

> In the spirit of [the guiding principles](#guiding-principles), it is
> recommended to use this only after `getByLabel`, `getByPlaceholderText` or
> `getByText` don't work for your use case. Using `data-testid` attributes do
> not resemble how your software is used and should be avoided if possible. That
> said, they are _way_ better than querying based on DOM structure. Learn more
> about `data-testid`s from the blog post ["Making your UI tests resilient to
> change"][data-testid-blog-post]

### `cleanup`

Unmounts React trees that were mounted with [render](#render).

```javascript
import {cleanup, render} from 'react-testing-library'

afterEach(cleanup)

test('renders into document', () => {
  render(<div />)
  // ...
})
```

Failing to call `cleanup` when you've called `render` could result in a memory
leak and tests which are not "idempotent" (which can lead to difficult to debug
errors in your tests).

**If you don't want to add this to _every single test file_** then we recommend
that you configure your test framework to run a file before your tests which
does this automatically.

For example, to do this with jest, you can use
[`setupTestFrameworkScriptFile`](https://facebook.github.io/jest/docs/en/configuration.html#setuptestframeworkscriptfile-string):

```javascript
// jest.config.js
module.exports = {
  setupTestFrameworkScriptFile: require.resolve('./test/setup-test-env.js'),
}
```

Then:

```javascript
// test/setup-test-env.js

// add some helpful assertions
import 'jest-dom/extend-expect'
// this is basically: afterEach(cleanup)
import 'react-testing-library/cleanup-after-each'
```

Or if you're using react-scripts (create-react-app), it has a default value
that's set to `src/setupTests.js` so put the code above in that file.

## `dom-testing-library` APIs

`react-testing-library` is built on top of
[`dom-testing-library`](https://github.com/kentcdodds/dom-testing-library) and
re-exports everything from `dom-testing-library`. Some notable included exports:

### `fireEvent(node: HTMLElement, event: Event)`

Fire DOM events.

React attaches an event handler on the `document` and handles some DOM events
via event delegation (events bubbling up from a `target` to an ancestor).
Because of this, your `node` must be in the `document.body` for `fireEvent` to
work with React. This is why `render` appends your container to `document.body`.
This is an alternative to simulating Synthetic React Events via
[`Simulate`](https://reactjs.org/docs/test-utils.html#simulate). The benefit of
using `fireEvent` over `Simulate` is that you are testing real DOM events
instead of Synthetic Events. This aligns better with
[the Guiding Principles](#guiding-principles).
([Also Dan Abramov told me to stop use Simulate](https://twitter.com/dan_abramov/status/980807288444383232)).

> NOTE: If you don't like having to use `cleanup` (which we have to do because
> we render into `document.body`) to get `fireEvent` working, then feel free to
> try to chip into making it possible for React to attach event handlers to the
> rendered node rather than the `document`. Learn more here:
> [facebook/react#2043](https://github.com/facebook/react/issues/2043)

```javascript
import {render, cleanup, fireEvent} from 'react-testing-library'

// don't forget to clean up the document.body
afterEach(cleanup)

test('clicks submit button', () => {
  const spy = jest.fn()
  const {getByText} = render(<button onClick={spy}>Submit</button>)

  fireEvent(
    getByText('Submit'),
    new MouseEvent('click', {
      bubbles: true, // click events must bubble for React to see it
      cancelable: true,
    }),
  )

  expect(spy).toHaveBeenCalledTimes(1)
})
```

#### `fireEvent[eventName](node: HTMLElement, eventProperties: Object)`

Convenience methods for firing DOM events. Check out
[dom-testing-library/src/events.js](https://github.com/kentcdodds/dom-testing-library/blob/master/src/events.js)
for a full list as well as default `eventProperties`.

```javascript
import {render, fireEvent} from 'react-testing-library'

const {getByText} = render(<Form />)

// similar to the above example
// click will bubble for React to see it
const rightClick = {button: 2}
fireEvent.click(getByText('Submit'), rightClick)
// default `button` property for click events is set to `0` which is a left click.
```

If you want to trigger the
[`onChange`](https://reactjs.org/docs/dom-elements.html#onchange) handler of a
[controlled component](https://reactjs.org/docs/forms.html#controlled-components)
with a different `event.target.value`, sending `value` through `eventProperties`
won't work like it does with `Simulate`. You need to change the element's
`value` property, then use `fireEvent` to fire a `change` DOM event.

```javascript
import {render, fireEvent} from 'react-testing-library'

const {getByLabelText} = render(<Form />)

const comment = getByLabelText('Comment')
comment.value = 'Great advice, I love your posts!'
fireEvent.change(comment)
```

### `waitForElement`

> [Read full docs from `dom-testing-library`](https://github.com/kentcdodds/dom-testing-library/blob/master/README.md#waitforelement)

```js
import {render, waitForElement} from 'react-testing-library'

test('waiting for an element', async () => {
  const {getByText} = render(<SearchForm />)

  await waitForElement(() => getByText('Search'))
})
```

### `wait`

> [Read full docs from `dom-testing-library`](https://github.com/kentcdodds/dom-testing-library/blob/master/README.md#wait)

It's recommended to prefer `waitForElement`, but this can be helpful on occasion

```javascript
import 'jest-dom/extend-expect'
import {render, wait} from 'react-testing-library'

test('can fill in the form after loaded', async () => {
  const {getByLabelText} = render(<Login />)

  // wait until the callback does not throw an error. In this case, that means
  // it'll wait until the element with the text that says "loading..." is gone.
  await wait(() => expect(queryByText(/loading\.\.\./i).not.toBeInTheDOM()))
  getByLabelText('username').value = 'chucknorris'
  // continue doing stuff
})
```

### `within`

> [Read full docs from `dom-testing-library`](https://github.com/kentcdodds/dom-testing-library/blob/master/README.md#within-and-getqueriesforelement-apis)

The queries returned from `render` are scoped to the entire page. Sometimes,
there is no guarantee that the text, placeholder, or label you want to query is
unique on the page. So you might want to explicitly tell react-render-dom to get
an element only within a particular section of the page. within is a helper
function for this case.

Example: To get the text 'hello' only within a section called 'messages', you
could do:

```javascript
import {render, within} from 'react-testing-library'

// ...

const {getByTestId} = render(/* stuff */)
const messagesSection = getByTestId('messages')
const hello = within(messagesSection).getByText('hello')
```

## `TextMatch`

Several APIs accept a `TextMatch` which can be a `string`, `regex` or a
`function` which returns `true` for a match and `false` for a mismatch.

See [dom-testing-library#textmatch][dom-testing-lib-textmatch] for options.

Examples:

```javascript
import {render, getByText} from 'react-testing-library'

const {container} = render(<div>Hello World</div>)

// WILL find the div:

// Matching a string:
getByText(container, 'Hello World') // full string match
getByText(container, 'llo Worl', {exact: false}) // substring match
getByText(container, 'hello world', {exact: false}) // ignore case

// Matching a regex:
getByText(container, /World/) // substring match
getByText(container, /world/i) // substring match, ignore case
getByText(container, /^hello world$/i) // full string match, ignore case
getByText(container, /Hello W?oRlD/i) // advanced regex

// Matching with a custom function:
getByText(container, (content, element) => content.startsWith('Hello'))

// WILL NOT find the div:

getByText(container, 'Goodbye World') // full string does not match
getByText(container, /hello world/) // case-sensitive regex with different case
// function looking for a span when it's actually a div:
getByText(container, (content, element) => {
  return element.tagName.toLowerCase() === 'span' && content.startsWith('Hello')
})
```

## `query` APIs

Each of the `get` APIs listed in [the `render`](#render) section above have a
complimentary `query` API. The `get` APIs will throw errors if a proper node
cannot be found. This is normally the desired effect. However, if you want to
make an assertion that an element is _not_ present in the DOM, then you can use
the `query` API instead:

```javascript
import {render} from 'react-testing-library'

const {queryByText} = render(<Form />)
const submitButton = queryByText('submit')
expect(submitButton).toBeNull() // it doesn't exist
```

## `queryAll` and `getAll` APIs

Each of the `query` APIs have a corresponding `queryAll` version that always
returns an Array of matching nodes. `getAll` is the same but throws when the
array has a length of 0.

```javascript
import {render} from 'react-testing-library'

const {queryAllByText} = render(<Forms />)
const submitButtons = queryAllByText('submit')
expect(submitButtons).toHaveLength(3) // expect 3 elements
expect(submitButtons[0]).toBeInTheDOM()
```

## Examples

> We're in the process of moving examples to
> [`react-testing-library-examples`](https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples).

You'll find examples of testing with different libraries in
[the `examples` directory](https://github.com/kentcdodds/react-testing-library/blob/master/examples).
Some included are:

- [`react-redux`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-redux.js)
- [`react-router`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-router.js)
- [`react-context`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-context.js)

## Learning Material

- [Migrating from Enzyme shallow rendering to explicit component mocks](https://www.youtube.com/watch?v=LHUdxkThTM0&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u)

- [Confident React](https://www.youtube.com/watch?v=qXRPHRgcXJ0&list=PLV5CVI1eNcJgNqzNwcs4UKrlJdhfDjshf)
- [Test Driven Development with react-testing-library](https://www.youtube.com/watch?v=kCR3JAR7CHE&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u)
- [Testing React and Web Applications](https://kentcdodds.com/workshops/#testing-react-and-web-applications)
- [Build a joke app with TDD](https://medium.com/@mbaranovski/quick-guide-to-tdd-in-react-81888be67c64)
  by [@mbaranovski](https://github.com/mbaranovski)
- [Build a comment feed with TDD](https://medium.freecodecamp.org/how-to-build-sturdy-react-apps-with-tdd-and-the-react-testing-library-47ad3c5c8e47)
  by [@iwilsonq](https://github.com/iwilsonq)
- [A clear way to unit testing React JS components using Jest and react-testing-library](https://www.richardkotze.com/coding/react-testing-library-jest)
  by [Richard Kotze](https://github.com/rkotze)

- [Intro to react-testing-library](https://chrisnoring.gitbooks.io/react/content/testing/react-testing-library.html)
  by [Chris Noring](https://github.com/softchris)
- [Integration testing in React](https://medium.com/@jeffreyrussom/integration-testing-in-react-21f92a55a894)
  by [Jeffrey Russom](https://github.com/qswitcher)

- [React-testing-library have fantastic testing 🐐](https://medium.com/yazanaabed/react-testing-library-have-a-fantastic-testing-198b04699237)
  by [Yazan Aabed](https://github.com/YazanAabeed)

- [Building a React Tooltip Library](https://www.youtube.com/playlist?list=PLMV09mSPNaQmFLPyrfFtpUdClVfutjF5G)
  by [divyanshu013](https://github.com/divyanshu013) and
  [metagrover](https://github.com/metagrover)

Feel free to contribute more!

## FAQ

<details>

<summary>Which get method should I use?</summary>

Based on [the Guiding Principles](#guiding-principles), your test should
resemble how your code (component, page, etc.) is used as much as possible. With
this in mind, we recommend this order of priority:

1.  `getByLabelText`: Only really good for form fields, but this is the number 1
    method a user finds those elements, so it should be your top preference.
2.  `getByPlaceholderText`:
    [A placeholder is not a substitute for a label](https://www.nngroup.com/articles/form-design-placeholders/).
    But if that's all you have, then it's better than alternatives.
3.  `getByText`: Not useful for forms, but this is the number 1 method a user
    finds other elements (like buttons to click), so it should be your top
    preference for non-form elements.
4.  `getByAltText`: If your element is one which supports `alt` text (`img`,
    `area`, and `input`), then you can use this to find that element.
5.  `getByTestId`: The user cannot see (or hear) these, so this is only
    recommended for cases where you can't match by text or it doesn't make sense
    (the text is dynamic).

Other than that, you can also use the `container` to query the rendered
component as well (using the regular
[`querySelector` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)).

</details>

<details>

<summary>Can I write unit tests with this library?</summary>

Definitely yes! You can write unit and integration tests with this library. See
below for more on how to mock dependencies (because this library intentionally
does NOT support shallow rendering) if you want to unit test a high level
component. The tests in this project show several examples of unit testing with
this library.

As you write your tests, keep in mind:

> The more your tests resemble the way your software is used, the more
> confidence they can give you. - [17 Feb 2018][guiding-principle]

</details>

<details>

<summary>What if my app is localized and I don't have access to the text in test?</summary>

This is fairly common. Our first bit of advice is to try to get the default text
used in your tests. That will make everything much easier (more than just using
this utility). If that's not possible, then you're probably best to just stick
with `data-testid`s (which is not bad anyway).

</details>

<details>

<summary>If I can't use shallow rendering, how do I mock out components in tests?</summary>

In general, you should avoid mocking out components (see
[the Guiding Principles section](#guiding-principles)). However if you need to,
then it's pretty trivial using
[Jest's mocking feature](https://facebook.github.io/jest/docs/en/manual-mocks.html).
One case that I've found mocking to be especially useful is for animation
libraries. I don't want my tests to wait for animations to end.

```javascript
jest.mock('react-transition-group', () => {
  const FakeTransition = jest.fn(({children}) => children)
  const FakeCSSTransition = jest.fn(
    props =>
      props.in ? <FakeTransition>{props.children}</FakeTransition> : null,
  )
  return {CSSTransition: FakeCSSTransition, Transition: FakeTransition}
})

test('you can mock things with jest.mock', () => {
  const {getByTestId, queryByTestId} = render(
    <HiddenMessage initialShow={true} />,
  )
  expect(queryByTestId('hidden-message')).toBeTruthy() // we just care it exists
  // hide the message
  fireEvent.click(getByTestId('toggle-message'))
  // in the real world, the CSSTransition component would take some time
  // before finishing the animation which would actually hide the message.
  // So we've mocked it out for our tests to make it happen instantly
  expect(queryByTestId('hidden-message')).toBeNull() // we just care it doesn't exist
})
```

Note that because they're Jest mock functions (`jest.fn()`), you could also make
assertions on those as well if you wanted.

[Open full test](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/mock.react-transition-group.js)
for the full example.

This looks like more work that shallow rendering (and it is), but it gives you
more confidence so long as your mock resembles the thing you're mocking closly
enough.

If you want to make things more like shallow rendering, then you could do
something more
[like this](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/shallow.react-transition-group.js).

Learn more about how Jest mocks work from my blog post:
["But really, what is a JavaScript mock?"](https://blog.kentcdodds.com/but-really-what-is-a-javascript-mock-10d060966f7d)

</details>

<details>

<summary>What if I want to verify that an element does NOT exist?</summary>

You typically will get access to rendered elements using the `getByTestId`
utility. However, that function will throw an error if the element isn't found.
If you want to specifically test for the absence of an element, then you should
use the `queryByTestId` utility which will return the element if found or `null`
if not.

```javascript
expect(queryByTestId('thing-that-does-not-exist')).toBeNull()
```

</details>

<details>

<summary>I really don't like data-testids, but none of the other queries make sense. Do I have to use a data-testid?</summary>

Definitely not. That said, a common reason people don't like the `data-testid`
attribute is they're concerned about shipping that to production. I'd suggest
that you probably want some simple E2E tests that run in production on occasion
to make certain that things are working smoothly. In that case the `data-testid`
attributes will be very useful. Even if you don't run these in production, you
may want to run some E2E tests that run on the same code you're about to ship to
production. In that case, the `data-testid` attributes will be valuable there as
well.

All that said, if you really don't want to ship `data-testid` attributes, then
you can use
[this simple babel plugin](https://www.npmjs.com/package/babel-plugin-react-remove-properties)
to remove them.

If you don't want to use them at all, then you can simply use regular DOM
methods and properties to query elements off your container.

```javascript
const firstLiInDiv = container.querySelector('div li')
const allLisInDiv = container.querySelectorAll('div li')
const rootElement = container.firstChild
```

</details>

<details>

<summary>What if I’m iterating over a list of items that I want to put the data-testid="item" attribute on. How do I distinguish them from each other?</summary>

You can make your selector just choose the one you want by including :nth-child
in the selector.

```javascript
const thirdLiInUl = container.querySelector('ul > li:nth-child(3)')
```

Or you could include the index or an ID in your attribute:

```javascript
<li data-testid={`item-${item.id}`}>{item.text}</li>
```

And then you could use the `getByTestId` utility:

```javascript
const items = [
  /* your items */
]
const {getByTestId} = render(/* your component with the items */)
const thirdItem = getByTestId(`item-${items[2].id}`)
```

</details>

<details>

<summary>What about enzyme is "bloated with complexity and features" and "encourage
poor testing practices"?</summary>

Most of the damaging features have to do with encouraging testing implementation
details. Primarily, these are
[shallow rendering](http://airbnb.io/enzyme/docs/api/shallow.html), APIs which
allow selecting rendered elements by component constructors, and APIs which
allow you to get and interact with component instances (and their
state/properties) (most of enzyme's wrapper APIs allow this).

The guiding principle for this library is:

> The more your tests resemble the way your software is used, the more
> confidence they can give you. - [17 Feb 2018][guiding-principle]

Because users can't directly interact with your app's component instances,
assert on their internal state or what components they render, or call their
internal methods, doing those things in your tests reduce the confidence they're
able to give you.

That's not to say that there's never a use case for doing those things, so they
should be possible to accomplish, just not the default and natural way to test
react components.

</details>

<details>

<summary>Why isn't snapshot diffing working?</summary>

If you use the [snapshot-diff](https://github.com/jest-community/snapshot-diff)
library to save snapshot diffs, it won't work out of the box because this
library uses the DOM which is mutable. Changes don't return new objects so
snapshot-diff will think it's the same object and avoid diffing it.

Luckily there's an easy way to make it work: clone the DOM when passing it into
snapshot-diff. It looks like this:

```js
const firstVersion = container.cloneNode(true)
// Do some changes
snapshotDiff(firstVersion, container.cloneNode(true))
```

</details>

## Other Solutions

In preparing this project,
[I tweeted about it](https://twitter.com/kentcdodds/status/974278185540964352)
and [Sune Simonsen](https://github.com/sunesimonsen)
[took up the challenge](https://twitter.com/sunesimonsen/status/974784783908818944).
We had different ideas of what to include in the library, so I decided to create
this one instead.

## Guiding Principles

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

We try to only expose methods and utilities that encourage you to write tests
that closely resemble how your react components are used.

Utilities are included in this project based on the following guiding
principles:

1.  If it relates to rendering components, it deals with DOM nodes rather than
    component instances, nor should it encourage dealing with component
    instances.
2.  It should be generally useful for testing individual React components or
    full React applications. While this library is focused on `react-dom`,
    utilities could be included even if they don't directly relate to
    `react-dom`.
3.  Utility implementations and APIs should be simple and flexible.

At the end of the day, what we want is for this library to be pretty
light-weight, simple, and understandable.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](https://kentcdodds.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Documentation") [🚇](#infra-kentcdodds "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Tests") | [<img src="https://avatars1.githubusercontent.com/u/2430381?v=4" width="100px;"/><br /><sub><b>Ryan Castner</b></sub>](http://audiolion.github.io)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=audiolion "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8008023?v=4" width="100px;"/><br /><sub><b>Daniel Sandiego</b></sub>](https://www.dnlsandiego.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=dnlsandiego "Code") | [<img src="https://avatars2.githubusercontent.com/u/12592677?v=4" width="100px;"/><br /><sub><b>Paweł Mikołajczyk</b></sub>](https://github.com/Miklet)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=Miklet "Code") | [<img src="https://avatars3.githubusercontent.com/u/464978?v=4" width="100px;"/><br /><sub><b>Alejandro Ñáñez Ortiz</b></sub>](http://co.linkedin.com/in/alejandronanez/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=alejandronanez "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/1402095?v=4" width="100px;"/><br /><sub><b>Matt Parrish</b></sub>](https://github.com/pbomb)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Apbomb "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Tests") | [<img src="https://avatars1.githubusercontent.com/u/1288694?v=4" width="100px;"/><br /><sub><b>Justin Hall</b></sub>](https://github.com/wKovacs64)<br />[📦](#platform-wKovacs64 "Packaging/porting to new platform") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/1241511?s=460&v=4" width="100px;"/><br /><sub><b>Anto Aravinth</b></sub>](https://github.com/antoaravinth)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Tests") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/3462296?v=4" width="100px;"/><br /><sub><b>Jonah Moses</b></sub>](https://github.com/JonahMoses)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=JonahMoses "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/4002543?v=4" width="100px;"/><br /><sub><b>Łukasz Gandecki</b></sub>](http://team.thebrain.pro)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Tests") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/498274?v=4" width="100px;"/><br /><sub><b>Ivan Babak</b></sub>](https://sompylasar.github.io)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Asompylasar "Bug reports") [🤔](#ideas-sompylasar "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/4439618?v=4" width="100px;"/><br /><sub><b>Jesse Day</b></sub>](https://github.com/jday3)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jday3 "Code") | [<img src="https://avatars0.githubusercontent.com/u/15199?v=4" width="100px;"/><br /><sub><b>Ernesto García</b></sub>](http://gnapse.github.io)<br />[💬](#question-gnapse "Answering Questions") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=gnapse "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=gnapse "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2747424?v=4" width="100px;"/><br /><sub><b>Josef Maxx Blake</b></sub>](http://jomaxx.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Tests") |
| [<img src="https://avatars1.githubusercontent.com/u/29602306?v=4" width="100px;"/><br /><sub><b>Michal Baranowski</b></sub>](https://twitter.com/baranovskim)<br />[📝](#blog-mbaranovski "Blogposts") [✅](#tutorial-mbaranovski "Tutorials") | [<img src="https://avatars3.githubusercontent.com/u/13985684?v=4" width="100px;"/><br /><sub><b>Arthur Puthin</b></sub>](https://github.com/aputhin)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=aputhin "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/21194045?v=4" width="100px;"/><br /><sub><b>Thomas Chia</b></sub>](https://github.com/thchia)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=thchia "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=thchia "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/20430611?v=4" width="100px;"/><br /><sub><b>Thiago Galvani</b></sub>](http://ilegra.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=thiagopaiva99 "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/19828824?v=4" width="100px;"/><br /><sub><b>Christian</b></sub>](http://Chriswcs.github.io)<br />[⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=ChrisWcs "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1571667?v=4" width="100px;"/><br /><sub><b>Alex Krolick</b></sub>](https://alexkrolick.com)<br />[💬](#question-alexkrolick "Answering Questions") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=alexkrolick "Documentation") [💡](#example-alexkrolick "Examples") [🤔](#ideas-alexkrolick "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/1239401?v=4" width="100px;"/><br /><sub><b>Johann Hubert Sonntagbauer</b></sub>](https://github.com/johann-sonntagbauer)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Tests") |
| [<img src="https://avatars2.githubusercontent.com/u/2224291?v=4" width="100px;"/><br /><sub><b>Maddi Joyce</b></sub>](http://www.maddijoyce.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=maddijoyce "Code") | [<img src="https://avatars2.githubusercontent.com/u/10080111?v=4" width="100px;"/><br /><sub><b>Ryan Vice</b></sub>](http://www.vicesoftware.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=RyanAtViceSoftware "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/7942604?v=4" width="100px;"/><br /><sub><b>Ian Wilson</b></sub>](https://ianwilson.io)<br />[📝](#blog-iwilsonq "Blogposts") [✅](#tutorial-iwilsonq "Tutorials") | [<img src="https://avatars2.githubusercontent.com/u/1635491?v=4" width="100px;"/><br /><sub><b>Daniel</b></sub>](https://github.com/InExtremaRes)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3AInExtremaRes "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=InExtremaRes "Code") | [<img src="https://avatars0.githubusercontent.com/u/767959?v=4" width="100px;"/><br /><sub><b>Giorgio Polvara</b></sub>](https://twitter.com/Gpx)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3AGpx "Bug reports") [🤔](#ideas-Gpx "Ideas, Planning, & Feedback") | [<img src="https://avatars2.githubusercontent.com/u/132233?v=4" width="100px;"/><br /><sub><b>John Gozde</b></sub>](https://github.com/jgoz)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jgoz "Code") | [<img src="https://avatars0.githubusercontent.com/u/8203211?v=4" width="100px;"/><br /><sub><b>Sam Horton</b></sub>](https://twitter.com/SavePointSam)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=SavePointSam "Documentation") [💡](#example-SavePointSam "Examples") [🤔](#ideas-SavePointSam "Ideas, Planning, & Feedback") |
| [<img src="https://avatars2.githubusercontent.com/u/10452163?v=4" width="100px;"/><br /><sub><b>Richard Kotze (mobile)</b></sub>](http://www.richardkotze.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=rkotze "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/10819833?v=4" width="100px;"/><br /><sub><b>Brahian E. Soto Mercedes</b></sub>](https://github.com/sotobuild)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=sotobuild "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/7151559?v=4" width="100px;"/><br /><sub><b>Benoit de La Forest</b></sub>](https://github.com/bdelaforest)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=bdelaforest "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/6624197?v=4" width="100px;"/><br /><sub><b>Salah</b></sub>](https://github.com/thesalah)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=thesalah "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=thesalah "Tests") | [<img src="https://avatars2.githubusercontent.com/u/370054?v=4" width="100px;"/><br /><sub><b>Adam Gordon</b></sub>](http://gordonizer.com)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Aicfantv "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=icfantv "Code") | [<img src="https://avatars2.githubusercontent.com/u/471278?v=4" width="100px;"/><br /><sub><b>Matija Marohnić</b></sub>](https://silvenon.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=silvenon "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/8015514?v=4" width="100px;"/><br /><sub><b>Justice Mba</b></sub>](https://github.com/Dajust)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=Dajust "Documentation") |
| [<img src="https://avatars2.githubusercontent.com/u/5286559?v=4" width="100px;"/><br /><sub><b>Mark Pollmann</b></sub>](https://markpollmann.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=MarkPollmann "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/1213123?v=4" width="100px;"/><br /><sub><b>Ehtesham Kafeel</b></sub>](https://github.com/ehteshamkafeel)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=ehteshamkafeel "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=ehteshamkafeel "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/1493505?v=4" width="100px;"/><br /><sub><b>Julio Pavón</b></sub>](http://jpavon.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jpavon "Code") | [<img src="https://avatars3.githubusercontent.com/u/1765048?v=4" width="100px;"/><br /><sub><b>Duncan L</b></sub>](http://www.duncanleung.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=duncanleung "Documentation") [💡](#example-duncanleung "Examples") | [<img src="https://avatars1.githubusercontent.com/u/700778?v=4" width="100px;"/><br /><sub><b>Tiago Almeida</b></sub>](https://www.linkedin.com/in/tyagow/?locale=en_US)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=tyagow "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/4982001?v=4" width="100px;"/><br /><sub><b>Robert Smith</b></sub>](http://rbrtsmith.com/)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Arbrtsmith "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/1700355?v=4" width="100px;"/><br /><sub><b>Zach Green</b></sub>](https://offbyone.tech)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=zgreen "Documentation") |
| [<img src="https://avatars3.githubusercontent.com/u/881986?v=4" width="100px;"/><br /><sub><b>dadamssg</b></sub>](https://github.com/dadamssg)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=dadamssg "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8734097?v=4" width="100px;"/><br /><sub><b>Yazan Aabed</b></sub>](https://www.yaabed.com/)<br />[📝](#blog-YazanAabeed "Blogposts") | [<img src="https://avatars0.githubusercontent.com/u/556258?v=4" width="100px;"/><br /><sub><b>Tim</b></sub>](https://github.com/timbonicus)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Atimbonicus "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Tests") | [<img src="https://avatars3.githubusercontent.com/u/6682655?v=4" width="100px;"/><br /><sub><b>Divyanshu Maithani</b></sub>](http://divyanshu.xyz)<br />[✅](#tutorial-divyanshu013 "Tutorials") [📹](#video-divyanshu013 "Videos") | [<img src="https://avatars2.githubusercontent.com/u/9116042?v=4" width="100px;"/><br /><sub><b>Deepak Grover</b></sub>](https://www.linkedin.com/in/metagrover)<br />[✅](#tutorial-metagrover "Tutorials") [📹](#video-metagrover "Videos") |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

### ❓ Questions

For questions related to using the library, please visit a support community
instead of filing an issue on GitHub.

- [Spectrum][spectrum]
- [Reactiflux on Discord][reactiflux]
- [Stack Overflow][stackoverflow]

## LICENSE

MIT

<!--
Links:
-->

<!-- prettier-ignore-start -->

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/kentcdodds/react-testing-library.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/react-testing-library
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/react-testing-library.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/react-testing-library
[version-badge]: https://img.shields.io/npm/v/react-testing-library.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-testing-library
[downloads-badge]: https://img.shields.io/npm/dm/react-testing-library.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/react-testing-library
[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[spectrum]: https://spectrum.chat/react-testing-library
[license-badge]: https://img.shields.io/npm/l/react-testing-library.svg?style=flat-square
[license]: https://github.com/kentcdodds/react-testing-library/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/react-testing-library/blob/master/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/kentcdodds/react-testing-library.svg?style=social
[github-watch]: https://github.com/kentcdodds/react-testing-library/watchers
[github-star-badge]: https://img.shields.io/github/stars/kentcdodds/react-testing-library.svg?style=social
[github-star]: https://github.com/kentcdodds/react-testing-library/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20react-testing-library%20by%20%40kentcdodds%20https%3A%2F%2Fgithub.com%2Fkentcdodds%2Freact-testing-library%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/kentcdodds/react-testing-library.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[set-immediate]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106
[data-testid-blog-post]: https://blog.kentcdodds.com/making-your-ui-tests-resilient-to-change-d37a6ee37269
[dom-testing-lib-textmatch]: https://github.com/kentcdodds/dom-testing-library#textmatch
[bugs]: https://github.com/kentcdodds/react-testing-library/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acreated-desc
[requests]: https://github.com/kentcdodds/react-testing-library/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3Aenhancement+is%3Aopen
[good-first-issue]: https://github.com/kentcdodds/react-testing-library/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"good+first+issue"+
[reactiflux]: https://www.reactiflux.com/
[stackoverflow]: https://stackoverflow.com/questions/tagged/react-testing-library

<!-- prettier-ignore-end -->
