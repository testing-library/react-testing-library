import React from 'react'
import {render} from '../'

test('simple render works like legacy', () => {
  const {container} = render(<div>test</div>, {root: 'concurrent'})

  expect(container).toHaveTextContent('test')
})

test('unmount calls back  after commit', () => {
  const {container, unmount} = render(<div>test</div>, {root: 'concurrent'})

  unmount(() => {
    expect(container.children).toHaveLength(0)
  })
  expect(container.children).toHaveLength(1)
})

test('rerender calls back after commit', () => {
  const {container, rerender} = render(<div>foo</div>, {root: 'concurrent'})

  rerender(<div>bar</div>, () => {
    expect(container).toHaveTextContent('bar')
  })
  expect(container).toHaveTextContent('foo')
})
