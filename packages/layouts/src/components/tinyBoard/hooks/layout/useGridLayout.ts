import { InstanceRef, PluginHooks, LayoutRect } from '../../types'
import useLatest from '../useLatest'

type GridOptions = { columns: number; rows: number; rowHeight: number }

export default function useGridStyle<T>(params: GridOptions) {
  const config = useLatest(params)

  return (instanceRef: InstanceRef<T>, hooks: PluginHooks<T>) => {
    const { width: containerWidth } = instanceRef.current.getBounds()
    const { columns = 24, rows = 10, rowHeight = 30 } = config.current || {}

    // TODO:
    instanceRef.current.setContainerStyle({
      gridTemplateColumns: `repeat(1fr, ${columns})`,
      gridTemplateRows: `repeat(${rowHeight}px, ${rows})`,
    })

    const unitX = containerWidth / columns
    const unitY = rowHeight

    const getGridXIndex = (value: number) => Math.round(value / unitX)
    const getGridYIndex = (value: number) => Math.round(value / unitY)

    hooks.styleSetter = (rect: LayoutRect): React.CSSProperties => {
      const { top, left, width, height } = rect
      const gridColumnStart = getGridXIndex(left)
      const gridColumnEnd = gridColumnStart + getGridXIndex(width)
      const gridRowStart = getGridYIndex(top)
      const gridRowEnd = gridRowStart + getGridYIndex(height)

      // // 横跨整行, 高度改为自适应（x，在编辑时不处理，预览状态下再做预处理）
      // if (gridColumnEnd - gridColumnStart >= columns) {
      //   gridRowEnd = 'auto'
      // }

      return {
        gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
        gridRow: `${gridRowStart} / ${gridRowEnd}`,
      }
    }
  }
}
