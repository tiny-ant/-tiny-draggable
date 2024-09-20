import { useRef } from 'react';

/**
 * makes a persist wrapper to call fn which may changes with its dependencies.
 * @param fn
 * @returns
 */
function usePersistFn(fn) {
  const fnRef = useRef(fn);
  const persistFn = useRef();
  fnRef.current = fn; // fnRef is unchanged, but fnRef.current changes every time fn changes.

  if (!persistFn.current) {
    // keep a stable wrapper that can access the newest fn instance between React component renders.
    persistFn.current = function f(...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return persistFn.current;
}

export default usePersistFn;