import { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import Corner from './Corner'
import THead from './THead'
import XHead from './XHead'
import TBody from './TBody'
import '~/components/scroller'
import ColumnResizer from './ColumnResizer'
import { getColumnLines, getRowLines } from '../utils'
import type { StyledCell, TableViewProps } from '../types'
import type { HTMLScrollContainerElement, ScrollEvent } from '~/components/scroller'

function noop() {}

export default function Table(props: TableViewProps) {
  const {
    theme = 'light',
    data,
    fitWidth = false,
    resizable = false,
    onResize = noop,
    columnProps,
    rowProps,
  } = props

  const [leftScrolled, setLeftScrolled] = useState(false)
  const [columnLines, totalWidth] = useMemo(() => getColumnLines(columnProps), [columnProps])
  const [rowLines, totalHeight] = useMemo(() => getRowLines(rowProps), [rowProps])

  const fixedArea = useMemo(() => {
    function getScrollerOffset() {
      const fixedLeftColsCount = columnProps.findIndex((v) => v.fixed !== true)
      const fixedTopRowsCount = rowProps.findIndex((v) => v.fixed !== true)

      // console.log(columnLines, fixedLeftColsCount, fixedTopRowsCount)

      return {
        x: fixedLeftColsCount,
        y: fixedTopRowsCount,
      }
    }

    return getScrollerOffset()
  }, [columnProps, rowProps])

  const bodyOffset = {
    left: columnLines[fixedArea.x],
    top: rowLines[fixedArea.y],
  }

  const cornerCells: StyledCell[] = []
  const xHeaderCells: StyledCell[] = []
  const yHeaderCells: StyledCell[] = []
  const bodyCells: StyledCell[] = []

  data.forEach((cell) => {
    let left = columnLines[cell.x]
    let top = rowLines[cell.y]
    const width = columnLines[cell.x + (cell.xspan || 1)] - left
    const height = rowLines[cell.y + (cell.yspan || 1)] - top
    const isXFixed = cell.x < fixedArea.x
    const isYFixed = cell.y < fixedArea.y

    // if (!isXFixed) {
    //   left -= bodyOffset.left
    // }
    // if (!isYFixed) {
    //   top -= bodyOffset.top
    // }

    const item: StyledCell = {
      ...cell,
      left,
      top,
      width,
      height,
      isXHeader: columnProps[cell.x].isHeader,
      isYHeader: rowProps[cell.y].isHeader,
    }

    if (isXFixed) {
      if (isYFixed) {
        cornerCells.push(item)
      } else {
        xHeaderCells.push(item)
      }
    } else if (isYFixed) {
      yHeaderCells.push(item)
    } else {
      bodyCells.push(item)
    }
  })

  const containerRef = useRef<HTMLScrollContainerElement | null>(null)
  const rowHeadRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const updateScroll = (ev: CustomEvent<ScrollEvent>) => {
      const left = container.scrollLeft
      const top = container.scrollTop

      if (headRef.current !== null) {
        headRef.current.scrollLeft = left
      }
      if (rowHeadRef.current !== null) {
        rowHeadRef.current.scrollTop = top
      }

      if (bodyRef.current !== null) {
        bodyRef.current.scrollLeft = left
        bodyRef.current.scrollTop = top
      }

      if (leftScrolled) {
        if (left === 0) {
          setLeftScrolled(false)
        }
      } else if (left > 25) {
        setLeftScrolled(true)
      }
    }
    container.addEventListener('scroll', updateScroll)

    return () => {
      container.removeEventListener('scroll', updateScroll)
    }
  }, [leftScrolled])

  const tBodyWidth = totalWidth - bodyOffset.left
  const tBodyHeight = totalHeight - bodyOffset.top

  const renderCell = (cell: StyledCell) => {
    if (cell.isXHeader || cell.isYHeader) {
      return cell.value
    }
    return <meter min={0} max={100} value={String(cell.value)}></meter>
    // return (
    //   <div
    //     style={{
    //       margin: 'auto',
    //       position: 'absolute',
    //       top: 0,
    //       left: 0,
    //       bottom: 0,
    //       right: 10,
    //       height: 20,
    //       border: '1px dashed #A8A8A8',
    //       borderLeft: 'none',
    //     }}
    //     data-value={cell.value}
    //   >
    //     <div
    //       style={{ height: '100%', width: `${Number(cell.value) / 10}%`, background: 'red' }}
    //     ></div>
    //   </div>
    // )
  }

  if (containerRef.current) {
    containerRef.current.update()
  }

  return (
    <div className={classNames(`x-table theme-${theme}`, { inline: !fitWidth, resizable })}>
      <scroll-container
        auto-hide
        track-gap={1}
        offset-x={bodyOffset.left + 1}
        offset-y={bodyOffset.top + 1}
        ref={containerRef}
        style={fitWidth ? { width: '100%' } : { width: totalWidth, maxWidth: '100%' }}
      >
        <div
          className="scroll-maker"
          style={{
            width: totalWidth,
            height: totalHeight,
          }}
        ></div>
        <div className="x-table__fixed">
          {bodyOffset.top > 0 && (
            <div className="x-table__head" style={{ height: bodyOffset.top }}>
              <div
                className="x-table__corner"
                style={{ height: bodyOffset.top, width: bodyOffset.left }}
              >
                <Corner cells={cornerCells} columnProps={columnProps} />
              </div>
              <div className="head-scroll" style={{ left: bodyOffset.left }} ref={headRef}>
                <div
                  style={{
                    position: 'relative',
                    left: -bodyOffset.left,
                    width: tBodyWidth,
                    height: '100%',
                  }}
                >
                  <THead cells={yHeaderCells} columnProps={columnProps} />
                </div>
              </div>
            </div>
          )}
          {bodyOffset.left > 0 && (
            <div
              className="x-table__left"
              style={{ top: bodyOffset.top, width: bodyOffset.left }}
              ref={rowHeadRef}
            >
              <div
                style={{
                  position: 'relative',
                  top: -bodyOffset.top,
                  height: tBodyHeight,
                }}
              >
                <XHead cells={xHeaderCells} columnProps={columnProps} />
              </div>
            </div>
          )}
          <div className="x-table__body" ref={bodyRef} style={bodyOffset}>
            <div
              style={{
                position: 'relative',
                top: -bodyOffset.top,
                left: -bodyOffset.left,
                width: tBodyWidth,
                height: tBodyHeight,
              }}
            >
              <TBody cells={bodyCells} columnProps={columnProps} renderCell={renderCell} />
            </div>
          </div>
          {leftScrolled && (
            <div className="scroll-shadow scrolled" style={{ width: bodyOffset.left }} />
          )}
          {resizable && <ColumnResizer columnLines={columnLines} onResize={onResize} />}
        </div>
      </scroll-container>
    </div>
  )
}
