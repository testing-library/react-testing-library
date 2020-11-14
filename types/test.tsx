import * as React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import * as pure from '@testing-library/react/pure'

export async function testRender() {
  const page = render(<div />)

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
  return {container, rerender, debug}
}

export async function testPureRender() {
  const page = pure.render(<div />)

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
  return {container, rerender, debug}
}

export function testRenderOptions() {
  const container = document.createElement('div')
  const options = {container}
  render(<div />, options)
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

/*
eslint
  testing-library/prefer-explicit-assert: "off",
  testing-library/no-wait-for-empty-callback: "off",
  testing-library/no-debug: "off",
  testing-library/prefer-screen-queries: "off"
*/
