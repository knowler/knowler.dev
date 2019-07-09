import { useEffect, useRef } from 'react'

/**
 * Stolen from Dan Abramov:
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
