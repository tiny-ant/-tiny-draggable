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

export default function THead(props: Props) {
  const { cells, columnProps, renderCell = defaultCellRender } = props

  const columnCount = columnProps.length

  return (
    <>
      {cells.map((cell) => {
        const { x, y, xspan = 1, top, left, width, height } = cell
        const className = classNames('t-cell y-header', {
          'x-header': cell.isXHeader,
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
