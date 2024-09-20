import { useRef } from 'react'

type noop = (...args: any[]) => any

/**
 * makes a persist reference to fn which may changes because of its dependencies.
 * @param fn
 * @returns
 */
export default function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn)
  const persistFn = useRef<T>()

  fnRef.current = fn // fnRef is unchanged, but fnRef.current changes every time fn changes.

  if (!persistFn.current) {
    // keep a stable wrapper that can access the newest fn instance between component renders.
    persistFn.current = function f(this: any, ...args) {
      return fnRef.current.apply(this, args)
    } as T
  }
  return persistFn.current
}
