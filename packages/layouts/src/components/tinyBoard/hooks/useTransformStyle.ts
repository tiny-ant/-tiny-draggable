import React from 'react'
import { InstanceRef, LayoutRect, PluginHooks } from '../types'

/**
 * 使用3D变换优化CSS动画
 * @param _
 * @param hooks
 */
export default function usePercentStyle<T>(_: InstanceRef<T>, hooks: PluginHooks<T>) {
  hooks.styleSetter = (rect: LayoutRect): React.CSSProperties => {
    const { top, left, width, height } = rect

    return {
      transition: 'all 0.2s ease-out 0s',
      transform: `translate3d(${left || 0}px, ${top || 0}px, 0)`,
      width: `${width}px`,
      height: `${height}px`
    }
  }
}
