import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {render, fireEvent} from '../'

const eventTypes = [
  {
    type: 'Clipboard',
    events: ['copy', 'paste'],
    elementType: 'input',
  },
  {
    type: 'Composition',
    events: ['compositionEnd', 'compositionStart', 'compositionUpdate'],
    elementType: 'input',
  },
  {
    type: 'Keyboard',
    events: ['keyDown', 'keyPress', 'keyUp'],
    elementType: 'input',
    init: {keyCode: 13},
  },
  {
    type: 'Focus',
    events: ['focus', 'blur'],
    elementType: 'input',
  },
  {
    type: 'Form',
    events: ['focus', 'blur'],
    elementType: 'input',
  },
  {
    type: 'Focus',
    events: ['input', 'invalid'],
    elementType: 'input',
  },
  {
    type: 'Focus',
    events: ['submit'],
    elementType: 'form',
  },
  {
    type: 'Mouse',
    events: [
      'click',
      'contextMenu',
      'doubleClick',
      'drag',
      'dragEnd',
      'dragEnter',
      'dragExit',
      'dragLeave',
      'dragOver',
      'dragStart',
      'drop',
      'mouseDown',
      'mouseEnter',
      'mouseLeave',
      'mouseMove',
      'mouseOut',
      'mouseOver',
      'mouseUp',
    ],
    elementType: 'button',
  },
  {
    type: 'Pointer',
    events: [
      'pointerOver',
      'pointerEnter',
      'pointerDown',
      'pointerMove',
      'pointerUp',
      'pointerCancel',
      'pointerOut',
      'pointerLeave',
      'gotPointerCapture',
      'lostPointerCapture',
    ],
    elementType: 'button',
  },
  {
    type: 'Selection',
    events: ['select'],
    elementType: 'input',
  },
  {
    type: 'Touch',
    events: ['touchCancel', 'touchEnd', 'touchMove', 'touchStart'],
    elementType: 'button',
  },
  {
    type: 'UI',
    events: ['scroll'],
    elementType: 'div',
  },
  {
    type: 'Wheel',
    events: ['wheel'],
    elementType: 'div',
  },
  {
    type: 'Media',
    events: [
      'abort',
      'canPlay',
      'canPlayThrough',
      'durationChange',
      'emptied',
      'encrypted',
      'ended',
      'error',
      'loadedData',
      'loadedMetadata',
      'loadStart',
      'pause',
      'play',
      'playing',
      'progress',
      'rateChange',
      'seeked',
      'seeking',
      'stalled',
      'suspend',
      'timeUpdate',
      'volumeChange',
      'waiting',
    ],
    elementType: 'video',
  },
  {
    type: 'Image',
    events: ['load', 'error'],
    elementType: 'img',
  },
  {
    type: 'Animation',
    events: ['animationStart', 'animationEnd', 'animationIteration'],
    elementType: 'div',
  },
  {
    type: 'Transition',
    events: ['transitionEnd'],
    elementType: 'div',
  },
]

eventTypes.forEach(({type, events, elementType, init}) => {
  describe(`${type} Events`, () => {
    events.forEach(eventName => {
      const propName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(
        1,
      )}`

      it(`triggers ${propName}`, () => {
        const ref = React.createRef()
        const spy = jest.fn()

        render(
          React.createElement(elementType, {
            [propName]: spy,
            ref,
          }),
        )

        fireEvent[eventName](ref.current, init)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})

eventTypes.forEach(({type, events, elementType, init}) => {
  describe(`Native ${type} Events`, () => {
    events.forEach(eventName => {
      let nativeEventName = eventName.toLowerCase()

      // The doubleClick synthetic event maps to the dblclick native event
      if (nativeEventName === 'doubleclick') {
        nativeEventName = 'dblclick'
      }

      it(`triggers native ${nativeEventName}`, () => {
        const ref = React.createRef()
        const spy = jest.fn()
        const Element = elementType

        const NativeEventElement = () => {
          React.useEffect(() => {
            const element = ref.current
            element.addEventListener(nativeEventName, spy)
            return () => {
              element.removeEventListener(nativeEventName, spy)
            }
          })
          return <Element ref={ref} />
        }

        render(<NativeEventElement />)

        fireEvent[eventName](ref.current, init)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})

test('onChange works', () => {
  const handleChange = jest.fn()
  const {
    container: {firstChild: input},
  } = render(<input onChange={handleChange} />)
  fireEvent.change(input, {target: {value: 'a'}})
  expect(handleChange).toHaveBeenCalledTimes(1)
})

test('calling `fireEvent` directly works too', () => {
  const handleEvent = jest.fn()
  const {
    container: {firstChild: button},
  } = render(<button onClick={handleEvent} />)
  fireEvent(
    button,
    new Event('MouseEvent', {
      bubbles: true,
      cancelable: true,
      button: 0,
    }),
  )
})

test('blur/focus bubbles in react', () => {
  const handleBlur = jest.fn()
  const handleBubbledBlur = jest.fn()
  const handleFocus = jest.fn()
  const handleBubbledFocus = jest.fn()
  const {container} = render(
    <div onBlur={handleBubbledBlur} onFocus={handleBubbledFocus}>
      <button onBlur={handleBlur} onFocus={handleFocus} />
    </div>,
  )
  const button = container.firstChild.firstChild

  fireEvent.focus(button)

  expect(handleBlur).toHaveBeenCalledTimes(0)
  expect(handleBubbledBlur).toHaveBeenCalledTimes(0)
  expect(handleFocus).toHaveBeenCalledTimes(1)
  expect(handleBubbledFocus).toHaveBeenCalledTimes(1)

  fireEvent.blur(button)

  expect(handleBlur).toHaveBeenCalledTimes(1)
  expect(handleBubbledBlur).toHaveBeenCalledTimes(1)
  expect(handleFocus).toHaveBeenCalledTimes(1)
  expect(handleBubbledFocus).toHaveBeenCalledTimes(1)
})

test('discrete events are not wrapped in act', () => {
  function AddDocumentClickListener({onClick}) {
    React.useEffect(() => {
      document.addEventListener('click', onClick)
      return () => {
        document.removeEventListener('click', onClick)
      }
    }, [onClick])
    return null
  }
  function Component({onDocumentClick}) {
    const [open, setOpen] = React.useState(false)

    return (
      <React.Fragment>
        <button onClick={() => setOpen(true)} />
        {open &&
          ReactDOM.createPortal(
            <AddDocumentClickListener onClick={onDocumentClick} />,
            document.body,
          )}
      </React.Fragment>
    )
  }
  const onDocumentClick = jest.fn()
  render(<Component onDocumentClick={onDocumentClick} />)

  const button = document.querySelector('button')
  fireEvent.click(button)

  // We added a native click listener from an effect.
  // There are two possible scenarios:
  // 1. If that effect is flushed during the click the native click listener would still receive the event that caused the native listener to be added.
  // 2. If that effect is flushed before we return from fireEvent.click the native click listener would not receive the event that caused the native listener to be added.
  // React flushes effects scheduled from an update by a "discrete" event immediately.
  // but not effects in a batched context (e.g. act(() => {}))
  // So if we were in act(() => {}), we would see scenario 2 i.e. `onDocumentClick` would not be called
  // If we were not in `act(() => {})`, we would see scenario 1 i.e. `onDocumentClick` would already be called
  expect(onDocumentClick).toHaveBeenCalledTimes(1)

  // verify we did actually flush the effect before we returned from `fireEvent.click` i.e. the native click listener is mounted.
  document.dispatchEvent(
    new MouseEvent('click', {bubbles: true, cancelable: true}),
  )
  expect(onDocumentClick).toHaveBeenCalledTimes(2)
})
