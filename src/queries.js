import {matches} from './utils'
import prettyFormat from 'pretty-format' // eslint-disable-line
const {DOMElement} = prettyFormat.plugins

// Here are the queries for the library.
// The queries here should only be things that are accessible to both users who are using a screen reader
// and those who are not using a screen reader (with the exception of the data-testid attribute query).

function queryLabelByText(container, text) {
  return (
    Array.from(container.querySelectorAll('label')).find(label =>
      matches(label.textContent, label, text),
    ) || null
  )
}

function queryByLabelText(container, text, {selector = '*'} = {}) {
  const label = queryLabelByText(container, text)
  if (!label) {
    return queryByAttribute('aria-label', container, text)
  }
  /* istanbul ignore if */
  if (label.control) {
    // appears to be unsupported in jsdom: https://github.com/jsdom/jsdom/issues/2175
    // but this would be the proper way to do things
    return label.control
  } else if (label.getAttribute('for')) {
    // <label for="someId">text</label><input id="someId" />
    return container.querySelector(`#${label.getAttribute('for')}`)
  } else if (label.getAttribute('id')) {
    // <label id="someId">text</label><input aria-labelledby="someId" />
    return container.querySelector(
      `[aria-labelledby="${label.getAttribute('id')}"]`,
    )
  } else if (label.childNodes.length) {
    // <label>text: <input /></label>
    return label.querySelector(selector)
  } else {
    return null
  }
}

function queryByText(container, text, {selector = '*'} = {}) {
  return (
    Array.from(container.querySelectorAll(selector)).find(node =>
      matches(getText(node), node, text),
    ) || null
  )
}

// this is just a utility and not an exposed query.
// There are no plans to expose this.
function queryByAttribute(attribute, container, text) {
  return (
    Array.from(container.querySelectorAll(`[${attribute}]`)).find(node =>
      matches(node.getAttribute(attribute), node, text),
    ) || null
  )
}

const queryByPlaceholderText = queryByAttribute.bind(null, 'placeholder')
const queryByTestId = queryByAttribute.bind(null, 'data-testid')

// this is just a utility and not an exposed query.
// There are no plans to expose this.
function getText(node) {
  return Array.from(node.childNodes)
    .filter(
      child => child.nodeType === Node.TEXT_NODE && Boolean(child.textContent),
    )
    .map(c => c.textContent)
    .join(' ')
}

// getters
// the reason we're not dynamically generating these functions that look so similar:
// 1. The error messages are specific to each one and depend on arguments
// 2. The stack trace will look better because it'll have a helpful method name.

function getByTestId(container, id, ...rest) {
  const el = queryByTestId(container, id, ...rest)
  if (!el) {
    const htmlElement = checkDebugLimit(
      prettyFormat(container, {
        plugins: [DOMElement],
        printFunctionName: false,
        highlight: true,
      }),
    )
    throw new Error(
      `Unable to find an element by: [data-testid="${id}"] \nHere is the state of your container: \n${htmlElement}`,
    )
  }
  return el
}

function getByPlaceholderText(container, text, ...rest) {
  const el = queryByPlaceholderText(container, text, ...rest)
  if (!el) {
    const htmlElement = checkDebugLimit(
      prettyFormat(container, {
        plugins: [DOMElement],
        printFunctionName: false,
        highlight: true,
      }),
    )
    throw new Error(
      `Unable to find an element with the placeholder text of: ${text} \nHere is the state of your container: \n${htmlElement}`,
    )
  }
  return el
}

function getByLabelText(container, text, ...rest) {
  const el = queryByLabelText(container, text, ...rest)
  if (!el) {
    const label = queryLabelByText(container, text)
    const htmlElement = checkDebugLimit(
      prettyFormat(container, {
        plugins: [DOMElement],
        printFunctionName: false,
        highlight: true,
      }),
    )
    if (label) {
      throw new Error(
        `Found a label with the text of: ${text}, however no form control was found associated to that label. Make sure you're using the "for" attribute or "aria-labelledby" attribute correctly.` +
          `\nHere is the state of your container:\n${htmlElement}`,
      )
    } else {
      throw new Error(
        `Unable to find a label with the text of: ${text}\nHere is the state of your container:\n${htmlElement}`,
      )
    }
  }
  return el
}

function getByText(container, text, ...rest) {
  const el = queryByText(container, text, ...rest)
  if (!el) {
    const htmlElement = checkDebugLimit(
      prettyFormat(container, {
        plugins: [DOMElement],
        printFunctionName: false,
        highlight: true,
      }),
    )
    throw new Error(
      `Unable to find an element with the text: ${text}. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.` +
        `\nHere is the state of your container: \n${htmlElement}`,
    )
  }
  return el
}

function queryByAltText(container, alt) {
  return (
    Array.from(container.querySelectorAll('img,input,area')).find(node =>
      matches(node.getAttribute('alt'), node, alt),
    ) || null
  )
}

function getByAltText(container, alt) {
  const el = queryByAltText(container, alt)
  if (!el) {
    const htmlElement = checkDebugLimit(
      prettyFormat(container, {
        plugins: [DOMElement],
        printFunctionName: false,
        highlight: true,
      }),
    )
    throw new Error(
      `Unable to find an element with the alt text: ${alt} \nHere is the state of your container: \n${htmlElement}`,
    )
  }
  return el
}

function checkDebugLimit(debugContent) {
  const limit = process.env.DEBUG_PRINT_LIMIT
  if (limit) {
    const contentLength = debugContent.length
    debugContent = debugContent.slice(0, limit)
    if (limit <= contentLength)
      // there are more chars we have stripped, just show to the user
      debugContent += '\n . . .'
  } else {
    // default limit is 7000
    const contentLength = debugContent.length
    debugContent = debugContent.slice(0, 7000)
    if (contentLength >= 7000)
      // there are more chars we have stripped, just show to the user
      debugContent += '\n . . .'
  }

  return debugContent
}

export {
  queryByPlaceholderText,
  getByPlaceholderText,
  queryByText,
  getByText,
  queryByLabelText,
  getByLabelText,
  queryByAltText,
  getByAltText,
  queryByTestId,
  getByTestId,
}

/* eslint complexity:["error", 14] */
