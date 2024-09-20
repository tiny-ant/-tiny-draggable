import { CellData, ColumnProp, RowProp } from '~/components/Table/types'
import { provinces } from './provinceData'

// const cells: CellData[] = [
//   { x: 0, y: 0, value: '省份' },
//   { x: 1, y: 0, value: '城市' },
//   { x: 2, y: 0, value: '列C' },
//   { x: 3, y: 0, value: '列D' },
//   { x: 4, y: 0, value: '列E' },
//   { x: 5, y: 0, value: '列F' },
//   { x: 6, y: 0, value: '列G' },
//   { x: 7, y: 0, value: '列H' },

//   { x: 0, y: 1, value: '湖北' },
//   { x: 1, y: 1, value: '孝感' },
//   { x: 2, y: 1, value: '316' },
//   { x: 3, y: 1, value: '99' },
//   { x: 4, y: 1, value: '605' },
//   { x: 5, y: 1, value: '1270' },
//   { x: 6, y: 1, value: '955' },
//   { x: 7, y: 1, value: '37.6' },

//   { x: 0, y: 2, value: '内蒙古自治区' },
//   { x: 1, y: 2, value: '呼和浩特' },
//   { x: 2, y: 2, value: '13.16' },
//   { x: 3, y: 2, value: '99.22' },
//   { x: 4, y: 2, value: '165' },
//   { x: 5, y: 2, value: '720' },
//   { x: 6, y: 2, value: '93' },
//   { x: 7, y: 2, value: '34' },

//   { x: 0, y: 3, value: '湖北', yspan: 2 },
//   { x: 1, y: 3, value: '武汉' },
//   { x: 2, y: 3, value: '1.16' },
//   { x: 3, y: 3, value: '9.22' },
//   { x: 4, y: 3, value: '15' },
//   { x: 5, y: 3, value: '20' },
//   { x: 6, y: 3, value: '3' },
//   { x: 7, y: 3, value: '3.34' },

//   { x: 1, y: 4, value: '黄冈' },
//   { x: 2, y: 4, value: '9.96' },
//   { x: 3, y: 4, value: '9.73' },
//   { x: 4, y: 4, value: '185' },
//   { x: 5, y: 4, value: '149' },
//   { x: 6, y: 4, value: '37' },
//   { x: 7, y: 4, value: '0.16' },

//   { x: 0, y: 5, value: '陕西' },
//   { x: 1, y: 5, value: '西安' },
//   { x: 2, y: 5, value: '1.16' },
//   { x: 3, y: 5, value: '9.22' },
//   { x: 4, y: 5, value: '165' },
//   { x: 5, y: 5, value: '220' },
//   { x: 6, y: 5, value: '32' },
//   { x: 7, y: 5, value: '13.34' },

//   { x: 0, y: 6, value: '浙江' },
//   { x: 1, y: 6, value: '杭州' },
//   { x: 2, y: 6, value: '1.16' },
//   { x: 3, y: 6, value: '9.22' },
//   { x: 4, y: 6, value: '165' },
//   { x: 5, y: 6, value: '220' },
//   { x: 6, y: 6, value: '32' },
//   { x: 7, y: 6, value: '13.34' },

//   { x: 0, y: 7, value: '湖北' },
//   { x: 1, y: 7, value: '仙桃' },
//   { x: 2, y: 7, value: '13.6' },
//   { x: 3, y: 7, value: '992' },
//   { x: 4, y: 7, value: '615' },
//   { x: 5, y: 7, value: '350' },
//   { x: 6, y: 7, value: '93.4' },
//   { x: 7, y: 7, value: '39' },

//   { x: 0, y: 8, value: '云南' },
//   { x: 1, y: 8, value: '贵州' },
//   { x: 2, y: 8, value: '3.6' },
//   { x: 3, y: 8, value: '222' },
//   { x: 4, y: 8, value: '65' },
//   { x: 5, y: 8, value: '520' },
//   { x: 6, y: 8, value: '9.4' },
//   { x: 7, y: 8, value: '9.3' },

//   { x: 0, y: 9, value: '江西' },
//   { x: 1, y: 9, value: '南昌' },
//   { x: 2, y: 9, value: '4.33' },
//   { x: 3, y: 9, value: '6.4' },
//   { x: 4, y: 9, value: '15.6' },
//   { x: 5, y: 9, value: '10' },
//   { x: 6, y: 9, value: '9.4' },
//   { x: 7, y: 9, value: '19.3' },
// ]

type Province = { province: string; children: string[] }

// 范围随机数
function randNum(min: number, max: number) {
  return min + Math.random() * (max - min)
}
// 随机整数
function randInt(min: number, max: number) {
  return Math.round(randNum(min, max))
}

function randGet<T>(arr: T[]) {
  return arr[randInt(0, arr.length - 1)]
}

class RandPicker<T> {
  #lastPick: T | null = null

  #data: T[]

  #unPicked: T[] | null = null

  constructor(data: T[]) {
    this.#data = data
  }

  randPick() {
    return randGet(this.#data)
  }

  /** 随机选择一个与上次不同的数据 */
  changePick() {
    let data = [...this.#data]
    const lastValue = this.#lastPick

    if (lastValue !== null) {
      const index = data.indexOf(lastValue)

      if (index >= 0) {
        data.splice(index, 1)
      }
    }
    this.#lastPick = randGet(data)
    return this.#lastPick
  }

  /** 随机选择一个之前未选择的数据 */
  uniquePick() {
    if (this.#unPicked === null) {
      this.#unPicked = [...this.#data]
    }
    const index = randInt(0, this.#unPicked.length - 1)
    const value = this.#unPicked[index]

    this.#unPicked.splice(index, 1)
    return value
  }
}

const provincePicker = new RandPicker(provinces)

function getRandomProvince() {
  return provincePicker.changePick()
}

function randomProvinceCity(province: Province) {
  return randGet(province.children)
}

const rowCount = randInt(10, 20)
const columnCount = randInt(3, 10)

let province = getRandomProvince()
let rowSpanStart = true
let yspan = 1
let skip = randInt(1, 5)

const yspanRandomList = [1, 1, 1, 1, 1, 2, 2, 2, 3]

const CellDataArr: CellData[][] = Array.from({ length: rowCount - 2 }).map((_, y) => {
  if (yspan === 0) {
    yspan = 1
    skip -= 1
    province = getRandomProvince()

    rowSpanStart = true
  }

  if (skip === 0) {
    skip = randInt(1, 10)
    yspan = yspanRandomList[randInt(0, 8)]
    if (yspan + y + 1 >= rowCount) {
      yspan = rowCount - y - 2
    }
  }

  const city = randomProvinceCity(province)

  const rowData = Array.from({ length: columnCount }).map((_, x) => {
    const valueType: CellData['valueType'] = x < 2 ? 'TEXT' : 'NUMBER'

    return {
      x,
      y: y + 2,
      yspan: x === 0 ? yspan : 1,
      valueType,
      value:
        x < 2
          ? [province.province, city][x]
          : randNum(-100, 600).toFixed(Math.round(randNum(0, 2))),
    }
  })

  yspan -= 1

  if (rowSpanStart) {
    rowSpanStart = false
    return rowData
  }
  return rowData.slice(1)
})

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function getColIdentity(index: number) {
  if (index < 26) {
    return chars.charAt(index)
  }
  return chars.charAt(Math.floor(index / 26)) + chars.charAt(index % 26)
}

const headCells1: CellData[] = Array.from({ length: columnCount - 1 }).map((_, colIndex) => {
  return {
    x: colIndex === 0 ? colIndex : colIndex + 1,
    y: 0,
    xspan: colIndex === 0 ? 2 : undefined,
    valueType: 'TEXT',
    value: colIndex === 0 ? '分类' : `列${getColIdentity(colIndex - 1)}`,
  }
})

const headCells2: CellData[] = Array.from({ length: columnCount }).map((_, colIndex) => {
  return {
    x: colIndex,
    y: 1,
    valueType: 'TEXT',
    value: colIndex < 2 ? ['省份', '城市'][colIndex] : ['支出', '净利润', '销售额'][colIndex % 3],
  }
})

CellDataArr.unshift(headCells2)
CellDataArr.unshift(headCells1)

console.log(`行 x 列 = ${rowCount} x ${columnCount} = ${rowCount * columnCount}`)

const cells = CellDataArr.flat()

const columnProps: ColumnProp[] = Array.from({ length: columnCount - 2 }).map(() => ({
  width: [90, 100, 120, 135, 160][randInt(0, 4)],
}))

columnProps.unshift({ width: 120, isHeader: true, fixed: true })
columnProps.unshift({ width: 80, isHeader: true, fixed: true })
// columnProps[columnProps.length - 1].fixed = true

const rowProps: RowProp[] = Array.from({ length: rowCount - 2 }).map(() => ({ height: 36 }))

rowProps.unshift({ height: 36, isHeader: true, fixed: true })
rowProps.unshift({ height: 42, isHeader: true, fixed: true })

// console.log(CellDataArr)
// console.log({ rowProps, columnProps, columnCount, rowCount })

export default {
  columnProps,
  rowProps,
  cells,
}
