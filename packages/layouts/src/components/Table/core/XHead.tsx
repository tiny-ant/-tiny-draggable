import classNames from 'classnames'
import type { ColumnProp, RenderCellProps, StyledCell } from '../types'

type Props = {
  cells: StyledCell[]
  columnProps: ColumnProp[]
  renderCell?(cell: StyledCell, props: RenderCellProps): React.ReactNode
}

function defaultCellRender(cell: StyledCell) {
  return cell.value ?? '-'
}

/**
 * 渲染列方向上表格固定滚动的部分
 * @param props
 * @returns
 */
export default function XHead(props: Props) {
  const { cells, columnProps, renderCell = defaultCellRender } = props

  const columnCount = columnProps.length

  return (
    <>
      {cells.map((cell) => {
        const { x, y, xspan = 1, isXHeader, top, left, width, height } = cell
        const className = classNames('t-cell', {
          'x-header': isXHeader,
          'row-start': x === 0,
          'row-end': x + xspan === columnCount,
        })
        return (
          <div
            key={`${x},${y}`}
            data-x={x}
            data-y={y}
            className={className}
            style={{ position: 'absolute', top, left, width, height }}
          >
            {renderCell(cell, { columnProps, columnCount })}
          </div>
        )
      })}
    </>
  )
}
