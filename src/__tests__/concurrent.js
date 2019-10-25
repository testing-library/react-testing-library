import React from 'react'
import {render} from '../'

test('simple render works like legacy', () => {
  const {container} = render(<div>test</div>, {root: 'concurrent'})

  expect(container).toHaveTextContent('test')
})

test('unmounts are flushed in sync', () => {
  const {container, unmount} = render(<div>test</div>, {root: 'concurrent'})

  unmount()

  expect(container.children).toHaveLength(0)
})

test('rerender are flushed in sync', () => {
  const {container, rerender} = render(<div>foo</div>, {root: 'concurrent'})

  rerender(<div>bar</div>)

  expect(container).toHaveTextContent('foo')
})
