import { useState } from 'react'
import Table from '../Table/wc'
import type { TableProps } from '../Table/types'

export default function PivotTable(props: TableProps) {
  const { columnProps } = props

  const [colProps, setColProps] = useState(columnProps)

  function onResize(colIndex: number, width: number) {
    const col = colProps[colIndex]

    col.width = Math.max(width, col.minWidth || 18)
    setColProps([...colProps])
  }

  return <Table {...props} columnProps={colProps} onResize={onResize} />
}
