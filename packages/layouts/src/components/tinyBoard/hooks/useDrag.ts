import DragMove from '@tiny/dragmove'
import { clamp, moveRect } from '../util'
import { BoardInstance, Layout, LayoutRect, InstanceRef, Point } from '../types'

type DragOptions<T> = {
  /** 是否限制拖拽不能超出仪表板容器边界 */
  noOverflow?: boolean
  /**
   * 当仪表板内部的某个块开始被拖动时触发
   * @param event 鼠标事件对象(mousedown)
   * @param item 被拖动块对应的数据
   * @return 可选择性地返回一个布尔值，如果返回false，将阻止拖动
   */
  onDragStart?(event: MouseEvent, item: Layout<T>): boolean | void
  /**
   * 拖拽事件回调，该方法提供一个入口，可以在这里改变默认的拖拽行为（例如限制单向拖拽）
   * @param event 鼠标事件对象(mousemove)
   * @param item 被拖动块对应的数据
   * @param distance 一个位移向量，标示从鼠标按下时的位置到当前鼠标位置的变化量
   */
  onDrag?(event: MouseEvent, item: Layout<T>, distance: Point): void
  /**
   * 拖拽结束事件回调
   * @param event 鼠标事件对象(mousemove)
   * @param item 被拖动块对应的数据
   * @param distance 一个位移向量，标示从鼠标按下时的位置到当前鼠标位置的变化量
   */
  onDragEnd?(event: MouseEvent, item: Layout<T>, distance: Point): void
}

function noop() {}

const getDragLimitHandler = <T>(
  boxRect: LayoutRect,
  instance: BoardInstance<T>
): ((p: Point) => LayoutRect) => {
  const bounds = instance.getBounds()
  const { top, left, width } = boxRect
  const minX = -left
  const minY = -top
  const maxX = bounds.width - left - width
  const maxY = Infinity

  return (distance: Point) => {
    const x = clamp(distance.x, minX, maxX)
    const y = clamp(distance.y, minY, maxY)
    return moveRect(boxRect, { x, y })
  }
}

/**
 * 仪表板内容块支持拖拽功能
 * @param instanceRef
 * @example
 * boardInst.fn(useDrag({
 *  onDragStart(){ ... },
 * }))
 */
export default function useDrag<T>(config: DragOptions<T>) {
  const { onDragStart = noop, onDrag = noop, onDragEnd = noop, noOverflow = false } = config
  return (instanceRef: InstanceRef<T>) => {
    instanceRef.current.getDragProps = (item: Layout<T>): Record<string, unknown> => ({
      // TODO: 如果另一个插件也要占用mouseDown事件，该如何共存？
      onMouseDown(event: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (onDragStart(event.nativeEvent, item) === false) {
          return
        }
        const { clientX: x, clientY: y } = event
        const { id } = item
        let itemRect: LayoutRect
        let dragLimit: ReturnType<typeof getDragLimitHandler>

        DragMove(null, {
          once: true,
          data: { id },
          onMove: ({ event, vector, initial }) => {
            if (initial) {
              itemRect = instanceRef.current.activateLayout(item.id)

              if (noOverflow) {
                dragLimit = getDragLimitHandler(itemRect, instanceRef.current)
              } else {
                dragLimit = (vector: Point) => moveRect(itemRect, vector)
              }
            }

            // TODO: 测试更改vector实现自定义拖拽限制，例如单向拖拽（起始拖拽距离超过阈值就固定方向）
            onDrag(event, item, vector)

            const targetRect: LayoutRect = dragLimit(vector)
            instanceRef.current.reLayout(targetRect)
          },
          onEnd: ({ event, initial, vector }) => {
            onDragEnd(event, item, vector)

            if (initial) {
              return // no drag happened
            }

            const targetRect: LayoutRect = dragLimit(vector)
            instanceRef.current.commitLayout(targetRect)
          },
        }).start({ x, y })
      },
    })
  }
}
