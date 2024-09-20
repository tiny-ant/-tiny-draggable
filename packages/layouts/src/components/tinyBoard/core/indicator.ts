import { useRef, useEffect } from 'react'
import Dashboard from './core'
import { getLayoutRectInBoard, guid, clamp } from '../util'
import type {
  BoardInstance,
  BoardProps,
  Layout,
  LayoutId,
  LayoutRect,
  Plugin,
  PluginHooks,
} from './types'

type Props = {
  dashboard: Dashboard
}

export default function useIndicators<T>(props: Props) {
  const { dashboard } = props

  const tmpData = useRef<Layout<T> | null>(null)
  const tmpRect = useRef<LayoutRect | null>(null)
  const indicatorRects = useRef<LayoutRect[]>([])

  /**
   * 刷新指示块（用以最终确定目标块的尺寸和位置）
   */
  const updateIndicator: PluginHooks<T>['updateIndicator'] = (rect) => {
    // TODO: 抽离 limitRange Layout算法其它地方也一样 useBoundsLimit
    // 临时拖拽限制、松开拖拽限制
    if (rect.left !== undefined && rect.width !== undefined) {
      rect.left = clamp(rect.left, 0, bounds.current.width - rect.width)
    }

    const gridRect = hooks.current.rectSetter(rect)
    const style = hooks.current.styleSetter(gridRect)

    indicator.current.update(style)

    indicatorRect.current = Object.assign({}, indicatorRect.current, gridRect)
    return indicatorRect.current

    // TODO: 拖动过程计算位置时，如果拖动到边界位置，控制滚动，并且滚动变化量与拖动元素位置变化量同步！
    // throttleScroll(top);
  }

  useEffect(() => {
    function reset() {
      tmpData.current = null
      tmpRect.current = null
      indicatorRects.current = []
    }
    dashboard.on('layoutEnded', reset)

    return () => {
      dashboard.off('layoutEnded', reset)
    }
  }, [dashboard])
}

/**
export default function useIndicator<T>(instanceRef: InstanceRef<T>, hooks: PluginHooks<T>) {
  const { indicatorRect, styleSetter } = hooks

  // instanceRef.current.renderIndicators = () => {
  //   instanceRef.getSelections().map((layout) => {
  //     return (
  //       <Mask />
  //     )
  //   })
  // }
  instanceRef.current.renderIndicator = () => <Mask ref={indicator} />
*/
