//eslint-disable-next-line import/prefer-default-export
export function matches(textToMatch, node, matcher) {
  if (typeof textToMatch !== 'string') {
    return false
  }
  if (typeof matcher === 'string') {
    return textToMatch.toLowerCase().includes(matcher.toLowerCase())
  } else if (typeof matcher === 'function') {
    return matcher(textToMatch, node)
  } else {
    return matcher.test(textToMatch)
  }
}
