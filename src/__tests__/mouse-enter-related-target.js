import * as React from 'react'
import {render, fireEvent, screen} from '../'

test('mouseEnter forwards relatedTarget correctly', () => {
  const handleMouseEnter = jest.fn()
  
  render(<div onMouseEnter={handleMouseEnter}>Hello</div>)
  
  const element = screen.getByText('Hello')
  const mockRelatedTarget = document.createElement('div')
  
  fireEvent.mouseEnter(element, {
    relatedTarget: mockRelatedTarget,
  })
  
  expect(handleMouseEnter).toHaveBeenCalledTimes(1)
  expect(handleMouseEnter.mock.calls[0][0].relatedTarget).toBe(mockRelatedTarget)
})

test('mouseOver forwards relatedTarget correctly (for comparison)', () => {
  const handleMouseOver = jest.fn()
  
  render(<div onMouseOver={handleMouseOver}>Hello</div>)
  
  const element = screen.getByText('Hello')
  const mockRelatedTarget = document.createElement('div')
  
  fireEvent.mouseOver(element, {
    relatedTarget: mockRelatedTarget,
  })
  
  expect(handleMouseOver).toHaveBeenCalledTimes(1)
  expect(handleMouseOver.mock.calls[0][0].relatedTarget).toBe(mockRelatedTarget)
})

test('pointerEnter forwards relatedTarget correctly', () => {
  const handlePointerEnter = jest.fn()
  
  render(<div onPointerEnter={handlePointerEnter}>Hello</div>)
  
  const element = screen.getByText('Hello')
  const mockRelatedTarget = document.createElement('div')
  
  fireEvent.pointerEnter(element, {
    relatedTarget: mockRelatedTarget,
  })
  
  expect(handlePointerEnter).toHaveBeenCalledTimes(1)
  expect(handlePointerEnter.mock.calls[0][0].relatedTarget).toBe(mockRelatedTarget)
})

test('mouseLeave forwards relatedTarget correctly', () => {
  const handleMouseLeave = jest.fn()
  
  render(<div onMouseLeave={handleMouseLeave}>Hello</div>)
  
  const element = screen.getByText('Hello')
  const mockRelatedTarget = document.createElement('div')
  
  fireEvent.mouseLeave(element, {
    relatedTarget: mockRelatedTarget,
  })
  
  expect(handleMouseLeave).toHaveBeenCalledTimes(1)
  expect(handleMouseLeave.mock.calls[0][0].relatedTarget).toBe(mockRelatedTarget)
})