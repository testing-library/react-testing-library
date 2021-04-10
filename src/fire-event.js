import {fireEvent as dtlFireEvent} from '@testing-library/dom'
import act from './act-compat'

// https://github.com/facebook/react/blob/b48b38af68c27fd401fe4b923a8fa0b229693cd4/packages/react-dom/src/events/ReactDOMEventListener.js#L310-L366
const discreteEvents = new Set([
  'cancel',
  'click',
  'close',
  'contextmenu',
  'copy',
  'cut',
  'auxclick',
  'dblclick',
  'dragend',
  'dragstart',
  'drop',
  'focusin',
  'focusout',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'mousedown',
  'mouseup',
  'paste',
  'pause',
  'play',
  'pointercancel',
  'pointerdown',
  'pointerup',
  'ratechange',
  'reset',
  'seeked',
  'submit',
  'touchcancel',
  'touchend',
  'touchstart',
  'volumechange',
  'change',
  'selectionchange',
  'textInput',
  'compositionstart',
  'compositionend',
  'compositionupdate',
  'beforeblur',
  'afterblur',
  'beforeinput',
  'blur',
  'fullscreenchange',
  'focus',
  'hashchange',
  'popstate',
  'select',
  'selectstart',
])
function isDiscreteEvent(type) {
  return discreteEvents.has(type)
}

function noAct(callback) {
  // Don't alter semantics of `callback`.
  callback()
  // But make sure updates are flushed before returning.
  act(() => {})
}

// react-testing-library's version of fireEvent will call
// dom-testing-library's version of fireEvent. The reason
// we make this distinction however is because we have
// a few extra events that work a bit differently
function fireEvent(element, event, ...args) {
  // `act` would simulate how this event would behave if dispatched from a React event listener.
  // In almost all cases we want to simulate how this event behaves in response to a user interaction.
  // See discussion in https://github.com/facebook/react/pull/21202
  const eventWrapper = isDiscreteEvent(event.type) ? noAct : act

  let fireEventReturnValue
  eventWrapper(() => {
    fireEventReturnValue = dtlFireEvent(element, event, ...args)
  })
  return fireEventReturnValue
}

Object.keys(dtlFireEvent).forEach(key => {
  fireEvent[key] = (element, ...args) => {
    // `act` would simulate how this event would behave if dispatched from a React event listener.
    // In almost all cases we want to simulate how this event behaves in response to a user interaction.
    // See discussion in https://github.com/facebook/react/pull/21202
    const eventWrapper = isDiscreteEvent(key.toLowerCase()) ? noAct : act

    let fireEventReturnValue
    eventWrapper(() => {
      fireEventReturnValue = dtlFireEvent[key](element, ...args)
    })
    return fireEventReturnValue
  }
})

// React event system tracks native mouseOver/mouseOut events for
// running onMouseEnter/onMouseLeave handlers
// @link https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/react-dom/src/events/EnterLeaveEventPlugin.js#L24-L31
const mouseEnter = fireEvent.mouseEnter
const mouseLeave = fireEvent.mouseLeave
fireEvent.mouseEnter = (...args) => {
  mouseEnter(...args)
  return fireEvent.mouseOver(...args)
}
fireEvent.mouseLeave = (...args) => {
  mouseLeave(...args)
  return fireEvent.mouseOut(...args)
}

const pointerEnter = fireEvent.pointerEnter
const pointerLeave = fireEvent.pointerLeave
fireEvent.pointerEnter = (...args) => {
  pointerEnter(...args)
  return fireEvent.pointerOver(...args)
}
fireEvent.pointerLeave = (...args) => {
  pointerLeave(...args)
  return fireEvent.pointerOut(...args)
}

const select = fireEvent.select
fireEvent.select = (node, init) => {
  select(node, init)
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
  fireEvent.keyUp(node, init)
}

// React event system tracks native focusout/focusin events for
// running blur/focus handlers
// @link https://github.com/facebook/react/pull/19186
const blur = fireEvent.blur
const focus = fireEvent.focus
fireEvent.blur = (...args) => {
  fireEvent.focusOut(...args)
  return blur(...args)
}
fireEvent.focus = (...args) => {
  fireEvent.focusIn(...args)
  return focus(...args)
}

export {fireEvent}
