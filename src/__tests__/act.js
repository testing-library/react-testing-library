import * as React from 'react'
import {act, render} from '../'

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true
})

test('does not work outside IS_REACT_ENVIRONMENT like React.act', async () => {
  let setState
  function Component() {
    const [state, _setState] = React.useState(0)
    setState = _setState
    return state
  }
  await render(<Component />)

  global.IS_REACT_ACT_ENVIRONMENT = false
  await expect(async () => {
    await act(() => {
      setState(1)
    })
  }).toErrorDev(
    'The current testing environment is not configured to support act(...)',
    {withoutStack: true},
  )
})
