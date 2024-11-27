// TODO: Upstream that the rule should check import source
/* eslint-disable testing-library/no-await-sync-events */
import * as React from 'react'
import {act, render, fireEvent} from '../async'

const isReact19 = React.version.startsWith('19.')

const testGateReact19 = isReact19 ? test : test.skip

testGateReact19('async data requires async APIs', async () => {
  let resolve
  const promise = new Promise(_resolve => {
    resolve = _resolve
  })

  function Component() {
    const value = React.use(promise)
    return <div>{value}</div>
  }

  const {container} = await render(
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

testGateReact19('async fireEvent', async () => {
  let resolve
  function Component() {
    const [promise, setPromise] = React.useState('initial')
    const value = typeof promise === 'string' ? promise : React.use(promise)
    return (
      <button
        onClick={() =>
          setPromise(
            new Promise(_resolve => {
              resolve = _resolve
            }),
          )
        }
      >
        Value: {value}
      </button>
    )
  }

  const {container} = await render(
    <React.Suspense fallback="loading...">
      <Component />
    </React.Suspense>,
  )

  expect(container).toHaveTextContent('Value: initial')

  await fireEvent.click(container.querySelector('button'))

  expect(container).toHaveTextContent('loading...')

  await act(() => {
    resolve('Hello, Dave!')
  })

  expect(container).toHaveTextContent('Hello, Dave!')
})
