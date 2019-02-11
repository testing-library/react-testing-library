import {useState, useEffect} from 'react'

export function useCounter({initialCount = 0, step = 1} = {}) {
  const [count, setCount] = useState(initialCount)
  const increment = () => setCount(c => c + step)
  const decrement = () => setCount(c => c - step)
  return {count, increment, decrement}
}

export function useDocumentTitle(title) {
  const [originalTitle, setOriginalTitle] = useState(document.title)
  useEffect(() => {
    setOriginalTitle(document.title)
    document.title = title
    return () => {
      document.title = originalTitle
    }
  }, [title])
}

export function useCall(callback, deps) {
  useEffect(() => {
    callback()
  }, deps)
}
