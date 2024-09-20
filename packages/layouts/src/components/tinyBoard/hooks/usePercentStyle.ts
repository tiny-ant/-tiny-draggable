import React, { useCallback } from 'react'
import usePersistFn from './usePersistFn'
import { InstanceRef, LayoutRect, PluginHooks } from '../types'

export default function usePercentStyle<T>(instanceRef: InstanceRef<T>, hooks: PluginHooks<T>) {

  // const formatValue = usePersistFn((value: number) => `${(value * percentPerPixel).toFixed(6)}%`)
  const formatValue = usePersistFn((value: number) => `${((value * 100) / instanceRef.current.getBounds().width).toFixed(6)}%`)

  hooks.styleSetter = useCallback((rect: LayoutRect): React.CSSProperties => ({
      marginTop: formatValue(rect.top),
      marginLeft: formatValue(rect.left),
      paddingTop: formatValue(rect.height),
      paddingLeft: formatValue(rect.width),
    }),
    [formatValue]
  )
}
