import * as React from 'react'
import {render, fireEvent, getConfig} from '../'

const {useState, useEffect, useRef} = React

const dispatchDOMEvent = (target, type) =>
  getConfig().eventWrapper(() =>
    target.dispatchEvent(new Event(type, {bubbles: true})),
  )

test('does not warn about act when there are nested acts', () => {
  function Fixture() {
    const [open, setOpen] = useState(false)
    const [fromEffect, setFromEffect] = useState(0)
    const [fromEvent, setFromEvent] = useState(0)
    const targetRef = useRef(null)

    useEffect(() => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (!open) {
        return
      }
      dispatchDOMEvent(targetRef.current, 'input')
      setFromEffect(n => n + 1)
    }, [open])

    return (
      <>
        <button onClick={() => setOpen(true)}>
          {`open:${open} effect:${fromEffect} event:${fromEvent}`}
        </button>
        <input
          ref={targetRef}
          readOnly
          onInput={() => setFromEvent(n => n + 1)}
        />
      </>
    )
  }

  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  const {container} = render(<Fixture />)
  const button = container.querySelector('button')

  fireEvent.click(button)

  expect(button).toHaveTextContent('open:true effect:1 event:1')
  const actWarnings = errorSpy.mock.calls
    .map(args => String(args[0]))
    .filter(message => message.includes('not wrapped in act'))
  expect(actWarnings).toEqual([])

  errorSpy.mockRestore()
})
