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
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-18-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

You want to write maintainable tests for your React components. As a part of
this goal, you want your tests to avoid including implementation details of
your components and rather focus on making your tests give you the confidence
for which they are intended. As part of this, you want your testbase to be
maintainable in the long run so refactors of your components (changes to
implementation but not functionality) don't break your tests and slow you and
your team down.

## This solution

The `react-testing-library` is a very light-weight solution for testing React
components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices.
It's primary guiding principle is:

> [The more your tests resemble the way your software is used, the more confidence they can give you.][guiding-principle]

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
2.  Specific to a testing framework (though we recommend Jest as our
    preference, the library works with any framework)

> NOTE: This library is built on top of
> [`dom-testing-library`](https://github.com/kentcdodds/dom-testing-library)
> which is where most of the logic behind the queries is.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Installation](#installation)
* [Usage](#usage)
  * [`render`](#render)
  * [`renderIntoDocument`](#renderintodocument)
  * [`cleanup`](#cleanup)
  * [`Simulate`](#simulate)
  * [`wait`](#wait)
  * [`fireEvent(node: HTMLElement, event: Event)`](#fireeventnode-htmlelement-event-event)
* [`TextMatch`](#textmatch)
* [`query` APIs](#query-apis)
* [Examples](#examples)
* [FAQ](#faq)
* [Other Solutions](#other-solutions)
* [Guiding Principles](#guiding-principles)
* [Contributors](#contributors)
* [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev react-testing-library
```

This library has a `peerDependencies` listing for `react-dom`.

You may also be interested in installing `dom-testing-library` so you can use
[the custom jest matchers](https://github.com/kentcdodds/dom-testing-library/blob/master/README.md#custom-jest-matchers)

## Usage

```javascript
// __tests__/fetch.js
import React from 'react'
import {render, Simulate, wait} from 'react-testing-library'
// this add custom expect matchers from dom-testing-library
import 'dom-testing-library/extend-expect'
import axiosMock from 'axios' // the mock lives in a __mocks__ directory
import Fetch from '../fetch' // see the tests for a full implementation

test('Fetch makes an API call and displays the greeting when load-greeting is clicked', async () => {
  // Arrange
  axiosMock.get.mockImplementationOnce(() =>
    Promise.resolve({
      data: {greeting: 'hello there'},
    }),
  )
  const url = '/greeting'
  const {getByText, getByTestId, container} = render(<Fetch url={url} />)

  // Act
  Simulate.click(getByText('Load Greeting'))

  // let's wait for our mocked `get` request promise to resolve
  // wait will wait until the callback doesn't throw an error
  await wait(() => getByTestId('greeting-text'))

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

In the example above, the `render` method returns an object that has a few
properties:

#### `container`

The containing DOM node of your rendered React Element (rendered using
`ReactDOM.render`). It's a `div`. This is a regular DOM node, so you can call
`container.querySelector` etc. to inspect the children.

> Tip: To get the root element of your rendered element, use `container.firstChild`.

#### `unmount`

This will cause the rendered component to be unmounted. This is useful for
testing what happens when your component is removed from the page (like testing
that you don't leave event handlers hanging around causing memory leaks).

> This method is a pretty small abstraction over
> `ReactDOM.unmountComponentAtNode`

```javascript
const {container, unmount} = render(<Login />)
unmount()
// your component has been unmounted and now: container.innerHTML === ''
```

#### `getByLabelText(text: TextMatch, options: {selector: string = '*'}): HTMLElement`

This will search for the label that matches the given [`TextMatch`](#textmatch),
then find the element associated with that label.

```javascript
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

This will search for all elements with a placeholder attribute and find one
that matches the given [`TextMatch`](#textmatch).

```javascript
// <input placeholder="Username" />
const inputNode = getByPlaceholderText('Username')
```

> NOTE: a placeholder is not a good substitute for a label so you should
> generally use `getByLabelText` instead.

#### `getByText(text: TextMatch): HTMLElement`

This will search for all elements that have a text node with `textContent`
matching the given [`TextMatch`](#textmatch).

```javascript
// <a href="/about">About ℹ️</a>
const aboutAnchorNode = getByText('about')
```

#### `getByAltText(text: TextMatch): HTMLElement`

This will return the element (normally an `<img>`) that has the given `alt`
text. Note that it only supports elements which accept an `alt` attribute:
[`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img),
[`<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input),
and [`<area>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area)
(intentionally excluding [`<applet>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/applet) as it's deprecated).

```javascript
// <img alt="Incredibles 2 Poster" src="/incredibles-2.png" />
const incrediblesPosterImg = getByAltText(/incredibles.*poster$/i)
```

#### `getByTestId(text: TextMatch): HTMLElement`

A shortcut to `` container.querySelector(`[data-testid="${yourId}"]`) `` (and it
also accepts a [`TextMatch`](#textmatch)).

```javascript
// <input data-testid="username-input" />
const usernameInputElement = getByTestId('username-input')
```

> In the spirit of [the guiding principles](#guiding-principles), it is
> recommended to use this only after `getByLabel`, `getByPlaceholderText` or
> `getByText` don't work for your use case. Using data-testid attributes do
> not resemble how your software is used and should be avoided if possible.
> That said, they are _way_ better than querying based on DOM structure.
> Learn more about `data-testid`s from the blog post
> ["Making your UI tests resilient to change"][data-testid-blog-post]

### `renderIntoDocument`

Render into `document.body`. Should be used with [cleanup](#cleanup)

```javascript
renderIntoDocument(<div>)
```

### `cleanup`

Unmounts React trees that were mounted with [renderIntoDocument](#renderintodocument).

```javascript
afterEach(cleanup)

test('renders into document', () => {
  renderIntoDocument(<div>)
  // ...
})
```

Failing to call `cleanup` when you've called `renderIntoDocument` could
result in a memory leak and tests which are not `idempotent` (which can
lead to difficult to debug errors in your tests).

### `Simulate`

This is simply a re-export from the `Simulate` utility from
`react-dom/test-utils`. See [the docs](https://reactjs.org/docs/test-utils.html#simulate).

### `wait`

Defined as:

```typescript
function wait(
  callback?: () => void,
  options?: {
    timeout?: number
    interval?: number
  },
): Promise<void>
```

When in need to wait for non-deterministic periods of time you can use `wait`,
to wait for your expectations to pass. The `wait` function is a small wrapper
around the
[`wait-for-expect`](https://github.com/TheBrainFamily/wait-for-expect) module.
Here's a simple example:

```javascript
// ...
// wait until the callback does not throw an error. In this case, that means
// it'll wait until we can get a form control with a label that matches "username"
await wait(() => getByLabelText('username'))
getByLabelText('username').value = 'chucknorris'
// ...
```

This can be useful if you have a unit test that mocks API calls and you need
to wait for your mock promises to all resolve. This can also be useful when
(for example) you integration test your apollo-connected react components that
go a couple level deep, with queries fired up in consequent components.

The default `callback` is a no-op function (used like `await wait()`). This can
be helpful if you only need to wait for one tick of the event loop.

The default `timeout` is `4500ms` which will keep you under
[Jest's default timeout of `5000ms`](https://facebook.github.io/jest/docs/en/jest-object.html#jestsettimeouttimeout).

The default `interval` is `50ms`. However it will run your callback immediately
on the next tick of the event loop (in a `setTimeout`) before starting the
intervals.

### `fireEvent(node: HTMLElement, event: Event)`

Fire DOM events.

React attaches an event handler on the `document` and handles some DOM events
via event delegation (events bubbling up from a `target` to an ancestor). Because
of this, your `node` must be in the `document.body` for `fireEvent` to work with
React. You can render into the document using the
[renderIntoDocument](#renderintodocument) utility. This is an alternative to
simulating Synthetic React Events via [Simulate](#simulate). The benefit of
using `fireEvent` over `Simulate` is that you are testing real DOM events
instead of Synthetic Events. This aligns better with
[the Guiding Principles](#guiding-principles).

> NOTE: If you don't like having to render into the document to get `fireEvent`
> working, then feel free to try to chip into making it possible for React
> to attach event handlers to the rendered node rather than the `document`.
> Learn more here:
> [facebook/react#2043](https://github.com/facebook/react/issues/2043)

```javascript
import {
  renderIntoDocument,
  cleanup,
  render,
  fireEvent,
} from 'react-testing-library'

// don't forget to clean up the document.body
afterEach(cleanup)

test('clicks submit button', () => {
  const spy = jest.fn()
  const {getByText} = renderIntoDocument(<button onClick={spy}>Submit</button>)

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
// similar to the above example
// click will bubble for React to see it
const rightClick = {button: 2}
fireEvent.click(getElementByText('Submit'), rightClick)
// default `button` property for click events is set to `0` which is a left click.
```

## `TextMatch`

Several APIs accept a `TextMatch` which can be a `string`, `regex` or a
`function` which returns `true` for a match and `false` for a mismatch.

Here's an example

```javascript
// <div>Hello World</div>
// all of the following will find the div
getByText('Hello World') // full match
getByText('llo worl') // substring match
getByText('hello world') // strings ignore case
getByText(/Hello W?oRlD/i) // regex
getByText((content, element) => content.startsWith('Hello')) // function

// all of the following will NOT find the div
getByText('Goodbye World') // non-string match
getByText(/hello world/) // case-sensitive regex with different case
// function looking for a span when it's actually a div
getByText((content, element) => {
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
const submitButton = queryByText('submit')
expect(submitButton).toBeNull() // it doesn't exist
```

## Examples

You'll find examples of testing with different libraries in
[the test directory](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__).
Some included are:

* [`react-redux`](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/react-redux.js)
* [`react-router`](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/react-router.js)

Examples of TDD with react-testing-library:

* [`TDD-React`](https://medium.com/@mbaranovski/quick-guide-to-tdd-in-react-81888be67c64)

Feel free to contribute more!

## FAQ

<details>

<summary>Which get method should I use?</summary>

Based on [the Guiding Principles](#guiding-principles), your test should
resemble how your code (component, page, etc.) as much as possible. With this
in mind, we recommend this order of priority:

1.  `getByLabelText`: Only really good for form fields, but this is the number 1
    method a user finds those elements, so it should be your top preference.
2.  `getByPlaceholderText`: [A placeholder is not a substitute for a label](https://www.nngroup.com/articles/form-design-placeholders/).
    But if that's all you have, then it's better than alternatives.
3.  `getByText`: Not useful for forms, but this is the number 1 method a user
    finds other elements (like buttons to click), so it should be your top
    preference for non-form elements.
4.  `getByAltText`: If your element is one which supports `alt` text
    (`img`, `area`, and `input`), then you can use this to find that element.
5.  `getByTestId`: The user cannot see (or hear) these, so this is only
    recommended for cases where you can't match by text or it doesn't make sense
    (the text is dynamic).

Other than that, you can also use the `container` to query the rendered
component as well (using the regular
[`querySelector` API](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)).

</details>

<details>

<summary>Can I write unit tests with this library?</summary>

Definitely yes! You can write unit and integration tests with this library.
See below for more on how to mock dependencies (because this library
intentionally does NOT support shallow rendering) if you want to unit test a
high level component. The tests in this project show several examples of
unit testing with this library.

As you write your tests, keep in mind:

> The more your tests resemble the way your software is used, the more confidence they can give you. - [17 Feb 2018][guiding-principle]

</details>

<details>

<summary>What if my app is localized and I don't have access to the text in test?</summary>

This is fairly common. Our first bit of advice is to try to get the default
text used in your tests. That will make everything much easier (more than just
using this utility). If that's not possible, then you're probably best
to just stick with `data-testid`s (which is not bad anyway).

</details>

<details>

<summary>How do I update the props of a rendered component?</summary>

It'd probably be better if you test the component that's doing the prop updating
to ensure that the props are being updated correctly (see
[the Guiding Principles section](#guiding-principles)). That said, if you'd
prefer to update the props of a rendered component in your test, the easiest
way to do that is:

```javascript
const {container, getByTestId} = render(<NumberDisplay number={1} />)
expect(getByTestId('number-display').textContent).toBe('1')

// re-render the same component with different props
// but pass the same container in the options argument.
// which will cause a re-render of the same instance (normal React behavior).
render(<NumberDisplay number={2} />, {container})
expect(getByTestId('number-display').textContent).toBe('2')
```

[Open the tests](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/number-display.js)
for a full example of this.

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
  Simulate.click(getByTestId('toggle-message'))
  // in the real world, the CSSTransition component would take some time
  // before finishing the animation which would actually hide the message.
  // So we've mocked it out for our tests to make it happen instantly
  expect(queryByTestId('hidden-message')).toBeNull() // we just care it doesn't exist
})
```

Note that because they're Jest mock functions (`jest.fn()`), you could also make
assertions on those as well if you wanted.

[Open full test](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/mock.react-transition-group.js)
for the full example.

This looks like more work that shallow rendering (and it is), but it gives you
more confidence so long as your mock resembles the thing you're mocking closly
enough.

If you want to make things more like shallow rendering, then you could do
something more
[like this](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/shallow.react-transition-group.js).

Learn more about how Jest mocks work from my blog post:
["But really, what is a JavaScript mock?"](https://blog.kentcdodds.com/but-really-what-is-a-javascript-mock-10d060966f7d)

</details>

<details>

<summary>What if I want to verify that an element does NOT exist?</summary>

You typically will get access to rendered elements using the `getByTestId` utility. However, that function will throw an error if the element isn't found. If you want to specifically test for the absence of an element, then you should use the `queryByTestId` utility which will return the element if found or `null` if not.

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

All that said, if you really don't want to ship `data-testid` attributes, then you
can use
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

You can make your selector just choose the one you want by including :nth-child in the selector.

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

> The more your tests resemble the way your software is used, the more confidence they can give you. - [17 Feb 2018][guiding-principle]

Because users can't directly interact with your app's component instances,
assert on their internal state or what components they render, or call their
internal methods, doing those things in your tests reduce the confidence they're
able to give you.

That's not to say that there's never a use case for doing those things, so they
should be possible to accomplish, just not the default and natural way to test
react components.

</details>

## Other Solutions

In preparing this project,
[I tweeted about it](https://twitter.com/kentcdodds/status/974278185540964352)
and
[Sune Simonsen](https://github.com/sunesimonsen)
[took up the challenge](https://twitter.com/sunesimonsen/status/974784783908818944).
We had different ideas of what to include in the library, so I decided to create
this one instead.

## Guiding Principles

> [The more your tests resemble the way your software is used, the more confidence they can give you.][guiding-principle]

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
| [<img src="https://avatars1.githubusercontent.com/u/29602306?v=4" width="100px;"/><br /><sub><b>Michal Baranowski</b></sub>](https://twitter.com/baranovskim)<br />[📝](#blog-mbaranovski "Blogposts") [✅](#tutorial-mbaranovski "Tutorials") | [<img src="https://avatars3.githubusercontent.com/u/13985684?v=4" width="100px;"/><br /><sub><b>Arthur Puthin</b></sub>](https://github.com/aputhin)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=aputhin "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/21194045?v=4" width="100px;"/><br /><sub><b>Thomas Chia</b></sub>](https://github.com/thchia)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=thchia "Code") | [<img src="https://avatars3.githubusercontent.com/u/20430611?v=4" width="100px;"/><br /><sub><b>Thiago Galvani</b></sub>](http://ilegra.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=thiagopaiva99 "Documentation") |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

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
