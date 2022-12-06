// Fork of https://github.com/facebook/react/blob/513417d6951fa3ff5729302b7990b84604b11afa/scripts/jest/setupTests.js#L71-L161
/**
MIT License

Copyright (c) Facebook, Inc. and its affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/* eslint-disable prefer-template */
/* eslint-disable func-names */
const util = require('util')
const chalk = require('chalk')
const shouldIgnoreConsoleError = require('./shouldIgnoreConsoleError')

const patchConsoleMethod = (methodName, unexpectedConsoleCallStacks) => {
  const newMethod = function (format, ...args) {
    // Ignore uncaught errors reported by jsdom
    // and React addendums because they're too noisy.
    if (methodName === 'error' && shouldIgnoreConsoleError(format, args)) {
      return
    }

    // Capture the call stack now so we can warn about it later.
    // The call stack has helpful information for the test author.
    // Don't throw yet though b'c it might be accidentally caught and suppressed.
    const stack = new Error().stack
    unexpectedConsoleCallStacks.push([
      stack.substr(stack.indexOf('\n') + 1),
      util.format(format, ...args),
    ])
  }

  console[methodName] = newMethod

  return newMethod
}

const isSpy = spy =>
  (spy.calls && typeof spy.calls.count === 'function') ||
  spy._isMockFunction === true

const flushUnexpectedConsoleCalls = (
  mockMethod,
  methodName,
  expectedMatcher,
  unexpectedConsoleCallStacks,
) => {
  if (console[methodName] !== mockMethod && !isSpy(console[methodName])) {
    throw new Error(
      `Test did not tear down console.${methodName} mock properly.`,
    )
  }
  if (unexpectedConsoleCallStacks.length > 0) {
    const messages = unexpectedConsoleCallStacks.map(
      ([stack, message]) =>
        `${chalk.red(message)}\n` +
        `${stack
          .split('\n')
          .map(line => chalk.gray(line))
          .join('\n')}`,
    )

    const message =
      `Expected test not to call ${chalk.bold(
        `console.${methodName}()`,
      )}.\n\n` +
      'If the warning is expected, test for it explicitly by:\n' +
      `1. Using the ${chalk.bold('.' + expectedMatcher + '()')} ` +
      `matcher, or...\n` +
      `2. Mock it out using ${chalk.bold(
        'spyOnDev',
      )}(console, '${methodName}') or ${chalk.bold(
        'spyOnProd',
      )}(console, '${methodName}'), and test that the warning occurs.`

    throw new Error(`${message}\n\n${messages.join('\n\n')}`)
  }
}

const unexpectedErrorCallStacks = []
const unexpectedWarnCallStacks = []

const errorMethod = patchConsoleMethod('error', unexpectedErrorCallStacks)
const warnMethod = patchConsoleMethod('warn', unexpectedWarnCallStacks)

const flushAllUnexpectedConsoleCalls = () => {
  flushUnexpectedConsoleCalls(
    errorMethod,
    'error',
    'toErrorDev',
    unexpectedErrorCallStacks,
  )
  flushUnexpectedConsoleCalls(
    warnMethod,
    'warn',
    'toWarnDev',
    unexpectedWarnCallStacks,
  )
  unexpectedErrorCallStacks.length = 0
  unexpectedWarnCallStacks.length = 0
}

const resetAllUnexpectedConsoleCalls = () => {
  unexpectedErrorCallStacks.length = 0
  unexpectedWarnCallStacks.length = 0
}

expect.extend({
  ...require('./toWarnDev'),
})

beforeEach(resetAllUnexpectedConsoleCalls)
afterEach(flushAllUnexpectedConsoleCalls)
