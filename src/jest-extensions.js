//eslint-disable-next-line import/no-extraneous-dependencies
import {
  matcherHint,
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

function getMessage(
  matcher,
  expectedLabel,
  expectedValue,
  receivedLabel,
  receivedValue,
) {
  return [
    `${matcher}\n`,
    `${expectedLabel}:\n  ${expectedColor(expectedValue)}`,
    `${receivedLabel}:\n  ${receivedColor(receivedValue)}`,
  ].join('\n')
}

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
    return {
      pass: !!received,
      message: () => {
        const to = this.isNot ? 'not to' : 'to'
        return getMessage(
          matcherHint(
            `${this.isNot ? '.not' : ''}.toBeInTheDOM`,
            'element',
            '',
          ),
          'Expected',
          `element ${to} be present`,
          'Received',
          received,
        )
      },
    }
  },

  toHaveTextContent(htmlElement, checkWith) {
    checkHtmlElement(htmlElement)
    const textContent = htmlElement.textContent
    return {
      pass: matches(textContent, htmlElement, checkWith),
      message: () => {
        const to = this.isNot ? 'not to' : 'to'
        return getMessage(
          matcherHint(
            `${this.isNot ? '.not' : ''}.toHaveTextContent`,
            'element',
            '',
          ),
          `Expected element ${to} have text content`,
          checkWith,
          'Received',
          textContent,
        )
      },
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
        const receivedAttribute = hasAttribute
          ? printAttribute(name, receivedValue)
          : null
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
        return getMessage(
          matcher,
          `Expected the element ${to} have attribute`,
          printAttribute(name, expectedValue),
          'Received',
          receivedAttribute,
        )
      },
    }
  },
}

export default extensions
