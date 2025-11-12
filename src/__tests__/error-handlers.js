/* eslint-disable jest/no-if */
/* eslint-disable jest/no-conditional-in-test */
/* eslint-disable jest/no-conditional-expect */
import * as React from 'react'
import {render, renderHook} from '../'

const isReact19 = React.version.startsWith('19.')

const testGateReact19 = isReact19 ? test : test.skip

test('render errors', async () => {
  function Thrower() {
    throw new Error('Boom!')
  }

  if (isReact19) {
    await expect(async () => {
      await render(<Thrower />)
    }).rejects.toThrow('Boom!')
  } else {
    await expect(async () => {
      await expect(async () => {
        await render(<Thrower />)
      }).rejects.toThrow('Boom!')
    }).toErrorDev([
      'Error: Uncaught [Error: Boom!]',
      // React retries on error
      'Error: Uncaught [Error: Boom!]',
    ])
  }
})

test('onUncaughtError is not supported in render', async () => {
  function Thrower() {
    throw new Error('Boom!')
  }
  const onUncaughtError = jest.fn(() => {})

  await expect(async () => {
    await render(<Thrower />, {
      onUncaughtError(error, errorInfo) {
        console.log({error, errorInfo})
      },
    })
  }).rejects.toThrow(
    'onUncaughtError is not supported. The `render` call will already throw on uncaught errors.',
  )

  expect(onUncaughtError).toHaveBeenCalledTimes(0)
})

testGateReact19('onCaughtError is supported in render', async () => {
  const thrownError = new Error('Boom!')
  const handleComponentDidCatch = jest.fn()
  const onCaughtError = jest.fn()
  class ErrorBoundary extends React.Component {
    state = {error: null}
    static getDerivedStateFromError(error) {
      return {error}
    }
    componentDidCatch(error, errorInfo) {
      handleComponentDidCatch(error, errorInfo)
    }
    render() {
      if (this.state.error) {
        return null
      }
      return this.props.children
    }
  }
  function Thrower() {
    throw thrownError
  }

  await render(
    <ErrorBoundary>
      <Thrower />
    </ErrorBoundary>,
    {
      onCaughtError,
    },
  )

  expect(onCaughtError).toHaveBeenCalledWith(thrownError, {
    componentStack: expect.any(String),
    errorBoundary: expect.any(Object),
  })
})

test('onRecoverableError is supported in render', async () => {
  const onRecoverableError = jest.fn()

  const container = document.createElement('div')
  container.innerHTML = '<div>server</div>'
  // We just hope we forwarded the callback correctly (which is guaranteed since we just pass it along)
  // Frankly, I'm too lazy to assert on React 18 hydration errors since they're a mess.
  // eslint-disable-next-line jest/no-conditional-in-test
  if (isReact19) {
    await render(<div>client</div>, {
      container,
      hydrate: true,
      onRecoverableError,
    })
    expect(onRecoverableError).toHaveBeenCalledTimes(1)
  } else {
    await expect(async () => {
      await render(<div>client</div>, {
        container,
        hydrate: true,
        onRecoverableError,
      })
    }).toErrorDev(['', ''], {withoutStack: 1})
    expect(onRecoverableError).toHaveBeenCalledTimes(2)
  }
})

test('onUncaughtError is not supported in renderHook', async () => {
  function useThrower() {
    throw new Error('Boom!')
  }
  const onUncaughtError = jest.fn(() => {})

  await expect(async () => {
    await renderHook(useThrower, {
      onUncaughtError(error, errorInfo) {
        console.log({error, errorInfo})
      },
    })
  }).rejects.toThrow(
    'onUncaughtError is not supported. The `render` call will already throw on uncaught errors.',
  )

  expect(onUncaughtError).toHaveBeenCalledTimes(0)
})

testGateReact19('onCaughtError is supported in renderHook', async () => {
  const thrownError = new Error('Boom!')
  const handleComponentDidCatch = jest.fn()
  const onCaughtError = jest.fn()
  class ErrorBoundary extends React.Component {
    state = {error: null}
    static getDerivedStateFromError(error) {
      return {error}
    }
    componentDidCatch(error, errorInfo) {
      handleComponentDidCatch(error, errorInfo)
    }
    render() {
      if (this.state.error) {
        return null
      }
      return this.props.children
    }
  }
  function useThrower() {
    throw thrownError
  }

  await renderHook(useThrower, {
    onCaughtError,
    wrapper: ErrorBoundary,
  })

  expect(onCaughtError).toHaveBeenCalledWith(thrownError, {
    componentStack: expect.any(String),
    errorBoundary: expect.any(Object),
  })
})

// Currently, there's no recoverable error without hydration.
// The option is still supported though.
test('onRecoverableError is supported in renderHook', async () => {
  const onRecoverableError = jest.fn()

  await renderHook(
    () => {
      // TODO: trigger recoverable error
    },
    {
      onRecoverableError,
    },
  )
})
