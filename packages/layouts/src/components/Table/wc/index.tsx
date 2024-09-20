import { useMemo, useRef } from 'react'
import classNames from 'classnames'
import Corner from '../core/Corner'
import THead from '../core/THead'
import XHead from '../core/XHead'
import TBody from '../core/TBody'
import ColumnResizer from '../core/ColumnResizer'
import './TableLayout'
import { getColumnLines, getRowLines } from '../utils'
import type { HTMLTableLayoutElement } from './TableLayout'
import type { StyledCell, TableViewProps } from '../types'

import '../index.less'

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

  const containerRef = useRef<HTMLTableLayoutElement | null>(null)
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

    if (!isXFixed) {
      left -= bodyOffset.left
    }
    if (!isYFixed) {
      top -= bodyOffset.top
    }

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

  const extraProps = fitWidth ? { 'fit-width': true } : {}

  if (containerRef.current) {
    containerRef.current.update()
  }

  return (
    <table-layout
      class={classNames(`x-table theme-${theme}`, { resizable })}
      width={totalWidth}
      height={totalHeight}
      auto-hide
      track-gap="1"
      scroller-offset={`${bodyOffset.left},${bodyOffset.top}`}
      {...extraProps}
      ref={containerRef}
    >
      {bodyOffset.top > 0 && (
        <div slot="head">
          <THead cells={yHeaderCells} columnProps={columnProps} />
        </div>
      )}
      {bodyOffset.left > 0 && (
        <div slot="corner">
          <Corner cells={cornerCells} columnProps={columnProps} />
        </div>
      )}
      {bodyOffset.left > 0 && (
        <div slot="left">
          <XHead cells={xHeaderCells} columnProps={columnProps} />
        </div>
      )}
      <div>
        <TBody cells={bodyCells} columnProps={columnProps} />
      </div>
      {resizable && <ColumnResizer slot="extra" columnLines={columnLines} onResize={onResize} />}
    </table-layout>
  )
}
