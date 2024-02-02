import * as React from 'react'
import {render, fireEvent, screen, waitFor, renderHook} from '.'
import * as pure from './pure'

export async function testRender() {
  const view = render(<button />)

  // single queries
  view.getByText('foo')
  view.queryByText('foo')
  await view.findByText('foo')

  // multiple queries
  view.getAllByText('bar')
  view.queryAllByText('bar')
  await view.findAllByText('bar')

  // helpers
  const {container, rerender, debug} = view
  expectType<HTMLElement, typeof container>(container)
  return {container, rerender, debug}
}

export async function testPureRender() {
  const view = pure.render(<button />)

  // single queries
  view.getByText('foo')
  view.queryByText('foo')
  await view.findByText('foo')

  // multiple queries
  view.getAllByText('bar')
  view.queryAllByText('bar')
  await view.findAllByText('bar')

  // helpers
  const {container, rerender, debug} = view
  expectType<HTMLElement, typeof container>(container)
  return {container, rerender, debug}
}

export function testRenderOptions() {
  const container = document.createElement('div')
  const options = {container}
  const {container: returnedContainer} = render(<button />, options)
  expectType<HTMLDivElement, typeof returnedContainer>(returnedContainer)
}

export function testSVGRenderOptions() {
  const container = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  )
  const options = {container}
  const {container: returnedContainer} = render(<path />, options)
  expectType<SVGSVGElement, typeof returnedContainer>(returnedContainer)
}

export function testFireEvent() {
  const {container} = render(<button />)
  fireEvent.click(container)
}

export function testConfigure() {
  // test for DTL's config
  pure.configure({testIdAttribute: 'foobar'})
  pure.configure(existingConfig => ({
    testIdAttribute: `modified-${existingConfig.testIdAttribute}`,
  }))

  // test for RTL's config
  pure.configure({reactStrictMode: true})
  pure.configure(existingConfig => ({
    reactStrictMode: !existingConfig.reactStrictMode,
  }))
}

export function testGetConfig() {
  // test for DTL's config
  pure.getConfig().testIdAttribute

  // test for RTL's config
  pure.getConfig().reactStrictMode
}

export function testDebug() {
  const {debug, getAllByTestId} = render(
    <>
      <h2 data-testid="testid">Hello World</h2>
      <h2 data-testid="testid">Hello World</h2>
    </>,
  )
  debug(getAllByTestId('testid'))
}

export async function testScreen() {
  render(<button />)

  await screen.findByRole('button')
}

export async function testWaitFor() {
  const {container} = render(<button />)
  fireEvent.click(container)
  await waitFor(() => {})
}

export function testQueries() {
  const {getByLabelText} = render(
    <label htmlFor="usernameInput">Username</label>,
  )
  expectType<HTMLElement, ReturnType<typeof getByLabelText>>(
    getByLabelText('Username'),
  )

  const container = document.createElement('div')
  const options = {container}
  const {getByText} = render(<div>Hello World</div>, options)
  expectType<HTMLElement, ReturnType<typeof getByText>>(
    getByText('Hello World'),
  )
}

export function wrappedRender(
  ui: React.ReactElement | React.ReactNode,
  options?: pure.RenderOptions,
) {
  const Wrapper = ({
    children,
  }: {
    children: React.ReactElement | React.ReactNode
  }): JSX.Element => {
    return <div>{children}</div>
  }

  return pure.render(ui, {wrapper: Wrapper, ...options})
}

export function wrappedRenderB(
  ui: React.ReactElement | React.ReactNode,
  options?: pure.RenderOptions,
) {
  const Wrapper: React.FunctionComponent<{children?: React.ReactNode}> = ({
    children,
  }) => {
    return <div>{children}</div>
  }

  return pure.render(ui, {wrapper: Wrapper, ...options})
}

export function wrappedRenderC(
  ui: React.ReactElement | React.ReactNode,
  options?: pure.RenderOptions,
) {
  interface AppWrapperProps {
    children?: React.ReactNode
    userProviderProps?: {user: string}
  }
  const AppWrapperProps: React.FunctionComponent<AppWrapperProps> = ({
    children,
    userProviderProps = {user: 'TypeScript'},
  }) => {
    return <div data-testid={userProviderProps.user}>{children}</div>
  }

  return pure.render(ui, {wrapper: AppWrapperProps, ...options})
}

export function testBaseElement() {
  const {baseElement: baseDefaultElement} = render(<div />)
  expectType<HTMLElement, typeof baseDefaultElement>(baseDefaultElement)

  const container = document.createElement('input')
  const {baseElement: baseElementFromContainer} = render(<div />, {container})
  expectType<typeof container, typeof baseElementFromContainer>(
    baseElementFromContainer,
  )

  const baseElementOption = document.createElement('input')
  const {baseElement: baseElementFromOption} = render(<div />, {
    baseElement: baseElementOption,
  })
  expectType<typeof baseElementOption, typeof baseElementFromOption>(
    baseElementFromOption,
  )
}

export function testRenderHook() {
  const {result, rerender, unmount} = renderHook(() => React.useState(2)[0])

  expectType<number, typeof result.current>(result.current)

  rerender()

  unmount()
}

export function testRenderHookProps() {
  const {result, rerender, unmount} = renderHook(
    ({defaultValue}) => React.useState(defaultValue)[0],
    {initialProps: {defaultValue: 2}},
  )

  expectType<number, typeof result.current>(result.current)

  rerender()

  unmount()
}

/*
eslint
  testing-library/prefer-explicit-assert: "off",
  testing-library/no-wait-for-empty-callback: "off",
  testing-library/prefer-screen-queries: "off"
*/

// https://stackoverflow.com/questions/53807517/how-to-test-if-two-types-are-exactly-the-same
type IfEquals<T, U, Yes = unknown, No = never> = (<G>() => G extends T
  ? 1
  : 2) extends <G>() => G extends U ? 1 : 2
  ? Yes
  : No

/**
 * Issues a type error if `Expected` is not identical to `Actual`.
 *
 * `Expected` should be declared when invoking `expectType`.
 * `Actual` should almost always we be a `typeof value` statement.
 *
 * Source: https://github.com/mui-org/material-ui/blob/6221876a4b468a3330ffaafa8472de7613933b87/packages/material-ui-types/index.d.ts#L73-L84
 *
 * @example `expectType<number | string, typeof value>(value)`
 * TypeScript issues a type error since `value is not assignable to never`.
 * This means `typeof value` is not identical to `number | string`
 * @param actual
 */
declare function expectType<Expected, Actual>(
  actual: IfEquals<Actual, Expected, Actual>,
): void
