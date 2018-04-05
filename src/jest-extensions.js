//eslint-disable-next-line import/no-extraneous-dependencies
import {
  matcherHint,
  printReceived,
  printExpected,
  stringify,
  RECEIVED_COLOR as receivedColor,
  EXPECTED_COLOR as expectedColor,
} from 'jest-matcher-utils'
import {matches} from './utils'

function getDisplayName(subject) {
  if (subject && subject.constructor) {
    return subject.constructor.name
  } else {
    return typeof subject
  }
}

function checkHtmlElement(htmlElement) {
  if (!(htmlElement instanceof HTMLElement)) {
    throw new Error(
      `The given subject is a ${getDisplayName(
        htmlElement,
      )}, not an HTMLElement`,
    )
  }
}

const assertMessage = (assertionName, message, received, expected) =>
  `${matcherHint(`${assertionName}`, 'received', '')} \n${message}: ` +
  `${printExpected(expected)} \nReceived: ${printReceived(received)}`

function printAttribute(name, value) {
  return value === undefined ? name : `${name}=${stringify(value)}`
}

function getAttributeComment(name, value) {
  return value === undefined
    ? `element.hasAttribute(${stringify(name)})`
    : `element.getAttribute(${stringify(name)}) === ${stringify(value)}`
}

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
    checkHtmlElement(htmlElement)
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

  toHaveAttribute(htmlElement, name, expectedValue) {
    checkHtmlElement(htmlElement)
    const isExpectedValuePresent = expectedValue !== undefined
    const hasAttribute = htmlElement.hasAttribute(name)
    const receivedValue = htmlElement.getAttribute(name)
    return {
      pass: isExpectedValuePresent
        ? hasAttribute && receivedValue === expectedValue
        : hasAttribute,
      message: () => {
        const to = this.isNot ? 'not to' : 'to'
        const receivedAttribute = receivedColor(
          hasAttribute
            ? printAttribute(name, receivedValue)
            : 'attribute was not found',
        )
        const expectedMsg = `Expected the element ${to} have attribute:\n  ${expectedColor(
          printAttribute(name, expectedValue),
        )}`
        const matcher = matcherHint(
          `${this.isNot ? '.not' : ''}.toHaveAttribute`,
          'element',
          printExpected(name),
          {
            secondArgument: isExpectedValuePresent
              ? printExpected(expectedValue)
              : undefined,
            comment: getAttributeComment(name, expectedValue),
          },
        )
        return `${matcher}\n\n${expectedMsg}\nReceived:\n  ${receivedAttribute}`
      },
    }
  },
}

export default extensions
