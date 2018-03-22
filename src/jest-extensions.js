const extensions = {
  toBeInTheDOM(received) {
    if (received) {
      return {
        message: () => 'expected the dom to be present',
        pass: true,
      }
    } else {
      return {
        message: () => 'expected the dom not to be present',
        pass: false,
      }
    }
  },

  toHaveTextContent(htmlElement, checkWith) {
    const textContent = htmlElement.textContent
    const pass = textContent === checkWith
    if (pass) {
      return {
        message: () => `expected ${textContent} not equals to ${checkWith}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${textContent} equals to ${checkWith}`,
        pass: false,
      }
    }
  },

  toSatisfyDOM(element, fn) {
    const pass = fn(element)
    if (pass) {
      return {
        message: () => 'expected condition not equals to true',
        pass: true,
      }
    } else {
      return {
        message: () => 'expected condition equals to true',
        pass: false,
      }
    }
  },
}

export default extensions
