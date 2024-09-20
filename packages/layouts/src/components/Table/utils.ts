import { CellData, ColumnProp, RowProp } from './types'

type BaseType = string | number | null | undefined

/**
 * 空值处理
 * @param data
 * @returns
 */
export function encodeNull(data: BaseType) {
  const isNull = data === '\r-\r' || data === null

  return isNull ? '-' : data
}

// 汉字/小写英文/大写英文按不同宽度计算,并且依字体大小计算
const getOptimumWidth = (str: string, fontSize = 14): number => {
  return Array.from(str || '').reduce<number>((acc: number, ch: string) => {
    const chartCode = ch.charCodeAt(0)

    if (chartCode > 255) {
      // 汉字
      acc += fontSize + 1
    } else if (chartCode >= 64 && chartCode <= 90) {
      // @, 大写字母
      acc += fontSize
    } else {
      acc += fontSize - 5
    }
    return acc
  }, 0)
}

const getColumnWidth = (
  column,
  dataSource,
  totalValue = '',
  font = { fontSize: '14px' },
  fieldCaliber
) => {
  const fontSize = parseInt(font.fontSize) || 14
  let bestWidth

  const columnNameWidth = getOptimumWidth(column.rename.trim(), fontSize) + 16 // 排序图标宽度
  const totalValueWidth = getOptimumWidth(totalValue.trim(), 14)

  // 保证数值类显示完整
  if (column.type === 'NUMBER') {
    bestWidth = Math.max(
      columnNameWidth,
      totalValueWidth,
      ...dataSource.map((item) => String(item[column.uid]).length * 9) // TODO: 可能有数值格式
    )
  } else {
    let totalWidth = 0
    let rowCount = 0
    const valueWidthArr = dataSource.map((item) => getOptimumWidth(item[column.uid], 14))

    valueWidthArr.forEach((value) => {
      if (value > 0) {
        totalWidth += value
        rowCount++
      }
    })
    bestWidth = Math.ceil(totalWidth / rowCount) || 0

    const [minWidth, maxWidth] = [Math.min(...valueWidthArr), Math.max(...valueWidthArr)]
    // 优化短内容显示, 如果各行内容长短接近,保持最长内容也能显示全
    if (maxWidth > 0 && maxWidth <= 90 && maxWidth - minWidth <= 40) {
      bestWidth = maxWidth
    }
    // 取列名长度、总计显示长度、内容平均长度中较大的那个
    bestWidth = Math.max(columnNameWidth, totalValueWidth, bestWidth)

    // console.log(column.rename, column.type, columnNameWidth, bestWidth, totalValue);
  }

  const paddingWidth = 16
  let fieldCaliberWidth = 0
  if (fieldCaliber && fieldCaliber?.id === column?.uid) {
    fieldCaliberWidth += 22
  }
  // TODO: 还要判断字体大小
  return Math.min(bestWidth + paddingWidth + fieldCaliberWidth, 208)
}

const sharedCanvas = document.createElement('canvas')
const sharedCtx = sharedCanvas.getContext('2d')

// 使用canvas测量文本渲染宽度
const measureTextWidth =
  sharedCtx === null
    ? () => 0
    : (text: string, cssFont = 'normal 14px "Microsoft YaHei"') => {
        sharedCtx.font = cssFont
        return sharedCtx.measureText(text).width
      }

/** 根据文字内容计算某列的最佳宽度 */
export function calcColumnWidth(
  data: CellData[],
  columnIndex: number,
  styles: React.CSSProperties
) {
  return 120
}

/**
 * 计算各列对齐线位置和表格总宽度
 * @param columnProps
 * @returns
 */
export function getColumnLines(columnProps: ColumnProp[]): [number[], number] {
  const positions: number[] = []

  const totalWidth = columnProps.reduce((acc, next, index) => {
    positions[index] = acc
    return acc + next.width
  }, 0)
  positions.push(totalWidth)

  return [positions, totalWidth]
}

/**
 * 计算各行对齐线位置和表格总高度
 * @param columnProps
 * @returns
 */
export function getRowLines(rowProps: RowProp[]): [number[], number] {
  const positions: number[] = []

  const totalHeight = rowProps.reduce((acc, next, index) => {
    positions[index] = acc
    return acc + next.height
  }, 0)
  positions.push(totalHeight)

  return [positions, totalHeight]
}
