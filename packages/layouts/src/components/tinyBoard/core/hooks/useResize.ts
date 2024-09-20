import DragMove from '@tiny/dragmove'
import { clamp } from '../util'
import type { BoardInstance, Direction, LayoutRect, Point, SizeLimit, LayoutId } from '../types'

type ResizeOptions = {
  /**
   * 当仪表板内部的某个块开始被resize时触发
   * @param event 鼠标事件对象(mousedown)
   * @return 可选择性地返回一个布尔值，如果返回false，将阻止resize
   */
  onResizeStart?(event: MouseEvent): boolean | void
  /**
   * resize事件回调，该方法提供一个入口，可以在这里改变默认的resize行为（例如禁止调整高度或者等比缩放）
   * @param event 鼠标事件对象(mousemove)
   * @param distance 一个位移向量，标示从鼠标按下时的位置到当前鼠标位置的变化量
   */
  onResize?(event: MouseEvent, distance: Point): void
  /**
   * resize结束事件回调
   * @param event 鼠标事件对象(mousemove)
   * @param distance 一个位移向量，标示从拖拽开始位置到当前位置的变化量
   */
  onResizeEnd?(event: MouseEvent, distance: Point): void
  /**
   * 提供一个方法，可供外部定义当前块的resize范围限制
   * @param id 当前块的唯一标识
   */
  setSizeLimitById?(id: LayoutId): SizeLimit
}

function noop() {}

const noLimit = () => []

// 防止手误将尺寸调整到看不见，限制最小为16x16
const defaultLimit = (id?: string) => [16, 16]

export function getSelectedBBox(rects: LayoutRect[]) {
  if (rects.length === 1) {
    return rects[0]
  }
  const top = Math.min(...rects.map((v) => v.top))
  const left = Math.min(...rects.map((v) => v.left))
  const width = Math.max(...rects.map((v) => v.left + v.width)) - left
  const height = Math.max(...rects.map((v) => v.top + v.height)) - top

  return { top, left, width, height }
}

export default function useResize<T>(config: ResizeOptions) {
  const {
    onResizeStart = noop,
    onResize = noop,
    onResizeEnd = noop,
    setSizeLimitById = noLimit,
  } = config

  const getResizeHandler = (
    boxRect: LayoutRect,
    direction: Direction,
    bounds: Omit<LayoutRect, 'id'>
  ): ((p: Point) => void) => {
    let minX: number
    let minY: number
    let maxX: number
    let maxY: number

    const [minWidth = 0, minHeight = 0, maxWidth = bounds.width, maxHeight = bounds.height] =
      setSizeLimitById(boxRect.id)

    const sourceRect = { ...boxRect }

    switch (direction) {
      case 't':
        minY = Math.max(0, sourceRect.top + sourceRect.height - maxHeight)
        maxY = Math.max(0, sourceRect.top + sourceRect.height - minHeight)

        return (diff) => {
          const topVal = clamp(sourceRect.top + diff.y, minY, maxY)

          boxRect.height += boxRect.top - topVal
          boxRect.top = topVal
        }
      case 'b':
        minY = minHeight
        maxY = Math.min(maxHeight, bounds.height - sourceRect.top)

        return (diff) => {
          boxRect.height = clamp(sourceRect.height + diff.y, minY, maxY)
        }
      case 'r':
        minX = minWidth
        maxX = Math.min(maxWidth, bounds.width - sourceRect.left)

        return (diff) => {
          boxRect.width = clamp(sourceRect.width + diff.x, minX, maxX)
        }
      case 'l':
        minX = Math.max(0, sourceRect.left + sourceRect.width - maxWidth)
        maxX = Math.max(0, sourceRect.left + sourceRect.width - minWidth)

        return (diff) => {
          const leftVal = clamp(sourceRect.left + diff.x, minX, maxX)

          boxRect.width += boxRect.left - leftVal
          boxRect.left = leftVal
        }
      case 'br':
      case 'rb':
        minX = minWidth
        maxX = Math.min(maxWidth, bounds.width - sourceRect.left)
        minY = minHeight
        maxY = Math.min(maxHeight, bounds.height - sourceRect.top)

        return (diff) => {
          const widthVal = clamp(sourceRect.width + diff.x, minX, maxX)
          const heightVal = clamp(sourceRect.height + diff.y, minY, maxY)

          boxRect.width = widthVal
          boxRect.height = heightVal
        }
      case 'bl':
      case 'lb':
        minX = Math.max(0, sourceRect.left + sourceRect.width - maxWidth)
        maxX = Math.max(0, sourceRect.left + sourceRect.width - minWidth)
        minY = minHeight
        maxY = Math.min(maxHeight, bounds.height - sourceRect.top)

        return (diff) => {
          const leftVal = clamp(sourceRect.left + diff.x, minX, maxX)
          const heightVal = clamp(sourceRect.height + diff.y, minY, maxY)

          boxRect.width += boxRect.left - leftVal
          boxRect.height = heightVal
          boxRect.left = leftVal
        }
      case 'tr':
      case 'rt':
        minX = minWidth
        maxX = Math.min(maxWidth, bounds.width - sourceRect.left)
        minY = Math.max(0, sourceRect.top + sourceRect.height - maxHeight)
        maxY = Math.max(0, sourceRect.top + sourceRect.height - minHeight)

        return (diff) => {
          const topVal = clamp(sourceRect.top + diff.y, minY, maxY)
          const widthVal = clamp(sourceRect.width + diff.x, minX, maxX)

          boxRect.width = widthVal
          boxRect.height += boxRect.top - topVal
          boxRect.top = topVal
        }
      case 'tl':
      case 'lt':
        minY = Math.max(0, sourceRect.top + sourceRect.height - maxHeight)
        maxY = Math.max(0, sourceRect.top + sourceRect.height - minHeight)
        minX = Math.max(0, sourceRect.left + sourceRect.width - maxWidth)
        maxX = Math.max(0, sourceRect.left + sourceRect.width - minWidth)

        return (diff) => {
          const leftVal = clamp(sourceRect.left + diff.x, minX, maxX)
          const topVal = clamp(sourceRect.top + diff.y, minY, maxY)

          boxRect.width += boxRect.left - leftVal
          boxRect.height += boxRect.top - topVal
          boxRect.left = leftVal
          boxRect.top = topVal
        }
      default:
        return () => undefined
    }
  }

  return (instance: BoardInstance<T>) => {
    const bounds = instance.getBounds()

    instance.getResizeProps = () => {
      return {
        // TODO: 可否在同一个元素上同时绑定拖拽和resize，通过鼠标相对当前块的区域位置判定交互处理方式，这将共同占用mouseDown事件
        onMouseDown(event: React.MouseEvent<HTMLElement, MouseEvent>): void {
          if (event.button !== 0) return // 0是左键
          event.stopPropagation() // prevent dragging or any other actions

          if (onResizeStart(event.nativeEvent) === false) {
            return
          }

          const { clientX: x, clientY: y } = event
          let itemRect: LayoutRect
          let resizeHandler: ReturnType<typeof getResizeHandler>
          // if no data-direction attribute is provided, use bottom-right resize by default
          const direction = (
            (event.target as HTMLElement).dataset.direction || 'br'
          ).toLowerCase() as Direction
          // resizeSetter = instance.getResizeSetter(direction)

          DragMove(null, {
            once: true,
            onMove: ({ event, initial, vector }) => {
              if (initial) {
                itemRect = instance.activate()
                // const resizerRect = recorder?.getSelectedBBox()
                resizeHandler = getResizeHandler(itemRect, direction, bounds)
              }
              onResize(event, vector)
              resizeHandler(vector)
              instance.reLayout(itemRect)
            },
            onEnd: ({ event, data, initial, vector }) => {
              onResizeEnd(event, vector)

              if (initial) {
                return // no drag happened
              }

              resizeHandler(vector)
              instance.commit(itemRect)
            },
          }).start({ x, y })
        },
      }
    }
  }
}
