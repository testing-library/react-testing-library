import {fireEvent as dtlFireEvent} from '@testing-library/dom'

// react-testing-library's version of fireEvent will call
// dom-testing-library's version of fireEvent. The reason
// we make this distinction however is because we have
// a few extra events that work a bit differently
const fireEvent = (...args) => dtlFireEvent(...args)

Object.keys(dtlFireEvent).forEach(key => {
  fireEvent[key] = (...args) => dtlFireEvent[key](...args)
})

// React event system tracks native mouseOver/mouseOut events for
// running onMouseEnter/onMouseLeave handlers
// @link https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/react-dom/src/events/EnterLeaveEventPlugin.js#L24-L31
const mouseEnter = fireEvent.mouseEnter
const mouseLeave = fireEvent.mouseLeave
fireEvent.mouseEnter = async (...args) => {
  await mouseEnter(...args)
  return fireEvent.mouseOver(...args)
}
fireEvent.mouseLeave = async (...args) => {
  await mouseLeave(...args)
  return fireEvent.mouseOut(...args)
}

const pointerEnter = fireEvent.pointerEnter
const pointerLeave = fireEvent.pointerLeave
fireEvent.pointerEnter = async (...args) => {
  await pointerEnter(...args)
  return fireEvent.pointerOver(...args)
}
fireEvent.pointerLeave = async (...args) => {
  await pointerLeave(...args)
  return fireEvent.pointerOut(...args)
}

const select = fireEvent.select
fireEvent.select = async (node, init) => {
  await select(node, init)
  // React tracks this event only on focused inputs
  node.focus()

  // React creates this event when one of the following native events happens
  // - contextMenu
  // - mouseUp
  // - dragEnd
  // - keyUp
  // - keyDown
  // so we can use any here
  // @link https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/react-dom/src/events/SelectEventPlugin.js#L203-L224
  await fireEvent.keyUp(node, init)
}

// React event system tracks native focusout/focusin events for
// running blur/focus handlers
// @link https://github.com/facebook/react/pull/19186
const blur = fireEvent.blur
const focus = fireEvent.focus
fireEvent.blur = async (...args) => {
  await fireEvent.focusOut(...args)
  return blur(...args)
}
fireEvent.focus = async (...args) => {
  await fireEvent.focusIn(...args)
  return focus(...args)
}

export {fireEvent}
