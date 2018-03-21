<div align="center">
<h1>react-testing-library</h1>

<img alt="goat" src="https://raw.githubusercontent.com/kentcdodds/react-testing-library/master/other/goat.png" />

<p>Simple and complete React DOM testing utilities that encourage good testing practices.</p>
</div>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

## The problem

You want to write maintainable tests for your React components. However, the
de facto standard for testing ([enzyme](https://github.com/airbnb/enzyme)) is
bloated with complexity and features, most of which encourage poor testing
practices (mostly relating to testing implementation details).

## This solution

The `react-testing-library` is a very light-weight solution for testing React
components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Installation](#installation)
* [Usage](#usage)
  * [`Simulate`](#simulate)
  * [`flushPromises`](#flushpromises)
  * [`render`](#render)
* [More on `data-testid`s](#more-on-data-testids)
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

## Usage

```javascript
// __tests__/fetch.js
import React from 'react'
import {render, Simulate, flushPromises} from 'react-testing-library'
import axiosMock from 'axios'
import Fetch from '../fetch'

test('Fetch makes an API call and displays the greeting when load-greeting is clicked', async () => {
  // Arrange
  axiosMock.get.mockImplementationOnce(() =>
    Promise.resolve({
      data: {greeting: 'hello there'},
    }),
  )
  const url = '/greeting'
  const {queryByTestId, container} = render(<Fetch url={url} />)

  // Act
  Simulate.click(queryByTestId('load-greeting'))

  // let's wait for our mocked `get` request promise to resolve
  await flushPromises()

  // Assert
  expect(axiosMock.get).toHaveBeenCalledTimes(1)
  expect(axiosMock.get).toHaveBeenCalledWith(url)
  expect(queryByTestId('greeting-text').textContent).toBe('hello there')
  expect(container.firstChild).toMatchSnapshot()
})
```

### `Simulate`

This is simply a re-export from the `Simulate` utility from
`react-dom/test-utils`. See [the docs](https://reactjs.org/docs/test-utils.html#simulate).

### `flushPromises`

This is a simple utility that's useful for when your component is doing some
async work that you've mocked out, but you still need to wait until the next
tick of the event loop before you can continue your assertions. It simply
returns a promise that resolves in a `setImmediate`. Especially useful when
you make your test function an `async` function and use
`await flushPromises()`.

See an example in the section about `render` below.

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

#### `queryByTestId`

A shortcut to `` container.querySelector(`[data-testid="${yourId}"]`) ``. Read
more about `data-testid`s below.

```javascript
const usernameInputElement = queryByTestId('username-input')
```

## More on `data-testid`s

The `queryByTestId` utility is referring to the practice of using `data-testid`
attributes to identify individual elements in your rendered component. This is
one of the practices this library is intended to encourage.

Learn more about this practice in the blog post:
["Making your UI tests resilient to change"](https://blog.kentcdodds.com/making-your-ui-tests-resilient-to-change-d37a6ee37269)

## Examples

You'll find examples of testing with different libraries in
[the test directory](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__).
Some included are:

* [`react-redux`](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/react-redux.js)
* [`react-router`](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/react-router.js)

Feel free to contribute more!

## FAQ

**How do I update the props of a rendered component?**

It'd probably be better if you test the component that's doing the prop updating
to ensure that the props are being updated correctly (see
[the Guiding Principles section](#guiding-principles)). That said, if you'd
prefer to update the props of a rendered component in your test, the easiest
way to do that is:

```javascript
const {container, queryByTestId} = render(<NumberDisplay number={1} />)
expect(queryByTestId('number-display').textContent).toBe('1')

// re-render the same component with different props
// but pass the same container in the options argument.
// which will cause a re-render of the same instance (normal React behavior).
render(<NumberDisplay number={2} />, {container})
expect(queryByTestId('number-display').textContent).toBe('2')
```

[Open the tests](https://github.com/kentcdodds/react-testing-library/blob/master/src/__tests__/number-display.js)
for a full example of this.

**If I can't use shallow rendering, how do I mock out components in tests?**

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
  const {queryByTestId} = render(<HiddenMessage initialShow={true} />)
  expect(queryByTestId('hidden-message')).toBeTruthy() // we just care it exists
  // hide the message
  Simulate.click(queryByTestId('toggle-message'))
  // in the real world, the CSSTransition component would take some time
  // before finishing the animation which would actually hide the message.
  // So we've mocked it out for our tests to make it happen instantly
  expect(queryByTestId('hidden-message')).toBeFalsy() // we just care it doesn't exist
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

**I don't want to use `data-testid` attributes for everything. Do I have to?**

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

**What if I’m iterating over a list of items that I want to put the data-testid="item" attribute on. How do I distinguish them from each other?**

You can make your selector just choose the one you want by including :nth-child in the selector.

```javascript
const thirdLiInUl = container.querySelector('ul > li:nth-child(3)')
```

Or you could include the index or an ID in your attribute:

```javascript
<li data-testid={`item-${item.id}`}>{item.text}</li>
```

And then you could use the `queryByTestId`:

```javascript
const items = [
  /* your items */
]
const {queryByTestId} = render(/* your component with the items */)
const thirdItem = queryByTestId(`item-${items[2].id}`)
```

**What about enzyme is "bloated with complexity and features" and "encourage poor testing
practices"**

Most of the damaging features have to do with encouraging testing implementation
details. Primarily, these are
[shallow rendering](http://airbnb.io/enzyme/docs/api/shallow.html), APIs which
allow selecting rendered elements by component constructors, and APIs which
allow you to get and interact with component instances (and their
state/properties) (most of enzyme's wrapper APIs allow this).

The guiding principle for this library is:

> The less your tests resemble the way your software is used, the less confidence they can give you. - [17 Feb 2018](https://twitter.com/kentcdodds/status/965052178267176960)

Because users can't directly interact with your app's component instances,
assert on their internal state or what components they render, or call their
internal methods, doing those things in your tests reduce the confidence they're
able to give you.

That's not to say that there's never a use case for doing those things, so they
should be possible to accomplish, just not the default and natural way to test
react components.

## Other Solutions

In preparing this project,
[I tweeted about it](https://twitter.com/kentcdodds/status/974278185540964352)
and
[Sune Simonsen](https://github.com/sunesimonsen)
[took up the challenge](https://twitter.com/sunesimonsen/status/974784783908818944).
We had different ideas of what to include in the library, so I decided to create
this one instead.

## Guiding Principles

> [The less your tests resemble the way your software is used, the less confidence they can give you.](https://twitter.com/kentcdodds/status/965052178267176960)

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
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](https://kentcdodds.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Documentation") [🚇](#infra-kentcdodds "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Tests") | [<img src="https://avatars1.githubusercontent.com/u/2430381?v=4" width="100px;"/><br /><sub><b>Ryan Castner</b></sub>](http://audiolion.github.io)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=audiolion "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8008023?v=4" width="100px;"/><br /><sub><b>Daniel Sandiego</b></sub>](https://www.dnlsandiego.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=dnlsandiego "Code") | [<img src="https://avatars2.githubusercontent.com/u/12592677?v=4" width="100px;"/><br /><sub><b>Paweł Mikołajczyk</b></sub>](https://github.com/Miklet)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=Miklet "Code") | [<img src="https://avatars3.githubusercontent.com/u/464978?v=4" width="100px;"/><br /><sub><b>Alejandro Ñáñez Ortiz</b></sub>](http://co.linkedin.com/in/alejandronanez/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=alejandronanez "Documentation") |
| :---: | :---: | :---: | :---: | :---: |

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
