import { useCallback } from 'react'
import { InstanceRef, LayoutRect, PluginHooks } from '../types'

// TODO: 重构、扩展
// 设置控制样式的属性，不涉及布局计算
// 像gridLayout存储为{ w: 4, h: 3 }这种如何处理？

export const getGridX = (value: number, width: number, cellCount = 192): number => {
  const unit = width / cellCount

  return Math.round(value / unit) * unit
}

export const getGridY = (value: number, width: number, cellCount = 192): number => {
  const unit = width / cellCount

  return Math.round(value / unit) * unit
}

export default function useGridAlign<T>(instanceRef: InstanceRef<T>, hooks: PluginHooks<T>) {
  hooks.rectSetter = useCallback((rect: LayoutRect): typeof rect => {
    const { width } = instanceRef.current.getBounds()
    const gridRect = { ...rect }

    gridRect.top = getGridY(rect.top, width)
    gridRect.left = getGridX(rect.left, width)
    gridRect.width = getGridX(rect.width, width)
    gridRect.height = getGridY(rect.height, width)

    // console.log(rect, ' => ', gridRect, bounds)
    return gridRect
  }, [instanceRef])
}
