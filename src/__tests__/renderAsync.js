import * as React from 'react'
import {act, renderAsync} from '../'

test('async data requires async APIs', async () => {
  const {promise, resolve} = Promise.withResolvers()

  function Component() {
    const value = React.use(promise)
    return <div>{value}</div>
  }

  const {container} = await renderAsync(
    <React.Suspense fallback="loading...">
      <Component />
    </React.Suspense>,
  )

  expect(container).toHaveTextContent('loading...')

  await act(async () => {
    resolve('Hello, Dave!')
  })

  expect(container).toHaveTextContent('Hello, Dave!')
})
