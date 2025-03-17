// Fork of https://github.com/facebook/react/blob/513417d6951fa3ff5729302b7990b84604b11afa/scripts/jest/matchers/toWarnDev.js
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
/* eslint-disable no-unsafe-finally */
/* eslint-disable no-negated-condition */
/* eslint-disable no-invalid-this */
/* eslint-disable prefer-template */
/* eslint-disable func-names */
/* eslint-disable complexity */
const util = require('util')
const jestDiff = require('jest-diff').diff
const shouldIgnoreConsoleError = require('./shouldIgnoreConsoleError')

function normalizeCodeLocInfo(str) {
  if (typeof str !== 'string') {
    return str
  }
  // This special case exists only for the special source location in
  // ReactElementValidator. That will go away if we remove source locations.
  str = str.replace(/Check your code at .+?:\d+/g, 'Check your code at **')
  // V8 format:
  //  at Component (/path/filename.js:123:45)
  // React format:
  //    in Component (at filename.js:123)
  // eslint-disable-next-line prefer-arrow-callback
  return str.replace(/\n +(?:at|in) ([\S]+)[^\n]*/g, function (m, name) {
    return '\n    in ' + name + ' (at **)'
  })
}

const createMatcherFor = (consoleMethod, matcherName) =>
  function matcher(callback, expectedMessages, options = {}) {
    if (process.env.NODE_ENV !== 'production') {
      // Warn about incorrect usage of matcher.
      if (typeof expectedMessages === 'string') {
        expectedMessages = [expectedMessages]
      } else if (!Array.isArray(expectedMessages)) {
        throw Error(
          `${matcherName}() requires a parameter of type string or an array of strings ` +
            `but was given ${typeof expectedMessages}.`,
        )
      }
      if (
        options != null &&
        (typeof options !== 'object' || Array.isArray(options))
      ) {
        throw new Error(
          `${matcherName}() second argument, when present, should be an object. ` +
            'Did you forget to wrap the messages into an array?',
        )
      }
      if (arguments.length > 3) {
        // `matcher` comes from Jest, so it's more than 2 in practice
        throw new Error(
          `${matcherName}() received more than two arguments. ` +
            'Did you forget to wrap the messages into an array?',
        )
      }

      const withoutStack = options.withoutStack
      const logAllErrors = options.logAllErrors
      const warningsWithoutComponentStack = []
      const warningsWithComponentStack = []
      const unexpectedWarnings = []

      let lastWarningWithMismatchingFormat = null
      let lastWarningWithExtraComponentStack = null

      // Catch errors thrown by the callback,
      // But only rethrow them if all test expectations have been satisfied.
      // Otherwise an Error in the callback can mask a failed expectation,
      // and result in a test that passes when it shouldn't.
      let caughtError

      const isLikelyAComponentStack = message =>
        typeof message === 'string' &&
        (message.includes('\n    in ') || message.includes('\n    at '))

      const consoleSpy = (format, ...args) => {
        // Ignore uncaught errors reported by jsdom
        // and React addendums because they're too noisy.
        if (
          !logAllErrors &&
          consoleMethod === 'error' &&
          shouldIgnoreConsoleError(format, args)
        ) {
          return
        }

        const message = util.format(format, ...args)
        const normalizedMessage = normalizeCodeLocInfo(message)

        // Remember if the number of %s interpolations
        // doesn't match the number of arguments.
        // We'll fail the test if it happens.
        let argIndex = 0
        String(format).replace(/%s/g, () => argIndex++)
        if (argIndex !== args.length) {
          lastWarningWithMismatchingFormat = {
            format,
            args,
            expectedArgCount: argIndex,
          }
        }

        // Protect against accidentally passing a component stack
        // to warning() which already injects the component stack.
        if (
          args.length >= 2 &&
          isLikelyAComponentStack(args[args.length - 1]) &&
          isLikelyAComponentStack(args[args.length - 2])
        ) {
          lastWarningWithExtraComponentStack = {
            format,
          }
        }

        for (let index = 0; index < expectedMessages.length; index++) {
          const expectedMessage = expectedMessages[index]
          if (
            normalizedMessage === expectedMessage ||
            normalizedMessage.includes(expectedMessage)
          ) {
            if (isLikelyAComponentStack(normalizedMessage)) {
              warningsWithComponentStack.push(normalizedMessage)
            } else {
              warningsWithoutComponentStack.push(normalizedMessage)
            }
            expectedMessages.splice(index, 1)
            return
          }
        }

        let errorMessage
        if (expectedMessages.length === 0) {
          errorMessage =
            'Unexpected warning recorded: ' +
            this.utils.printReceived(normalizedMessage)
        } else if (expectedMessages.length === 1) {
          errorMessage =
            'Unexpected warning recorded: ' +
            jestDiff(expectedMessages[0], normalizedMessage)
        } else {
          errorMessage =
            'Unexpected warning recorded: ' +
            jestDiff(expectedMessages, [normalizedMessage])
        }

        // Record the call stack for unexpected warnings.
        // We don't throw an Error here though,
        // Because it might be suppressed by ReactFiberScheduler.
        unexpectedWarnings.push(new Error(errorMessage))
      }

      // TODO Decide whether we need to support nested toWarn* expectations.
      // If we don't need it, add a check here to see if this is already our spy,
      // And throw an error.
      const originalMethod = console[consoleMethod]

      // Avoid using Jest's built-in spy since it can't be removed.
      console[consoleMethod] = consoleSpy

      const onFinally = () => {
        // Restore the unspied method so that unexpected errors fail tests.
        console[consoleMethod] = originalMethod

        // Any unexpected Errors thrown by the callback should fail the test.
        // This should take precedence since unexpected errors could block warnings.
        if (caughtError) {
          throw caughtError
        }

        // Any unexpected warnings should be treated as a failure.
        if (unexpectedWarnings.length > 0) {
          return {
            message: () => unexpectedWarnings[0].stack,
            pass: false,
          }
        }

        // Any remaining messages indicate a failed expectations.
        if (expectedMessages.length > 0) {
          return {
            message: () =>
              `Expected warning was not recorded:\n  ${this.utils.printReceived(
                expectedMessages[0],
              )}`,
            pass: false,
          }
        }

        if (typeof withoutStack === 'number') {
          // We're expecting a particular number of warnings without stacks.
          if (withoutStack !== warningsWithoutComponentStack.length) {
            return {
              message: () =>
                `Expected ${withoutStack} warnings without a component stack but received ${warningsWithoutComponentStack.length}:\n` +
                warningsWithoutComponentStack.map(warning =>
                  this.utils.printReceived(warning),
                ),
              pass: false,
            }
          }
        } else if (withoutStack === true) {
          // We're expecting that all warnings won't have the stack.
          // If some warnings have it, it's an error.
          if (warningsWithComponentStack.length > 0) {
            return {
              message: () =>
                `Received warning unexpectedly includes a component stack:\n  ${this.utils.printReceived(
                  warningsWithComponentStack[0],
                )}\nIf this warning intentionally includes the component stack, remove ` +
                `{withoutStack: true} from the ${matcherName}() call. If you have a mix of ` +
                `warnings with and without stack in one ${matcherName}() call, pass ` +
                `{withoutStack: N} where N is the number of warnings without stacks.`,
              pass: false,
            }
          }
        } else if (withoutStack === false || withoutStack === undefined) {
          // We're expecting that all warnings *do* have the stack (default).
          // If some warnings don't have it, it's an error.
          if (warningsWithoutComponentStack.length > 0) {
            return {
              message: () =>
                `Received warning unexpectedly does not include a component stack:\n  ${this.utils.printReceived(
                  warningsWithoutComponentStack[0],
                )}\nIf this warning intentionally omits the component stack, add ` +
                `{withoutStack: true} to the ${matcherName} call.`,
              pass: false,
            }
          }
        } else {
          throw Error(
            `The second argument for ${matcherName}(), when specified, must be an object. It may have a ` +
              `property called "withoutStack" whose value may be undefined, boolean, or a number. ` +
              `Instead received ${typeof withoutStack}.`,
          )
        }

        if (lastWarningWithMismatchingFormat !== null) {
          return {
            message: () =>
              `Received ${
                lastWarningWithMismatchingFormat.args.length
              } arguments for a message with ${
                lastWarningWithMismatchingFormat.expectedArgCount
              } placeholders:\n  ${this.utils.printReceived(
                lastWarningWithMismatchingFormat.format,
              )}`,
            pass: false,
          }
        }

        if (lastWarningWithExtraComponentStack !== null) {
          return {
            message: () =>
              `Received more than one component stack for a warning:\n  ${this.utils.printReceived(
                lastWarningWithExtraComponentStack.format,
              )}\nDid you accidentally pass a stack to warning() as the last argument? ` +
              `Don't forget warning() already injects the component stack automatically.`,
            pass: false,
          }
        }

        return {pass: true}
      }

      let returnPromise = null
      try {
        const result = callback()

        if (
          typeof result === 'object' &&
          result !== null &&
          typeof result.then === 'function'
        ) {
          // `act` returns a thenable that can't be chained.
          // Once `act(async () => {}).then(() => {}).then(() => {})` works
          // we can just return `result.then(onFinally, error => ...)`
          returnPromise = new Promise((resolve, reject) => {
            result
              .then(
                () => {
                  resolve(onFinally())
                },
                error => {
                  caughtError = error
                  return resolve(onFinally())
                },
              )
              // In case onFinally throws we need to reject from this matcher
              .catch(error => {
                reject(error)
              })
          })
        }
      } catch (error) {
        caughtError = error
      } finally {
        return returnPromise === null ? onFinally() : returnPromise
      }
    } else {
      // Any uncaught errors or warnings should fail tests in production mode.
      const result = callback()

      if (
        typeof result === 'object' &&
        result !== null &&
        typeof result.then === 'function'
      ) {
        return result.then(() => {
          return {pass: true}
        })
      } else {
        return {pass: true}
      }
    }
  }

module.exports = {
  toWarnDev: createMatcherFor('warn', 'toWarnDev'),
  toErrorDev: createMatcherFor('error', 'toErrorDev'),
}
