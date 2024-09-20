export type BaseTypes = string | number | null

/** 单元格数据 */
export interface CellData {
  /** 单元格x坐标 */
  x: number
  /** 单元格y坐标 */
  y: number
  /** 横向跨度，默认为1 */
  xspan?: number
  /** 纵向跨度，默认为1 */
  yspan?: number
  valueType: 'TEXT' | 'DATE' | 'NUMBER'
  /** 单元格值 */
  value?: BaseTypes
}

export interface StyledCell extends CellData {
  /** 是否行表头 */
  isXHeader?: boolean
  /** 是否列表头 */
  isYHeader?: boolean
  /** 单元格相对父容器位置 */
  left: number
  /** 单元格相对父容器位置 */
  top: number
  /** 单元格宽度 */
  width: number
  /** 单元格高度 */
  height: number
}

/** 列属性定义（这里的列对应无合并单元格情况下的一列 */
export type ColumnProp = {
  /** 列宽度，必须指定 */
  width: number
  /** 最小列宽，默认为0 */
  minWidth?: number
  /** 是否行表头（将影响渲染结果样式） */
  isHeader?: boolean
  /** 是否固定列（不跟随滚动，用于行表头、行末操作列固定） */
  fixed?: boolean
  /** 是否允许调整宽度 */
  resizable?: boolean
  /** 是否隐藏列（高级功能） */
  hidden?: boolean
}

/** 行属性定义 */
export type RowProp = {
  /** 行高度，必须指定 */
  height: number
  /** 是否列表头（将影响渲染结果样式） */
  isHeader?: boolean
  /** 是否固定行（用于列头） */
  fixed?: boolean
}

/** 表格组件属性 */

export interface TableProps {
  theme?:
    | 'light'
    | 'dark'
    | 'gray'
    | 'green'
    | 'blue'
    | 'light-blue'
    | 'AI-green'
    | 'AI-red'
    | 'AI-pink'
    | 'AI-orange'
  /** 表格单元格数据（包含所有行和列的单元格数据） */
  data: CellData[]
  /** 列属性定义 */
  columnProps: ColumnProp[]
  /** 行属性定义 */
  rowProps: RowProp[]
  /** 是否宽度自适应（保证表格占满父元素宽度） */
  fitWidth?: boolean
  /** 是否允许调整列宽 */
  resizable?: boolean
}

export interface TableViewProps extends TableProps {
  onResize?(colIndex: number, deltaX: number): void
}

export type RenderCellProps = {
  columnProps: ColumnProp[]
  columnCount: number
}
