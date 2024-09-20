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

import '../components/SimpleBlock/index.less'
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

const BasicDemo = () => {
  const [data, setData] = useState<Layout<Data>[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<React.FC>(null)

  const [draggingChart, setDraggingChart] = useState<LayoutId>(null)

  const instance = useBoard(
    {
      container: containerRef.current,
      data,
      unitX: 1200 / COLS,
      unitY: ROWH,
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

  const addRandom = () => {}

  return (
    <div>
      {/* <button onClick={add}>add</button> */}
      <button onClick={addRandom}>random</button>
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
    </div>
  )
}

export default BasicDemo
