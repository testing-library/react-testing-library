import * as React from 'react'
import {render, configure} from '../'

describe('rerender API', () => {
  let originalConfig
  beforeEach(() => {
    // Grab the existing configuration so we can restore
    // it at the end of the test
    configure(existingConfig => {
      originalConfig = existingConfig
      // Don't change the existing config
      return {}
    })
  })

  afterEach(() => {
    configure(originalConfig)
  })

  test('rerender will re-render the element', async () => {
    const Greeting = props => <div>{props.message}</div>
    const {container, rerender} = await render(<Greeting message="hi" />)
    expect(container.firstChild).toHaveTextContent('hi')
    await rerender(<Greeting message="hey" />)
    expect(container.firstChild).toHaveTextContent('hey')
  })

  test('hydrate will not update props until next render', async () => {
    const initialInputElement = document.createElement('input')
    const container = document.createElement('div')
    container.appendChild(initialInputElement)
    document.body.appendChild(container)

    const firstValue = 'hello'
    const {rerender} = await render(
      <input value={firstValue} onChange={() => null} />,
      {
        container,
        hydrate: true,
      },
    )

    expect(initialInputElement).toHaveValue(firstValue)

    const secondValue = 'goodbye'
    await rerender(<input value={secondValue} onChange={() => null} />)
    expect(initialInputElement).toHaveValue(secondValue)
  })

  test('re-renders options.wrapper around node when reactStrictMode is true', async () => {
    configure({reactStrictMode: true})

    const WrapperComponent = ({children}) => (
      <div data-testid="wrapper">{children}</div>
    )
    const Greeting = props => <div>{props.message}</div>
    const {container, rerender} = await render(<Greeting message="hi" />, {
      wrapper: WrapperComponent,
    })

    expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      data-testid=wrapper
    >
      <div>
        hi
      </div>
    </div>
  `)

    await rerender(<Greeting message="hey" />)
    expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      data-testid=wrapper
    >
      <div>
        hey
      </div>
    </div>
  `)
  })

  test('re-renders twice when reactStrictMode is true', async () => {
    configure({reactStrictMode: true})

    const spy = jest.fn()
    function Component() {
      spy()
      return null
    }

    const {rerender} = await render(<Component />)
    expect(spy).toHaveBeenCalledTimes(2)

    spy.mockClear()
    await rerender(<Component />)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
