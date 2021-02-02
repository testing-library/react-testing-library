import * as React from 'react'
import {render, fireEvent, screen, waitFor} from '.'
import * as pure from './pure'

export async function testRender() {
  const page = render(<button />)

  // single queries
  page.getByText('foo')
  page.queryByText('foo')
  await page.findByText('foo')

  // multiple queries
  page.getAllByText('bar')
  page.queryAllByText('bar')
  await page.findAllByText('bar')

  // helpers
  const {container, rerender, debug} = page
  expectType<HTMLElement, typeof container>(container)
  return {container, rerender, debug}
}

export async function testPureRender() {
  const page = pure.render(<button />)

  // single queries
  page.getByText('foo')
  page.queryByText('foo')
  await page.findByText('foo')

  // multiple queries
  page.getAllByText('bar')
  page.queryAllByText('bar')
  await page.findAllByText('bar')

  // helpers
  const {container, rerender, debug} = page
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
  expectType<HTMLElement, ReturnType<typeof getByText>>(
    getByLabelText('Username'),
  )

  const container = document.createElement('div')
  const options = {container}
  const {getByText} = render(<div>Hello World</div>, options)
  expectType<HTMLElement, ReturnType<typeof getByText>>(
    getByText('Hello World'),
  )
}

/*
eslint
  testing-library/prefer-explicit-assert: "off",
  testing-library/no-wait-for-empty-callback: "off",
  testing-library/no-debug: "off",
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
