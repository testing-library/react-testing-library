<div align="center">
<h1>React Testing Library</h1>

<a href="https://www.emojione.com/emoji/1f410">
  <img
    height="80"
    width="80"
    alt="goat"
    src="https://raw.githubusercontent.com/testing-library/react-testing-library/master/other/goat.png"
  />
</a>

<p>Simple and complete React DOM testing utilities that encourage good testing
practices.</p>

<br />

[**Read The Docs**](https://testing-library.com/react) |
[Edit the docs](https://github.com/testing-library/testing-library-docs)

<br />
</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-102-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]
<!-- prettier-ignore-end -->

<div align="center">
  <a href="https://testingjavascript.com">
    <img
      width="500"
      alt="TestingJavaScript.com Learn the smart, efficient way to test any JavaScript application."
      src="https://raw.githubusercontent.com/testing-library/react-testing-library/master/other/testingjavascript.jpg"
    />
  </a>
</div>

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation](#installation)
  - [Suppressing unnecessary warnings on React DOM 16.8](#suppressing-unnecessary-warnings-on-react-dom-168)
- [Examples](#examples)
  - [Basic Example](#basic-example)
  - [Complex Example](#complex-example)
  - [More Examples](#more-examples)
- [Hooks](#hooks)
- [Guiding Principles](#guiding-principles)
- [Docs](#docs)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
  - [❓ Questions](#-questions)
- [Contributors](#contributors)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The problem

You want to write maintainable tests for your React components. As a part of
this goal, you want your tests to avoid including implementation details of your
components and rather focus on making your tests give you the confidence for
which they are intended. As part of this, you want your testbase to be
maintainable in the long run so refactors of your components (changes to
implementation but not functionality) don't break your tests and slow you and
your team down.

## This solution

The `React Testing Library` is a very lightweight solution for testing React
components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices. Its
primary guiding principle is:

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev @testing-library/react
```
or

for installation via [yarn](https://classic.yarnpkg.com/en/)
```
yarn add --dev @testing-library/react
```

This library has `peerDependencies` listings for `react` and `react-dom`.

You may also be interested in installing `@testing-library/jest-dom` so you can
use [the custom jest matchers](https://github.com/testing-library/jest-dom).

> [**Docs**](https://testing-library.com/react)

### Suppressing unnecessary warnings on React DOM 16.8

There is a known compatibility issue with React DOM 16.8 where you will see the
following warning:

```
Warning: An update to ComponentName inside a test was not wrapped in act(...).
```

If you cannot upgrade to React DOM 16.9, you may suppress the warnings by adding
the following snippet to your test configuration
([learn more](https://github.com/testing-library/react-testing-library/issues/281)):

```js
// this is just a little hack to silence a warning that we'll get until we
// upgrade to 16.9: https://github.com/facebook/react/pull/14853
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

## Examples

### Basic Example

```jsx
// hidden-message.js
import React from 'react'

// NOTE: React Testing Library works with React Hooks _and_ classes just as well
// and your tests will be the same however you write your components.
function HiddenMessage({children}) {
  const [showMessage, setShowMessage] = React.useState(false)
  return (
    <div>
      <label htmlFor="toggle">Show Message</label>
      <input
        id="toggle"
        type="checkbox"
        onChange={e => setShowMessage(e.target.checked)}
        checked={showMessage}
      />
      {showMessage ? children : null}
    </div>
  )
}

export default HiddenMessage

// __tests__/hidden-message.js
// these imports are something you'd normally configure Jest to import for you
// automatically. Learn more in the setup docs: https://testing-library.com/docs/react-testing-library/setup#cleanup
import '@testing-library/jest-dom'
// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required

import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import HiddenMessage from '../hidden-message'

test('shows the children when the checkbox is checked', () => {
  const testMessage = 'Test Message'
  render(<HiddenMessage>{testMessage}</HiddenMessage>)

  // query* functions will return the element or null if it cannot be found
  // get* functions will return the element or throw an error if it cannot be found
  expect(screen.queryByText(testMessage)).toBeNull()

  // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
  fireEvent.click(screen.getByLabelText(/show/i))

  // .toBeInTheDocument() is an assertion that comes from jest-dom
  // otherwise you could use .toBeDefined()
  expect(screen.getByText(testMessage)).toBeInTheDocument()
})
```

### Complex Example

```jsx
// login.js
import React from 'react'

function Login() {
  const [state, setState] = React.useReducer((s, a) => ({...s, ...a}), {
    resolved: false,
    loading: false,
    error: null,
  })

  function handleSubmit(event) {
    event.preventDefault()
    const {usernameInput, passwordInput} = event.target.elements

    setState({loading: true, resolved: false, error: null})

    window
      .fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value,
        }),
      })
      .then(r => r.json())
      .then(
        user => {
          setState({loading: false, resolved: true, error: null})
          window.localStorage.setItem('token', user.token)
        },
        error => {
          setState({loading: false, resolved: false, error: error.message})
        },
      )
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameInput">Username</label>
          <input id="usernameInput" />
        </div>
        <div>
          <label htmlFor="passwordInput">Password</label>
          <input id="passwordInput" type="password" />
        </div>
        <button type="submit">Submit{state.loading ? '...' : null}</button>
      </form>
      {state.error ? <div role="alert">{state.error}</div> : null}
      {state.resolved ? (
        <div role="alert">Congrats! You're signed in!</div>
      ) : null}
    </div>
  )
}

export default Login

// __tests__/login.js
// again, these first two imports are something you'd normally handle in
// your testing framework configuration rather than importing them in every file.
import '@testing-library/jest-dom'
import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import Login from '../login'

test('allows the user to login successfully', async () => {
  // mock out window.fetch for the test
  const fakeUserResponse = {token: 'fake_user_token'}
  jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
    return Promise.resolve({
      json: () => Promise.resolve(fakeUserResponse),
    })
  })

  render(<Login />)

  // fill out the form
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: {value: 'chuck'},
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: {value: 'norris'},
  })

  fireEvent.click(screen.getByText(/submit/i))

  // just like a manual tester, we'll instruct our test to wait for the alert
  // to show up before continuing with our assertions.
  const alert = await screen.findByRole('alert')

  // .toHaveTextContent() comes from jest-dom's assertions
  // otherwise you could use expect(alert.textContent).toMatch(/congrats/i)
  // but jest-dom will give you better error messages which is why it's recommended
  expect(alert).toHaveTextContent(/congrats/i)
  expect(window.localStorage.getItem('token')).toEqual(fakeUserResponse.token)
})
```

### More Examples

> We're in the process of moving examples to the
> [docs site](https://testing-library.com/docs/example-codesandbox)

You'll find runnable examples of testing with different libraries in
[the `react-testing-library-examples` codesandbox](https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples).
Some included are:

- [`react-redux`](https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples/tree/master/?fontsize=14&module=%2Fsrc%2F__tests__%2Freact-redux.js&previewwindow=tests)
- [`react-router`](https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples/tree/master/?fontsize=14&module=%2Fsrc%2F__tests__%2Freact-router.js&previewwindow=tests)
- [`react-context`](https://codesandbox.io/s/github/kentcdodds/react-testing-library-examples/tree/master/?fontsize=14&module=%2Fsrc%2F__tests__%2Freact-context.js&previewwindow=tests)

You can also find React Testing Library examples at
[react-testing-examples.com](https://react-testing-examples.com/jest-rtl/).

## Hooks

If you are interested in testing a custom hook, check out [React Hooks Testing
Library][react-hooks-testing-library].

> NOTE it is not recommended to test single-use custom hooks in isolation from
> the components where it's being used. It's better to test the component that's
> using the hook rather than the hook itself. The `React Hooks Testing Library`
> is intended to be used for reusable hooks/libraries.

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

## Docs

[**Read The Docs**](https://testing-library.com/react) |
[Edit the docs](https://github.com/testing-library/testing-library-docs)

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

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=kentcdodds" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=kentcdodds" title="Documentation">📖</a> <a href="#infra-kentcdodds" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=kentcdodds" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://audiolion.github.io"><img src="https://avatars1.githubusercontent.com/u/2430381?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Castner</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=audiolion" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.dnlsandiego.com"><img src="https://avatars0.githubusercontent.com/u/8008023?v=4" width="100px;" alt=""/><br /><sub><b>Daniel Sandiego</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=dnlsandiego" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Miklet"><img src="https://avatars2.githubusercontent.com/u/12592677?v=4" width="100px;" alt=""/><br /><sub><b>Paweł Mikołajczyk</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Miklet" title="Code">💻</a></td>
    <td align="center"><a href="http://co.linkedin.com/in/alejandronanez/"><img src="https://avatars3.githubusercontent.com/u/464978?v=4" width="100px;" alt=""/><br /><sub><b>Alejandro Ñáñez Ortiz</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=alejandronanez" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/pbomb"><img src="https://avatars0.githubusercontent.com/u/1402095?v=4" width="100px;" alt=""/><br /><sub><b>Matt Parrish</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Apbomb" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=pbomb" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=pbomb" title="Documentation">📖</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=pbomb" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/wKovacs64"><img src="https://avatars1.githubusercontent.com/u/1288694?v=4" width="100px;" alt=""/><br /><sub><b>Justin Hall</b></sub></a><br /><a href="#platform-wKovacs64" title="Packaging/porting to new platform">📦</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/antoaravinth"><img src="https://avatars1.githubusercontent.com/u/1241511?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Anto Aravinth</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=antoaravinth" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=antoaravinth" title="Tests">⚠️</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=antoaravinth" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/JonahMoses"><img src="https://avatars2.githubusercontent.com/u/3462296?v=4" width="100px;" alt=""/><br /><sub><b>Jonah Moses</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=JonahMoses" title="Documentation">📖</a></td>
    <td align="center"><a href="http://team.thebrain.pro"><img src="https://avatars1.githubusercontent.com/u/4002543?v=4" width="100px;" alt=""/><br /><sub><b>Łukasz Gandecki</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=lgandecki" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=lgandecki" title="Tests">⚠️</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=lgandecki" title="Documentation">📖</a></td>
    <td align="center"><a href="https://sompylasar.github.io"><img src="https://avatars2.githubusercontent.com/u/498274?v=4" width="100px;" alt=""/><br /><sub><b>Ivan Babak</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Asompylasar" title="Bug reports">🐛</a> <a href="#ideas-sompylasar" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/jday3"><img src="https://avatars3.githubusercontent.com/u/4439618?v=4" width="100px;" alt=""/><br /><sub><b>Jesse Day</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jday3" title="Code">💻</a></td>
    <td align="center"><a href="http://gnapse.github.io"><img src="https://avatars0.githubusercontent.com/u/15199?v=4" width="100px;" alt=""/><br /><sub><b>Ernesto García</b></sub></a><br /><a href="#question-gnapse" title="Answering Questions">💬</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=gnapse" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=gnapse" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jomaxx.com"><img src="https://avatars2.githubusercontent.com/u/2747424?v=4" width="100px;" alt=""/><br /><sub><b>Josef Maxx Blake</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jomaxx" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=jomaxx" title="Documentation">📖</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=jomaxx" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/baranovskim"><img src="https://avatars1.githubusercontent.com/u/29602306?v=4" width="100px;" alt=""/><br /><sub><b>Michal Baranowski</b></sub></a><br /><a href="#blog-mbaranovski" title="Blogposts">📝</a> <a href="#tutorial-mbaranovski" title="Tutorials">✅</a></td>
    <td align="center"><a href="https://github.com/aputhin"><img src="https://avatars3.githubusercontent.com/u/13985684?v=4" width="100px;" alt=""/><br /><sub><b>Arthur Puthin</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=aputhin" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thchia"><img src="https://avatars2.githubusercontent.com/u/21194045?v=4" width="100px;" alt=""/><br /><sub><b>Thomas Chia</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=thchia" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=thchia" title="Documentation">📖</a></td>
    <td align="center"><a href="http://ilegra.com/"><img src="https://avatars3.githubusercontent.com/u/20430611?v=4" width="100px;" alt=""/><br /><sub><b>Thiago Galvani</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=thiagopaiva99" title="Documentation">📖</a></td>
    <td align="center"><a href="http://Chriswcs.github.io"><img src="https://avatars1.githubusercontent.com/u/19828824?v=4" width="100px;" alt=""/><br /><sub><b>Christian</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=ChrisWcs" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://alexkrolick.com"><img src="https://avatars3.githubusercontent.com/u/1571667?v=4" width="100px;" alt=""/><br /><sub><b>Alex Krolick</b></sub></a><br /><a href="#question-alexkrolick" title="Answering Questions">💬</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=alexkrolick" title="Documentation">📖</a> <a href="#example-alexkrolick" title="Examples">💡</a> <a href="#ideas-alexkrolick" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/johann-sonntagbauer"><img src="https://avatars3.githubusercontent.com/u/1239401?v=4" width="100px;" alt=""/><br /><sub><b>Johann Hubert Sonntagbauer</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=johann-sonntagbauer" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=johann-sonntagbauer" title="Documentation">📖</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=johann-sonntagbauer" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.maddijoyce.com"><img src="https://avatars2.githubusercontent.com/u/2224291?v=4" width="100px;" alt=""/><br /><sub><b>Maddi Joyce</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=maddijoyce" title="Code">💻</a></td>
    <td align="center"><a href="http://www.vicesoftware.com"><img src="https://avatars2.githubusercontent.com/u/10080111?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Vice</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=RyanAtViceSoftware" title="Documentation">📖</a></td>
    <td align="center"><a href="https://ianwilson.io"><img src="https://avatars1.githubusercontent.com/u/7942604?v=4" width="100px;" alt=""/><br /><sub><b>Ian Wilson</b></sub></a><br /><a href="#blog-iwilsonq" title="Blogposts">📝</a> <a href="#tutorial-iwilsonq" title="Tutorials">✅</a></td>
    <td align="center"><a href="https://github.com/InExtremaRes"><img src="https://avatars2.githubusercontent.com/u/1635491?v=4" width="100px;" alt=""/><br /><sub><b>Daniel</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3AInExtremaRes" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=InExtremaRes" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/Gpx"><img src="https://avatars0.githubusercontent.com/u/767959?v=4" width="100px;" alt=""/><br /><sub><b>Giorgio Polvara</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3AGpx" title="Bug reports">🐛</a> <a href="#ideas-Gpx" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/jgoz"><img src="https://avatars2.githubusercontent.com/u/132233?v=4" width="100px;" alt=""/><br /><sub><b>John Gozde</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jgoz" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/SavePointSam"><img src="https://avatars0.githubusercontent.com/u/8203211?v=4" width="100px;" alt=""/><br /><sub><b>Sam Horton</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=SavePointSam" title="Documentation">📖</a> <a href="#example-SavePointSam" title="Examples">💡</a> <a href="#ideas-SavePointSam" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.richardkotze.com"><img src="https://avatars2.githubusercontent.com/u/10452163?v=4" width="100px;" alt=""/><br /><sub><b>Richard Kotze (mobile)</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=rkotze" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/sotobuild"><img src="https://avatars2.githubusercontent.com/u/10819833?v=4" width="100px;" alt=""/><br /><sub><b>Brahian E. Soto Mercedes</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=sotobuild" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/bdelaforest"><img src="https://avatars2.githubusercontent.com/u/7151559?v=4" width="100px;" alt=""/><br /><sub><b>Benoit de La Forest</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=bdelaforest" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/thesalah"><img src="https://avatars3.githubusercontent.com/u/6624197?v=4" width="100px;" alt=""/><br /><sub><b>Salah</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=thesalah" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=thesalah" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://gordonizer.com"><img src="https://avatars2.githubusercontent.com/u/370054?v=4" width="100px;" alt=""/><br /><sub><b>Adam Gordon</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Aicfantv" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=icfantv" title="Code">💻</a></td>
    <td align="center"><a href="https://silvenon.com"><img src="https://avatars2.githubusercontent.com/u/471278?v=4" width="100px;" alt=""/><br /><sub><b>Matija Marohnić</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=silvenon" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Dajust"><img src="https://avatars3.githubusercontent.com/u/8015514?v=4" width="100px;" alt=""/><br /><sub><b>Justice Mba</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Dajust" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://markpollmann.com/"><img src="https://avatars2.githubusercontent.com/u/5286559?v=4" width="100px;" alt=""/><br /><sub><b>Mark Pollmann</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=MarkPollmann" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ehteshamkafeel"><img src="https://avatars1.githubusercontent.com/u/1213123?v=4" width="100px;" alt=""/><br /><sub><b>Ehtesham Kafeel</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=ehteshamkafeel" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=ehteshamkafeel" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jpavon.com"><img src="https://avatars2.githubusercontent.com/u/1493505?v=4" width="100px;" alt=""/><br /><sub><b>Julio Pavón</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jpavon" title="Code">💻</a></td>
    <td align="center"><a href="http://www.duncanleung.com/"><img src="https://avatars3.githubusercontent.com/u/1765048?v=4" width="100px;" alt=""/><br /><sub><b>Duncan L</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=duncanleung" title="Documentation">📖</a> <a href="#example-duncanleung" title="Examples">💡</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/tyagow/?locale=en_US"><img src="https://avatars1.githubusercontent.com/u/700778?v=4" width="100px;" alt=""/><br /><sub><b>Tiago Almeida</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=tyagow" title="Documentation">📖</a></td>
    <td align="center"><a href="http://rbrtsmith.com/"><img src="https://avatars2.githubusercontent.com/u/4982001?v=4" width="100px;" alt=""/><br /><sub><b>Robert Smith</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Arbrtsmith" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://offbyone.tech"><img src="https://avatars0.githubusercontent.com/u/1700355?v=4" width="100px;" alt=""/><br /><sub><b>Zach Green</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=zgreen" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/dadamssg"><img src="https://avatars3.githubusercontent.com/u/881986?v=4" width="100px;" alt=""/><br /><sub><b>dadamssg</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=dadamssg" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.yaabed.com/"><img src="https://avatars0.githubusercontent.com/u/8734097?v=4" width="100px;" alt=""/><br /><sub><b>Yazan Aabed</b></sub></a><br /><a href="#blog-YazanAabeed" title="Blogposts">📝</a></td>
    <td align="center"><a href="https://github.com/timbonicus"><img src="https://avatars0.githubusercontent.com/u/556258?v=4" width="100px;" alt=""/><br /><sub><b>Tim</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Atimbonicus" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=timbonicus" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=timbonicus" title="Documentation">📖</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=timbonicus" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://divyanshu.xyz"><img src="https://avatars3.githubusercontent.com/u/6682655?v=4" width="100px;" alt=""/><br /><sub><b>Divyanshu Maithani</b></sub></a><br /><a href="#tutorial-divyanshu013" title="Tutorials">✅</a> <a href="#video-divyanshu013" title="Videos">📹</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/metagrover"><img src="https://avatars2.githubusercontent.com/u/9116042?v=4" width="100px;" alt=""/><br /><sub><b>Deepak Grover</b></sub></a><br /><a href="#tutorial-metagrover" title="Tutorials">✅</a> <a href="#video-metagrover" title="Videos">📹</a></td>
    <td align="center"><a href="https://github.com/eyalcohen4"><img src="https://avatars0.githubusercontent.com/u/16276358?v=4" width="100px;" alt=""/><br /><sub><b>Eyal Cohen</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=eyalcohen4" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/petermakowski"><img src="https://avatars3.githubusercontent.com/u/7452681?v=4" width="100px;" alt=""/><br /><sub><b>Peter Makowski</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=petermakowski" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Michielnuyts"><img src="https://avatars2.githubusercontent.com/u/20361668?v=4" width="100px;" alt=""/><br /><sub><b>Michiel Nuyts</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Michielnuyts" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/joeynimu"><img src="https://avatars0.githubusercontent.com/u/1195863?v=4" width="100px;" alt=""/><br /><sub><b>Joe Ng'ethe</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=joeynimu" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=joeynimu" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Enikol"><img src="https://avatars3.githubusercontent.com/u/19998290?v=4" width="100px;" alt=""/><br /><sub><b>Kate</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Enikol" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.seanrparker.com"><img src="https://avatars1.githubusercontent.com/u/11980217?v=4" width="100px;" alt=""/><br /><sub><b>Sean</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=SeanRParker" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jlongster.com"><img src="https://avatars2.githubusercontent.com/u/17031?v=4" width="100px;" alt=""/><br /><sub><b>James Long</b></sub></a><br /><a href="#ideas-jlongster" title="Ideas, Planning, & Feedback">🤔</a> <a href="#platform-jlongster" title="Packaging/porting to new platform">📦</a></td>
    <td align="center"><a href="https://github.com/hhagely"><img src="https://avatars1.githubusercontent.com/u/10118777?v=4" width="100px;" alt=""/><br /><sub><b>Herb Hagely</b></sub></a><br /><a href="#example-hhagely" title="Examples">💡</a></td>
    <td align="center"><a href="http://www.wendtedesigns.com/"><img src="https://avatars2.githubusercontent.com/u/5779538?v=4" width="100px;" alt=""/><br /><sub><b>Alex Wendte</b></sub></a><br /><a href="#example-themostcolm" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.aboutmonica.com"><img src="https://avatars0.githubusercontent.com/u/6998954?v=4" width="100px;" alt=""/><br /><sub><b>Monica Powell</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=M0nica" title="Documentation">📖</a></td>
    <td align="center"><a href="http://sivkoff.com"><img src="https://avatars1.githubusercontent.com/u/2699953?v=4" width="100px;" alt=""/><br /><sub><b>Vitaly Sivkov</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=sivkoff" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/weyert"><img src="https://avatars3.githubusercontent.com/u/7049?v=4" width="100px;" alt=""/><br /><sub><b>Weyert de Boer</b></sub></a><br /><a href="#ideas-weyert" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Aweyert" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/EstebanMarin"><img src="https://avatars3.githubusercontent.com/u/13613037?v=4" width="100px;" alt=""/><br /><sub><b>EstebanMarin</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=EstebanMarin" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/vctormb"><img src="https://avatars2.githubusercontent.com/u/13953703?v=4" width="100px;" alt=""/><br /><sub><b>Victor Martins</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=vctormb" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/RoystonS"><img src="https://avatars0.githubusercontent.com/u/19773?v=4" width="100px;" alt=""/><br /><sub><b>Royston Shufflebotham</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3ARoystonS" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=RoystonS" title="Documentation">📖</a> <a href="#example-RoystonS" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/chrbala"><img src="https://avatars0.githubusercontent.com/u/6834804?v=4" width="100px;" alt=""/><br /><sub><b>chrbala</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=chrbala" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://donavon.com"><img src="https://avatars3.githubusercontent.com/u/887639?v=4" width="100px;" alt=""/><br /><sub><b>Donavon West</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=donavon" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=donavon" title="Documentation">📖</a> <a href="#ideas-donavon" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=donavon" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/maisano"><img src="https://avatars2.githubusercontent.com/u/689081?v=4" width="100px;" alt=""/><br /><sub><b>Richard Maisano</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=maisano" title="Code">💻</a></td>
    <td align="center"><a href="https://www.marcobiedermann.com"><img src="https://avatars0.githubusercontent.com/u/5244986?v=4" width="100px;" alt=""/><br /><sub><b>Marco Biedermann</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=marcobiedermann" title="Code">💻</a> <a href="#maintenance-marcobiedermann" title="Maintenance">🚧</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=marcobiedermann" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/alexzherdev"><img src="https://avatars3.githubusercontent.com/u/93752?v=4" width="100px;" alt=""/><br /><sub><b>Alex Zherdev</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Aalexzherdev" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=alexzherdev" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/Andrewmat"><img src="https://avatars0.githubusercontent.com/u/5133846?v=4" width="100px;" alt=""/><br /><sub><b>André Matulionis dos Santos</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Andrewmat" title="Code">💻</a> <a href="#example-Andrewmat" title="Examples">💡</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=Andrewmat" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/FredyC"><img src="https://avatars0.githubusercontent.com/u/1096340?v=4" width="100px;" alt=""/><br /><sub><b>Daniel K.</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3AFredyC" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=FredyC" title="Code">💻</a> <a href="#ideas-FredyC" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=FredyC" title="Tests">⚠️</a> <a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3AFredyC" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/mohamedmagdy17593"><img src="https://avatars0.githubusercontent.com/u/40938625?v=4" width="100px;" alt=""/><br /><sub><b>mohamedmagdy17593</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=mohamedmagdy17593" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://lorensr.me"><img src="https://avatars2.githubusercontent.com/u/251288?v=4" width="100px;" alt=""/><br /><sub><b>Loren ☺️</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=lorensr" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/MarkFalconbridge"><img src="https://avatars1.githubusercontent.com/u/20678943?v=4" width="100px;" alt=""/><br /><sub><b>MarkFalconbridge</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3AMarkFalconbridge" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=MarkFalconbridge" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/viniciusavieira"><img src="https://avatars0.githubusercontent.com/u/2073019?v=4" width="100px;" alt=""/><br /><sub><b>Vinicius</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=viniciusavieira" title="Documentation">📖</a> <a href="#example-viniciusavieira" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/pschyma"><img src="https://avatars2.githubusercontent.com/u/2489928?v=4" width="100px;" alt=""/><br /><sub><b>Peter Schyma</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=pschyma" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ianschmitz"><img src="https://avatars1.githubusercontent.com/u/6355370?v=4" width="100px;" alt=""/><br /><sub><b>Ian Schmitz</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=ianschmitz" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/joual"><img src="https://avatars0.githubusercontent.com/u/157877?v=4" width="100px;" alt=""/><br /><sub><b>Joel Marcotte</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Ajoual" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=joual" title="Tests">⚠️</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=joual" title="Code">💻</a></td>
    <td align="center"><a href="http://aledustet.com"><img src="https://avatars3.githubusercontent.com/u/2413802?v=4" width="100px;" alt=""/><br /><sub><b>Alejandro Dustet</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Aaledustet" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/bcarroll22"><img src="https://avatars2.githubusercontent.com/u/11020406?v=4" width="100px;" alt=""/><br /><sub><b>Brandon Carroll</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=bcarroll22" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/lucas0707"><img src="https://avatars1.githubusercontent.com/u/26284338?v=4" width="100px;" alt=""/><br /><sub><b>Lucas Machado</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=lucas0707" title="Documentation">📖</a></td>
    <td align="center"><a href="http://pascalduez.me"><img src="https://avatars3.githubusercontent.com/u/335467?v=4" width="100px;" alt=""/><br /><sub><b>Pascal Duez</b></sub></a><br /><a href="#platform-pascalduez" title="Packaging/porting to new platform">📦</a></td>
    <td align="center"><a href="https://twitter.com/minh_ngvyen"><img src="https://avatars3.githubusercontent.com/u/2852660?v=4" width="100px;" alt=""/><br /><sub><b>Minh Nguyen</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=NMinhNguyen" title="Code">💻</a></td>
    <td align="center"><a href="http://iababy46.blogspot.tw/"><img src="https://avatars0.githubusercontent.com/u/11155585?v=4" width="100px;" alt=""/><br /><sub><b>LiaoJimmy</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=LiaoJimmy" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/threepointone"><img src="https://avatars2.githubusercontent.com/u/18808?v=4" width="100px;" alt=""/><br /><sub><b>Sunil Pai</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=threepointone" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=threepointone" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://twitter.com/dan_abramov"><img src="https://avatars0.githubusercontent.com/u/810438?v=4" width="100px;" alt=""/><br /><sub><b>Dan Abramov</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Agaearon" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/ChristianMurphy"><img src="https://avatars3.githubusercontent.com/u/3107513?v=4" width="100px;" alt=""/><br /><sub><b>Christian Murphy</b></sub></a><br /><a href="#infra-ChristianMurphy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://jeetiss.github.io/"><img src="https://avatars1.githubusercontent.com/u/6726016?v=4" width="100px;" alt=""/><br /><sub><b>Ivakhnenko Dmitry</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jeetiss" title="Code">💻</a></td>
    <td align="center"><a href="https://ghuser.io/jamesgeorge007"><img src="https://avatars2.githubusercontent.com/u/25279263?v=4" width="100px;" alt=""/><br /><sub><b>James George</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=jamesgeorge007" title="Documentation">📖</a></td>
    <td align="center"><a href="https://joaofernandes.me/"><img src="https://avatars1.githubusercontent.com/u/1075053?v=4" width="100px;" alt=""/><br /><sub><b>João Fernandes</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=JSFernandes" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/alejandroperea"><img src="https://avatars3.githubusercontent.com/u/6084749?v=4" width="100px;" alt=""/><br /><sub><b>Alejandro Perea</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Aalejandroperea" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://nickmccurdy.com/"><img src="https://avatars0.githubusercontent.com/u/927220?v=4" width="100px;" alt=""/><br /><sub><b>Nick McCurdy</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Anickmccurdy" title="Reviewed Pull Requests">👀</a> <a href="#question-nickmccurdy" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://twitter.com/sebsilbermann"><img src="https://avatars3.githubusercontent.com/u/12292047?v=4" width="100px;" alt=""/><br /><sub><b>Sebastian Silbermann</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Aeps1lon" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://afontcu.dev"><img src="https://avatars0.githubusercontent.com/u/9197791?v=4" width="100px;" alt=""/><br /><sub><b>Adrià Fontcuberta</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Aafontcu" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=afontcu" title="Documentation">📖</a></td>
    <td align="center"><a href="https://blog.johnnyreilly.com/"><img src="https://avatars0.githubusercontent.com/u/1010525?v=4" width="100px;" alt=""/><br /><sub><b>John Reilly</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Ajohnnyreilly" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://michaeldeboey.be"><img src="https://avatars3.githubusercontent.com/u/6643991?v=4" width="100px;" alt=""/><br /><sub><b>Michaël De Boey</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3AMichaelDeBoey" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=MichaelDeBoey" title="Code">💻</a></td>
    <td align="center"><a href="https://cimbul.com"><img src="https://avatars2.githubusercontent.com/u/927923?v=4" width="100px;" alt=""/><br /><sub><b>Tim Yates</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/pulls?q=is%3Apr+reviewed-by%3Acimbul" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/eventualbuddha"><img src="https://avatars3.githubusercontent.com/u/1938?v=4" width="100px;" alt=""/><br /><sub><b>Brian Donovan</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=eventualbuddha" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/JaysQubeXon"><img src="https://avatars1.githubusercontent.com/u/18309230?v=4" width="100px;" alt=""/><br /><sub><b>Noam Gabriel Jacobson</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=JaysQubeXon" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/rvdkooy"><img src="https://avatars1.githubusercontent.com/u/4119960?v=4" width="100px;" alt=""/><br /><sub><b>Ronald van der Kooij</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=rvdkooy" title="Tests">⚠️</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=rvdkooy" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/aayushrajvanshi"><img src="https://avatars0.githubusercontent.com/u/14968551?v=4" width="100px;" alt=""/><br /><sub><b>Aayush Rajvanshi</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=aayushrajvanshi" title="Documentation">📖</a></td>
    <td align="center"><a href="https://elyalamillo.com"><img src="https://avatars2.githubusercontent.com/u/24350492?v=4" width="100px;" alt=""/><br /><sub><b>Ely Alamillo</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=ely-alamillo" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=ely-alamillo" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/danieljcafonso"><img src="https://avatars3.githubusercontent.com/u/35337607?v=4" width="100px;" alt=""/><br /><sub><b>Daniel Afonso</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=danieljcafonso" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=danieljcafonso" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://www.laurensbosscher.nl"><img src="https://avatars0.githubusercontent.com/u/13363196?v=4" width="100px;" alt=""/><br /><sub><b>Laurens Bosscher</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=LaurensBosscher" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/__sakito__"><img src="https://avatars1.githubusercontent.com/u/15010907?v=4" width="100px;" alt=""/><br /><sub><b>Sakito Mukai</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=sakito21" title="Documentation">📖</a></td>
    <td align="center"><a href="http://turkerteke.com"><img src="https://avatars3.githubusercontent.com/u/12457162?v=4" width="100px;" alt=""/><br /><sub><b>Türker Teke</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=tteke" title="Documentation">📖</a></td>
    <td align="center"><a href="http://linkedin.com/in/zachbrogan"><img src="https://avatars1.githubusercontent.com/u/319162?v=4" width="100px;" alt=""/><br /><sub><b>Zach Brogan</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=zbrogz" title="Code">💻</a> <a href="https://github.com/testing-library/react-testing-library/commits?author=zbrogz" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://ryota-murakami.github.io/"><img src="https://avatars2.githubusercontent.com/u/5501268?v=4" width="100px;" alt=""/><br /><sub><b>Ryota Murakami</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=ryota-murakami" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hottmanmichael"><img src="https://avatars3.githubusercontent.com/u/10534502?v=4" width="100px;" alt=""/><br /><sub><b>Michael Hottman</b></sub></a><br /><a href="#ideas-hottmanmichael" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/stevenfitzpatrick"><img src="https://avatars0.githubusercontent.com/u/23268855?v=4" width="100px;" alt=""/><br /><sub><b>Steven Fitzpatrick</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/issues?q=author%3Astevenfitzpatrick" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/juangl"><img src="https://avatars0.githubusercontent.com/u/1887029?v=4" width="100px;" alt=""/><br /><sub><b>Juan Je García</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=juangl" title="Documentation">📖</a></td>
    <td align="center"><a href="https://ghuser.io/Ishaan28malik"><img src="https://avatars3.githubusercontent.com/u/27343592?v=4" width="100px;" alt=""/><br /><sub><b>Championrunner</b></sub></a><br /><a href="https://github.com/testing-library/react-testing-library/commits?author=Ishaan28malik" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

[MIT](LICENSE)

<!-- prettier-ignore-start -->

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/testing-library/react-testing-library.svg?style=flat-square
[build]: https://travis-ci.org/testing-library/react-testing-library
[coverage-badge]: https://img.shields.io/codecov/c/github/testing-library/react-testing-library.svg?style=flat-square
[coverage]: https://codecov.io/github/testing-library/react-testing-library
[version-badge]: https://img.shields.io/npm/v/@testing-library/react.svg?style=flat-square
[package]: https://www.npmjs.com/package/@testing-library/react
[downloads-badge]: https://img.shields.io/npm/dm/@testing-library/react.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/@testing-library/react
[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[spectrum]: https://spectrum.chat/testing-library
[license-badge]: https://img.shields.io/npm/l/@testing-library/react.svg?style=flat-square
[license]: https://github.com/testing-library/react-testing-library/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/testing-library/react-testing-library/blob/master/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/testing-library/react-testing-library.svg?style=social
[github-watch]: https://github.com/testing-library/react-testing-library/watchers
[github-star-badge]: https://img.shields.io/github/stars/testing-library/react-testing-library.svg?style=social
[github-star]: https://github.com/testing-library/react-testing-library/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20react-testing-library%20by%20%40@TestingLib%20https%3A%2F%2Fgithub.com%2Ftesting-library%2Freact-testing-library%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/testing-library/react-testing-library.svg?style=social
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106
[bugs]: https://github.com/testing-library/react-testing-library/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acreated-desc
[requests]: https://github.com/testing-library/react-testing-library/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3Aenhancement+is%3Aopen
[good-first-issue]: https://github.com/testing-library/react-testing-library/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"good+first+issue"+
[reactiflux]: https://www.reactiflux.com/
[stackoverflow]: https://stackoverflow.com/questions/tagged/react-testing-library
[react-hooks-testing-library]: https://github.com/testing-library/react-hooks-testing-library

<!-- prettier-ignore-end -->
