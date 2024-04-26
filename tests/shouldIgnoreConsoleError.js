// Fork of https://github.com/facebook/react/blob/513417d6951fa3ff5729302b7990b84604b11afa/scripts/jest/shouldIgnoreConsoleError.js
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

module.exports = function shouldIgnoreConsoleError(format) {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof format === 'string') {
      if (format.indexOf('Error: Uncaught [') === 0) {
        // This looks like an uncaught error from invokeGuardedCallback() wrapper
        // in development that is reported by jsdom. Ignore because it's noisy.
        return true
      }
      if (format.indexOf('The above error occurred') === 0) {
        // This looks like an error addendum from ReactFiberErrorLogger.
        // Ignore it too.
        return true
      }
      if (
        format.startsWith(
          'Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`.',
        )
      ) {
        // This is a React bug in 18.3.0.
        // Versions with `ReactDOMTestUtils.ac` being deprecated, should have `React.act`
        return true
      }
    }
  }
  // Looks legit
  return false
}
