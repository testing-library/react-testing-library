import React from 'react'
import {render} from '../index'
import cleanupAsync from '../cleanup-async'

afterEach(() => {
  return cleanupAsync()
})

const log = []
let ctr = 0

function App() {
  async function somethingAsync() {
    await null
    log.push(ctr++)
  }
  React.useEffect(() => {
    somethingAsync()
  }, [])
  return 123
}

test('does not leave any hanging microtasks: part 1', () => {
  render(<App />)
  expect(document.body.textContent).toBe('123')
  expect(log).toEqual([])
})

test('does not leave any hanging microtasks: part 2', () => {
  expect(log).toEqual([0])
  expect(document.body.innerHTML).toBe('')
})
