import { useEffect, useRef } from 'react'

/**
 * @param name
 * @param props
 * @example
 *
 *  const Counter = React.memo(props => {
 *    useWhyDidYouUpdate('Counter', props)
 *    return <div style={props.style}>{props.count}</div>
 *  });
 */
export default function useWhyDidYouUpdate<T extends Record<string, unknown>>(
  name: string,
  props: T
): void {
  const previousProps = useRef<T | null>(null)

  useEffect(() => {
    const prevProps = previousProps.current

    if (prevProps !== null) {
      const allKeys: (keyof T)[] = Object.keys({ ...prevProps, ...props })
      const changesObj: Partial<Record<keyof T, { from: unknown; to: unknown }>> = {}

      allKeys.forEach((key) => {
        if (prevProps[key] !== props[key]) {
          changesObj[key] = {
            from: prevProps[key],
            to: props[key],
          }
        }
      })

      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj)
      }
    }
    previousProps.current = props
  })
}
