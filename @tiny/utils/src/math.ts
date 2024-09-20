type KeyType = string | number | symbol

export function sum(arr: number[]): number {
  return arr.reduce((acc, cur) => acc + cur, 0)
}

export function average(arr: number[]): number {
  return sum(arr) / arr.length
}

// toFixed精度问题解决方案
export const toFixed = (num: number, orgPrecision = 2): string => {
  const precision = orgPrecision > 10 ? 10 : orgPrecision
  const value = (+`${Math.round(+`${num}e${precision}`)}e${-precision}`).toFixed(precision)

  if (value === 'NaN') {
    return Number(num).toFixed(orgPrecision)
  }
  return value
}

// 乘法
export const multiply = (arg1: number | string, arg2: number | string) => {
  let m = 0
  const s1 = String(arg1)
  const s2 = String(arg2)
  try {
    m += (s1.split('.')[1] || '').length
  } catch (e) {
    console.log(e)
  }
  try {
    m += (s2.split('.')[1] || '').length
  } catch (e) {
    console.log(e)
  }
  // eslint-disable-next-line no-restricted-properties
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m)
}
