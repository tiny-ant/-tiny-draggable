import { useLayoutEffect } from 'react'
import { InstanceRef, LayoutRect, Point } from '../types'
import DragMove from '@tiny/dragmove'

/**
 * draw a rect in board
 */

export default function useDrawRect<T>(instanceRef: InstanceRef<T>) {
  // TODO
  useLayoutEffect(() => {
    const container = instanceRef.current.getContainer()

    if (!container) {
      return
    }

    function drawHandler(event: MouseEvent) {
      const bounds = instanceRef.current.getBounds()
      const { clientX: x, clientY: y } = event

      const target = document.elementFromPoint(x, y)

      if (target?.closest('[data-layout-id]') !== null) {
        return // 鼠标在元素块上按下应该优先处理拖拽而不是画矩形框
      }

      const makeRect = (vector: Point): LayoutRect => {
        return {
          id: null,
          left: x - bounds.left,
          top: y - bounds.top,
          width: vector.x,
          height: vector.y,
        }
      }

      DragMove(null, {
        once: true,
        onMove: ({ vector, initial }) => {
          const drawRect = makeRect(vector)
          // TODO:
          // updateDrawRect(drawRect)
        },
        onEnd: ({ data, vector, initial }) => {
          if (initial) {
            return // no drag happened
          }
          const drawRect = makeRect(vector)
          // TODO:
          // emit('drawRect', )
        },
      }).start({ x, y })
    }

    container.addEventListener('mousedown', drawHandler, false)

    return () => {
      container.removeEventListener('mousedown', drawHandler, false)
    }
  })
}
