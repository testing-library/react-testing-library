import {matcherHint, printReceived, printExpected} from 'jest-matcher-utils' //eslint-disable-line import/no-extraneous-dependencies
import {matches} from './utils'

function getDisplayName(subject) {
  if (subject && subject.constructor) {
    return subject.constructor.name
  } else {
    return typeof subject
  }
}

const assertMessage = (assertionName, message, received, expected) =>
  `${matcherHint(`${assertionName}`, 'received', '')} \n${message}: ` +
  `${printExpected(expected)} \nReceived: ${printReceived(received)}`

const extensions = {
  toBeInTheDOM(received) {
    getDisplayName(received)
    if (received) {
      return {
        message: () =>
          `${matcherHint(
            '.not.toBeInTheDOM',
            'received',
            '',
          )} Expected the element not to be present` +
          `\nReceived : ${printReceived(received)}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `${matcherHint(
            '.toBeInTheDOM',
            'received',
            '',
          )} Expected the element to be present` +
          `\nReceived : ${printReceived(received)}`,
        pass: false,
      }
    }
  },

  toHaveTextContent(htmlElement, checkWith) {
    if (!(htmlElement instanceof HTMLElement))
      throw new Error(
        `The given subject is a ${getDisplayName(
          htmlElement,
        )}, not an HTMLElement`,
      )

    const textContent = htmlElement.textContent
    const pass = matches(textContent, htmlElement, checkWith)
    if (pass) {
      return {
        message: () =>
          assertMessage(
            '.not.toHaveTextContent',
            'Expected value not equals to',
            htmlElement,
            checkWith,
          ),
        pass: true,
      }
    } else {
      return {
        message: () =>
          assertMessage(
            '.toHaveTextContent',
            'Expected value equals to',
            htmlElement,
            checkWith,
          ),
        pass: false,
      }
    }
  },
}

export default extensions
