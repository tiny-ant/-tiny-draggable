import React, { useRef, useState } from 'react'
import {
  useBoard,
  useCompactLayout,
  useDrag,
  useGridAlign,
  useResize,
  useAutoExpand,
} from '~/components/tinyBoard'
import { Layout, LayoutId } from '~/components/tinyBoard/types'
import Mask from '~/components/tinyBoard/Mask'

import './components/SimpleBlock/index.less'
import './basic.less'

type Data = {
  i: number
  x: number
  y: number
  w: number
  h: number
}

const ROWH = 30
const COLS = 12

const globalData = [
  [0, 0, 2, 4],
  [2, 0, 2, 5],
  [4, 0, 2, 5],
  [6, 0, 2, 4],
  [8, 0, 2, 4],
  [10, 0, 2, 5],
  [0, 4, 2, 4],
  [2, 5, 2, 5],
  [4, 12, 2, 5],
  [6, 4, 2, 2],
  [4, 5, 2, 5],
  [10, 5, 2, 2],
  [0, 8, 2, 2],
  [2, 10, 2, 3],
  [4, 10, 2, 2],
  [6, 6, 2, 2],
  [8, 4, 2, 5],
  [10, 7, 2, 2],
  [0, 10, 2, 5],
].map((row, i) => {
  const [x, y, w, h] = row
  return {
    id: String(i),
    data: { i, x, y, w, h },
    style: {
      top: y * ROWH + 'px',
      height: h * ROWH + 'px',
      left: (x / COLS) * 1200 + 'px',
      width: (w / COLS) * 1200 + 'px',
    },
  }
})

export function Component() {
  const [data, setData] = useState<Layout<Data>[]>(globalData)

  const containerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<React.FC>(null)

  const [draggingChart, setDraggingChart] = useState<LayoutId>(null)

  const instance = useBoard(
    {
      container: containerRef.current,
      data,
      unitX: 1200 / 12,
      unitY: 30,
      indicator: maskRef,
      // throttleTiming: 64,
      onDragStart(ev) {
        if (ev.button !== 0) {
          return false
        }
        const target = ev.target as HTMLElement

        const container = target.closest('.tiny-rect')

        if (!container) {
          return false
        }

        return true
      },
      onLayoutActivated(id: string) {
        setDraggingChart(id)
      },
      onLayoutUpdated(data: Layout<Data>[]) {
        console.log('updated: ', data)
        setDraggingChart(null)
        setData(data)
      },
    },
    useGridAlign,
    useCompactLayout,
    useDrag,
    useResize,
    useAutoExpand
  )

  return (
    <div
      className="tiny-board basic-example"
      ref={containerRef}
      {...instance.getBoardProps()}
      style={{ width: '1200px' }}
    >
      <div className="abs-fill">
        {instance.layoutData.map((item) => {
          const dragging = draggingChart === item.id

          return (
            <div
              key={item.id}
              className={`tiny-rect${dragging ? ' dragging' : ''}`}
              {...instance.getDragProps(item)}
              {...instance.getItemProps(item)}
            >
              <div className="simple-grid-item">
                <span className="text">{item.data.i}</span>
                <span className="resizable-handle" {...instance.getResizeProps(item)}></span>
              </div>
            </div>
          )
        })}
        <Mask ref={maskRef} />
      </div>
    </div>
  )
}

Component.displayName = 'BasicDemo'

// export async function loader() {
//   await new Promise((r) => setTimeout(r, 500))
//   return 'I came from the basic.tsx loader function!'
// }
