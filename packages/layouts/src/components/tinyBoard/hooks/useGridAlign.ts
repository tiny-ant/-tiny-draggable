import { useCallback } from 'react'
import { InstanceRef, LayoutRect, PluginHooks } from '../types'

// TODO: 重构、扩展
// 设置控制样式的属性，不涉及布局计算
// 像gridLayout存储为{ w: 4, h: 3 }这种如何处理？

const toGridValue = (value: number, unit = 10): number => {
  return Math.round(value / unit) * unit
}

export default function useGridAlign<T>(_: InstanceRef<T>, hooks: PluginHooks<T>) {
  const { unitX, unitY } = hooks
  hooks.rectSetter = useCallback((rect: LayoutRect): typeof rect => {
    const gridRect = { ...rect }

    gridRect.top = toGridValue(rect.top, unitY)
    gridRect.left = toGridValue(rect.left, unitX)
    gridRect.width = toGridValue(rect.width, unitX)
    gridRect.height = toGridValue(rect.height, unitY)

    return gridRect
  }, [unitX, unitY])
}
