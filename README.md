<div align="center">
<h1>react-testing-library</h1>

<a href="https://www.emojione.com/emoji/1f410">
  <img
    height="80"
    width="80"
    alt="goat"
    src="https://raw.githubusercontent.com/kentcdodds/react-testing-library/master/other/goat.png"
  />
</a>

<p>Simple and complete React DOM testing utilities that encourage good testing
practices.</p>

[**Read The Docs**](https://testing-library.com/react) |
[Edit the docs](https://github.com/alexkrolick/testing-library-docs)

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-70-orange.svg?style=flat-square)](#contributors)
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
      src="https://raw.githubusercontent.com/kentcdodds/react-testing-library/master/other/testingjavascript.jpg"
    />
  </a>
</div>

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Example](#example)
- [Installation](#installation)
- [Examples](#examples)
- [Hooks](#hooks)
- [Other Solutions](#other-solutions)
- [Guiding Principles](#guiding-principles)
- [Contributors](#contributors)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
  - [❓ Questions](#-questions)
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

The `react-testing-library` is a very light-weight solution for testing React
components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices. Its
primary guiding principle is:

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

## Example

```javascript
// __tests__/fetch.js
import React from 'react'
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library'
// this adds custom jest matchers from jest-dom
import 'jest-dom/extend-expect'

// the mock lives in a __mocks__ directory
// to know more about manual mocks, access: https://jestjs.io/docs/en/manual-mocks
import axiosMock from 'axios'
import Fetch from '../fetch' // see the tests for a full implementation

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup)

test('Fetch makes an API call and displays the greeting when load-greeting is clicked', async () => {
  // Arrange
  axiosMock.get.mockResolvedValueOnce({data: {greeting: 'hello there'}})
  const url = '/greeting'
  const {getByText, getByTestId, container, asFragment} = render(
    <Fetch url={url} />,
  )

  // Act
  fireEvent.click(getByText(/load greeting/i))

  // Let's wait until our mocked `get` request promise resolves and
  // the component calls setState and re-renders.
  // getByTestId throws an error if it cannot find an element with the given ID
  // and waitForElement will wait until the callback doesn't throw an error
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
  // you can also use get a `DocumentFragment`, which is useful if you want to compare nodes across render
  expect(asFragment()).toMatchSnapshot()
})
```

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev react-testing-library
```

This library has `peerDependencies` listings for `react` and `react-dom`.

You may also be interested in installing `jest-dom` so you can use
[the custom jest matchers](https://github.com/gnapse/jest-dom#readme).

> [**Docs**](https://testing-library.com/docs/react-testing-library/intro)

## Examples

> We're in the process of moving examples to the
> [docs site](https://testing-library.com/docs/example-codesandbox)

You'll find runnable examples of testing with different libraries in
[the `examples` directory](https://github.com/kentcdodds/react-testing-library/blob/master/examples).
Some included are:

- [`react-redux`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-redux.js)
- [`react-router`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-router.js)
- [`react-context`](https://github.com/kentcdodds/react-testing-library/blob/master/examples/__tests__/react-context.js)

You can also find react-testing-library examples at
[react-testing-examples.com](https://react-testing-examples.com/jest-rtl/).

## Hooks

If you are interested in testing a custom hook, check out
[react-hooks-testing-library][react-hooks-testing-library]

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
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;" alt="Kent C. Dodds"/><br /><sub><b>Kent C. Dodds</b></sub>](https://kentcdodds.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Documentation") [🚇](#infra-kentcdodds "Infrastructure (Hosting, Build-Tools, etc)") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=kentcdodds "Tests") | [<img src="https://avatars1.githubusercontent.com/u/2430381?v=4" width="100px;" alt="Ryan Castner"/><br /><sub><b>Ryan Castner</b></sub>](http://audiolion.github.io)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=audiolion "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8008023?v=4" width="100px;" alt="Daniel Sandiego"/><br /><sub><b>Daniel Sandiego</b></sub>](https://www.dnlsandiego.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=dnlsandiego "Code") | [<img src="https://avatars2.githubusercontent.com/u/12592677?v=4" width="100px;" alt="Paweł Mikołajczyk"/><br /><sub><b>Paweł Mikołajczyk</b></sub>](https://github.com/Miklet)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=Miklet "Code") | [<img src="https://avatars3.githubusercontent.com/u/464978?v=4" width="100px;" alt="Alejandro Ñáñez Ortiz"/><br /><sub><b>Alejandro Ñáñez Ortiz</b></sub>](http://co.linkedin.com/in/alejandronanez/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=alejandronanez "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/1402095?v=4" width="100px;" alt="Matt Parrish"/><br /><sub><b>Matt Parrish</b></sub>](https://github.com/pbomb)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Apbomb "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=pbomb "Tests") | [<img src="https://avatars1.githubusercontent.com/u/1288694?v=4" width="100px;" alt="Justin Hall"/><br /><sub><b>Justin Hall</b></sub>](https://github.com/wKovacs64)<br />[📦](#platform-wKovacs64 "Packaging/porting to new platform") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/1241511?s=460&v=4" width="100px;" alt="Anto Aravinth"/><br /><sub><b>Anto Aravinth</b></sub>](https://github.com/antoaravinth)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Tests") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=antoaravinth "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/3462296?v=4" width="100px;" alt="Jonah Moses"/><br /><sub><b>Jonah Moses</b></sub>](https://github.com/JonahMoses)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=JonahMoses "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/4002543?v=4" width="100px;" alt="Łukasz Gandecki"/><br /><sub><b>Łukasz Gandecki</b></sub>](http://team.thebrain.pro)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Tests") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=lgandecki "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/498274?v=4" width="100px;" alt="Ivan Babak"/><br /><sub><b>Ivan Babak</b></sub>](https://sompylasar.github.io)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Asompylasar "Bug reports") [🤔](#ideas-sompylasar "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/4439618?v=4" width="100px;" alt="Jesse Day"/><br /><sub><b>Jesse Day</b></sub>](https://github.com/jday3)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jday3 "Code") | [<img src="https://avatars0.githubusercontent.com/u/15199?v=4" width="100px;" alt="Ernesto García"/><br /><sub><b>Ernesto García</b></sub>](http://gnapse.github.io)<br />[💬](#question-gnapse "Answering Questions") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=gnapse "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=gnapse "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2747424?v=4" width="100px;" alt="Josef Maxx Blake"/><br /><sub><b>Josef Maxx Blake</b></sub>](http://jomaxx.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=jomaxx "Tests") |
| [<img src="https://avatars1.githubusercontent.com/u/29602306?v=4" width="100px;" alt="Michal Baranowski"/><br /><sub><b>Michal Baranowski</b></sub>](https://twitter.com/baranovskim)<br />[📝](#blog-mbaranovski "Blogposts") [✅](#tutorial-mbaranovski "Tutorials") | [<img src="https://avatars3.githubusercontent.com/u/13985684?v=4" width="100px;" alt="Arthur Puthin"/><br /><sub><b>Arthur Puthin</b></sub>](https://github.com/aputhin)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=aputhin "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/21194045?v=4" width="100px;" alt="Thomas Chia"/><br /><sub><b>Thomas Chia</b></sub>](https://github.com/thchia)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=thchia "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=thchia "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/20430611?v=4" width="100px;" alt="Thiago Galvani"/><br /><sub><b>Thiago Galvani</b></sub>](http://ilegra.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=thiagopaiva99 "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/19828824?v=4" width="100px;" alt="Christian"/><br /><sub><b>Christian</b></sub>](http://Chriswcs.github.io)<br />[⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=ChrisWcs "Tests") | [<img src="https://avatars3.githubusercontent.com/u/1571667?v=4" width="100px;" alt="Alex Krolick"/><br /><sub><b>Alex Krolick</b></sub>](https://alexkrolick.com)<br />[💬](#question-alexkrolick "Answering Questions") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=alexkrolick "Documentation") [💡](#example-alexkrolick "Examples") [🤔](#ideas-alexkrolick "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/1239401?v=4" width="100px;" alt="Johann Hubert Sonntagbauer"/><br /><sub><b>Johann Hubert Sonntagbauer</b></sub>](https://github.com/johann-sonntagbauer)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=johann-sonntagbauer "Tests") |
| [<img src="https://avatars2.githubusercontent.com/u/2224291?v=4" width="100px;" alt="Maddi Joyce"/><br /><sub><b>Maddi Joyce</b></sub>](http://www.maddijoyce.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=maddijoyce "Code") | [<img src="https://avatars2.githubusercontent.com/u/10080111?v=4" width="100px;" alt="Ryan Vice"/><br /><sub><b>Ryan Vice</b></sub>](http://www.vicesoftware.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=RyanAtViceSoftware "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/7942604?v=4" width="100px;" alt="Ian Wilson"/><br /><sub><b>Ian Wilson</b></sub>](https://ianwilson.io)<br />[📝](#blog-iwilsonq "Blogposts") [✅](#tutorial-iwilsonq "Tutorials") | [<img src="https://avatars2.githubusercontent.com/u/1635491?v=4" width="100px;" alt="Daniel"/><br /><sub><b>Daniel</b></sub>](https://github.com/InExtremaRes)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3AInExtremaRes "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=InExtremaRes "Code") | [<img src="https://avatars0.githubusercontent.com/u/767959?v=4" width="100px;" alt="Giorgio Polvara"/><br /><sub><b>Giorgio Polvara</b></sub>](https://twitter.com/Gpx)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3AGpx "Bug reports") [🤔](#ideas-Gpx "Ideas, Planning, & Feedback") | [<img src="https://avatars2.githubusercontent.com/u/132233?v=4" width="100px;" alt="John Gozde"/><br /><sub><b>John Gozde</b></sub>](https://github.com/jgoz)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jgoz "Code") | [<img src="https://avatars0.githubusercontent.com/u/8203211?v=4" width="100px;" alt="Sam Horton"/><br /><sub><b>Sam Horton</b></sub>](https://twitter.com/SavePointSam)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=SavePointSam "Documentation") [💡](#example-SavePointSam "Examples") [🤔](#ideas-SavePointSam "Ideas, Planning, & Feedback") |
| [<img src="https://avatars2.githubusercontent.com/u/10452163?v=4" width="100px;" alt="Richard Kotze (mobile)"/><br /><sub><b>Richard Kotze (mobile)</b></sub>](http://www.richardkotze.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=rkotze "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/10819833?v=4" width="100px;" alt="Brahian E. Soto Mercedes"/><br /><sub><b>Brahian E. Soto Mercedes</b></sub>](https://github.com/sotobuild)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=sotobuild "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/7151559?v=4" width="100px;" alt="Benoit de La Forest"/><br /><sub><b>Benoit de La Forest</b></sub>](https://github.com/bdelaforest)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=bdelaforest "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/6624197?v=4" width="100px;" alt="Salah"/><br /><sub><b>Salah</b></sub>](https://github.com/thesalah)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=thesalah "Code") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=thesalah "Tests") | [<img src="https://avatars2.githubusercontent.com/u/370054?v=4" width="100px;" alt="Adam Gordon"/><br /><sub><b>Adam Gordon</b></sub>](http://gordonizer.com)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Aicfantv "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=icfantv "Code") | [<img src="https://avatars2.githubusercontent.com/u/471278?v=4" width="100px;" alt="Matija Marohnić"/><br /><sub><b>Matija Marohnić</b></sub>](https://silvenon.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=silvenon "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/8015514?v=4" width="100px;" alt="Justice Mba"/><br /><sub><b>Justice Mba</b></sub>](https://github.com/Dajust)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=Dajust "Documentation") |
| [<img src="https://avatars2.githubusercontent.com/u/5286559?v=4" width="100px;" alt="Mark Pollmann"/><br /><sub><b>Mark Pollmann</b></sub>](https://markpollmann.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=MarkPollmann "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/1213123?v=4" width="100px;" alt="Ehtesham Kafeel"/><br /><sub><b>Ehtesham Kafeel</b></sub>](https://github.com/ehteshamkafeel)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=ehteshamkafeel "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=ehteshamkafeel "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/1493505?v=4" width="100px;" alt="Julio Pavón"/><br /><sub><b>Julio Pavón</b></sub>](http://jpavon.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=jpavon "Code") | [<img src="https://avatars3.githubusercontent.com/u/1765048?v=4" width="100px;" alt="Duncan L"/><br /><sub><b>Duncan L</b></sub>](http://www.duncanleung.com/)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=duncanleung "Documentation") [💡](#example-duncanleung "Examples") | [<img src="https://avatars1.githubusercontent.com/u/700778?v=4" width="100px;" alt="Tiago Almeida"/><br /><sub><b>Tiago Almeida</b></sub>](https://www.linkedin.com/in/tyagow/?locale=en_US)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=tyagow "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/4982001?v=4" width="100px;" alt="Robert Smith"/><br /><sub><b>Robert Smith</b></sub>](http://rbrtsmith.com/)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Arbrtsmith "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/1700355?v=4" width="100px;" alt="Zach Green"/><br /><sub><b>Zach Green</b></sub>](https://offbyone.tech)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=zgreen "Documentation") |
| [<img src="https://avatars3.githubusercontent.com/u/881986?v=4" width="100px;" alt="dadamssg"/><br /><sub><b>dadamssg</b></sub>](https://github.com/dadamssg)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=dadamssg "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/8734097?v=4" width="100px;" alt="Yazan Aabed"/><br /><sub><b>Yazan Aabed</b></sub>](https://www.yaabed.com/)<br />[📝](#blog-YazanAabeed "Blogposts") | [<img src="https://avatars0.githubusercontent.com/u/556258?v=4" width="100px;" alt="Tim"/><br /><sub><b>Tim</b></sub>](https://github.com/timbonicus)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Atimbonicus "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Documentation") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=timbonicus "Tests") | [<img src="https://avatars3.githubusercontent.com/u/6682655?v=4" width="100px;" alt="Divyanshu Maithani"/><br /><sub><b>Divyanshu Maithani</b></sub>](http://divyanshu.xyz)<br />[✅](#tutorial-divyanshu013 "Tutorials") [📹](#video-divyanshu013 "Videos") | [<img src="https://avatars2.githubusercontent.com/u/9116042?v=4" width="100px;" alt="Deepak Grover"/><br /><sub><b>Deepak Grover</b></sub>](https://www.linkedin.com/in/metagrover)<br />[✅](#tutorial-metagrover "Tutorials") [📹](#video-metagrover "Videos") | [<img src="https://avatars0.githubusercontent.com/u/16276358?v=4" width="100px;" alt="Eyal Cohen"/><br /><sub><b>Eyal Cohen</b></sub>](https://github.com/eyalcohen4)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=eyalcohen4 "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/7452681?v=4" width="100px;" alt="Peter Makowski"/><br /><sub><b>Peter Makowski</b></sub>](https://github.com/petermakowski)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=petermakowski "Documentation") |
| [<img src="https://avatars2.githubusercontent.com/u/20361668?v=4" width="100px;" alt="Michiel Nuyts"/><br /><sub><b>Michiel Nuyts</b></sub>](https://github.com/Michielnuyts)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=Michielnuyts "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/1195863?v=4" width="100px;" alt="Joe Ng'ethe"/><br /><sub><b>Joe Ng'ethe</b></sub>](https://github.com/joeynimu)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=joeynimu "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=joeynimu "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/19998290?v=4" width="100px;" alt="Kate"/><br /><sub><b>Kate</b></sub>](https://github.com/Enikol)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=Enikol "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/11980217?v=4" width="100px;" alt="Sean"/><br /><sub><b>Sean</b></sub>](http://www.seanrparker.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=SeanRParker "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/17031?v=4" width="100px;" alt="James Long"/><br /><sub><b>James Long</b></sub>](http://jlongster.com)<br />[🤔](#ideas-jlongster "Ideas, Planning, & Feedback") [📦](#platform-jlongster "Packaging/porting to new platform") | [<img src="https://avatars1.githubusercontent.com/u/10118777?v=4" width="100px;" alt="Herb Hagely"/><br /><sub><b>Herb Hagely</b></sub>](https://github.com/hhagely)<br />[💡](#example-hhagely "Examples") | [<img src="https://avatars2.githubusercontent.com/u/5779538?v=4" width="100px;" alt="Alex Wendte"/><br /><sub><b>Alex Wendte</b></sub>](http://www.wendtedesigns.com/)<br />[💡](#example-themostcolm "Examples") |
| [<img src="https://avatars0.githubusercontent.com/u/6998954?v=4" width="100px;" alt="Monica Powell"/><br /><sub><b>Monica Powell</b></sub>](http://www.aboutmonica.com)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=M0nica "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/2699953?v=4" width="100px;" alt="Vitaly Sivkov"/><br /><sub><b>Vitaly Sivkov</b></sub>](http://sivkoff.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=sivkoff "Code") | [<img src="https://avatars3.githubusercontent.com/u/7049?v=4" width="100px;" alt="Weyert de Boer"/><br /><sub><b>Weyert de Boer</b></sub>](https://github.com/weyert)<br />[🤔](#ideas-weyert "Ideas, Planning, & Feedback") [👀](#review-weyert "Reviewed Pull Requests") | [<img src="https://avatars3.githubusercontent.com/u/13613037?v=4" width="100px;" alt="EstebanMarin"/><br /><sub><b>EstebanMarin</b></sub>](https://github.com/EstebanMarin)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=EstebanMarin "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/13953703?v=4" width="100px;" alt="Victor Martins"/><br /><sub><b>Victor Martins</b></sub>](https://github.com/vctormb)<br />[📖](https://github.com/kentcdodds/react-testing-library/commits?author=vctormb "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/19773?v=4" width="100px;" alt="Royston Shufflebotham"/><br /><sub><b>Royston Shufflebotham</b></sub>](https://github.com/RoystonS)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3ARoystonS "Bug reports") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=RoystonS "Documentation") [💡](#example-RoystonS "Examples") | [<img src="https://avatars0.githubusercontent.com/u/6834804?v=4" width="100px;" alt="chrbala"/><br /><sub><b>chrbala</b></sub>](https://github.com/chrbala)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=chrbala "Code") |
| [<img src="https://avatars3.githubusercontent.com/u/887639?v=4" width="100px;" alt="Donavon West"/><br /><sub><b>Donavon West</b></sub>](http://donavon.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=donavon "Code") [📖](https://github.com/kentcdodds/react-testing-library/commits?author=donavon "Documentation") [🤔](#ideas-donavon "Ideas, Planning, & Feedback") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=donavon "Tests") | [<img src="https://avatars2.githubusercontent.com/u/689081?v=4" width="100px;" alt="Richard Maisano"/><br /><sub><b>Richard Maisano</b></sub>](https://github.com/maisano)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=maisano "Code") | [<img src="https://avatars0.githubusercontent.com/u/5244986?v=4" width="100px;" alt="Marco Biedermann"/><br /><sub><b>Marco Biedermann</b></sub>](https://www.marcobiedermann.com)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=marcobiedermann "Code") [🚧](#maintenance-marcobiedermann "Maintenance") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=marcobiedermann "Tests") | [<img src="https://avatars3.githubusercontent.com/u/93752?v=4" width="100px;" alt="Alex Zherdev"/><br /><sub><b>Alex Zherdev</b></sub>](https://github.com/alexzherdev)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3Aalexzherdev "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=alexzherdev "Code") | [<img src="https://avatars0.githubusercontent.com/u/5133846?v=4" width="100px;" alt="André Matulionis dos Santos"/><br /><sub><b>André Matulionis dos Santos</b></sub>](https://twitter.com/Andrewmat)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=Andrewmat "Code") [💡](#example-Andrewmat "Examples") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=Andrewmat "Tests") | [<img src="https://avatars0.githubusercontent.com/u/1096340?v=4" width="100px;" alt="Daniel K."/><br /><sub><b>Daniel K.</b></sub>](https://github.com/FredyC)<br />[🐛](https://github.com/kentcdodds/react-testing-library/issues?q=author%3AFredyC "Bug reports") [💻](https://github.com/kentcdodds/react-testing-library/commits?author=FredyC "Code") [🤔](#ideas-FredyC "Ideas, Planning, & Feedback") [⚠️](https://github.com/kentcdodds/react-testing-library/commits?author=FredyC "Tests") | [<img src="https://avatars0.githubusercontent.com/u/40938625?v=4" width="100px;" alt="mohamedmagdy17593"/><br /><sub><b>mohamedmagdy17593</b></sub>](https://github.com/mohamedmagdy17593)<br />[💻](https://github.com/kentcdodds/react-testing-library/commits?author=mohamedmagdy17593 "Code") |

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
[react-hooks-testing-library]: https://github.com/mpeyper/react-hooks-testing-library

<!-- prettier-ignore-end -->
