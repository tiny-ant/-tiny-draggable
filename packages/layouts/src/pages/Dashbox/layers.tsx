import React, { useRef, useState } from 'react'
import {
  useBoard,
  useCompactLayout,
  useDrag,
  useGridAlign,
  useResize,
} from '~/components/tinyBoard'
import { Layout, LayoutId } from '~/components/tinyBoard/types'
import Mask from '~/components/tinyBoard/Mask'
import { randrange } from './util'

import './components/SimpleBlock/index.less'
import './components/TinyBoard.less'
import './layers.less'

type Data = {
  i: number | string
  x: number
  y: number
  w: number
  h: number
}

const ROWH = 30
const COLS = 12

const globalData = (function () {
  const stackHeight: Record<string, number> = {}

  return Array.from({ length: 18 }).map((row, i) => {
    const x = (i * 2) % 12
    const w = 2
    const y = stackHeight[x] || 0
    const h = randrange(2, 8)
    stackHeight[x] = (stackHeight[x] || 0) + h

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
})()

function randBlocks(prefix = '', count = 1) {
  return Array.from({ length: count }).map((_, index) => {
    const x = randrange(0, 11)
    const y = randrange(0, 12)
    const w = randrange(1, Math.min(6, 12 - x))
    const h = randrange(2, 8)
    const i = `${prefix}${index}`

    return {
      id: i,
      data: { i, x, y, w, h },
      style: {
        top: y * ROWH + 'px',
        height: h * ROWH + 'px',
        left: (x / COLS) * 1200 + 'px',
        width: (w / COLS) * 1200 + 'px',
      },
    }
  })
}

const globalStackData = randBlocks('S', 3)
const globalBackData = randBlocks('G', 3)

const LayersDemo = () => {
  const [data, setData] = useState<Layout<Data>[]>(globalData)
  const [stackedData, setStackedData] = useState<Layout<Data>[]>(globalStackData)
  const [backData, setBackData] = useState<Layout<Data>[]>(globalBackData)

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
    useResize
  )

  const stackLayer = useBoard(
    {
      container: containerRef.current,
      data: stackedData,
      layer: 'stacked',
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
        setStackedData(data)
      },
    },
    useGridAlign,
    useDrag,
    useResize
  )

  const backLayer = useBoard(
    {
      container: containerRef.current,
      data: backData,
      layer: 'back',
      unitX: 1200 / COLS,
      unitY: ROWH,
      indicator: maskRef,
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
        setDraggingChart(null)
        setBackData(data)
      },
    },
    useDrag,
    useResize
  )

  return (
    <div
      className="tiny-board layers-example"
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
        {stackLayer.layoutData.map((item) => {
          const dragging = draggingChart === item.id

          return (
            <div
              key={item.id}
              className={`tiny-rect${dragging ? ' dragging' : ''}`}
              {...stackLayer.getDragProps(item)}
              {...stackLayer.getItemProps(item)}
            >
              <div className="simple-grid-item stacked">
                <span className="text">{item.data.i}</span>
                <span className="resizable-handle" {...stackLayer.getResizeProps(item)}></span>
              </div>
            </div>
          )
        })}
        {backLayer.layoutData.map((item) => {
          const dragging = draggingChart === item.id

          return (
            <div
              key={item.id}
              className={`tiny-rect${dragging ? ' dragging' : ''}`}
              {...backLayer.getDragProps(item)}
              {...backLayer.getItemProps(item)}
            >
              <div className="simple-grid-item back">
                <span className="text">{item.data.i}</span>
                <span className="resizable-handle" {...backLayer.getResizeProps(item)}></span>
              </div>
            </div>
          )
        })}
        <Mask ref={maskRef} />
      </div>
    </div>
  )
}

LayersDemo.displayName = 'LayersDemo'

export const Component = LayersDemo
