/** 将数组中某个（或某些）对象替换为新的 */
export function replaceByKey<T extends { [p in K]: string }, K extends string>(
  list: T[],
  replacement: T | T[],
  key: K
) {
  if (Array.isArray(replacement)) {
    const map = new Map<string, T>(replacement.map((item) => [item[key], item]))
    return list.map((item) => map.get(item[key]) || item)
  }
  return list.map((item) => (item[key] === replacement[key] ? replacement : item))
}

/** 将数组中某个元素移到数组另一位置(该元素移动前后索引范围内的元素索引位置都会相对偏移一个单位) */
export function reorder<T extends unknown[]>(list: T, fromIndex: number, toIndex: number): T {
  const [removed] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, removed)

  return list
}

/** 交换数组中两个元素的位置（其它元素的索引位置不变）*/
export function exchange<T extends unknown[]>(list: T, startIndex: number, endIndex: number): T {
  ;[list[startIndex], list[endIndex]] = [list[endIndex], list[startIndex]]
  return list
}

/**
 * 字符串顺序排列组合（常用于密码组合破解）
 * 算法描述：给定一个`string[m][n]`的二维数组，依顺序从m个子组中各取一个元素拼接成最终的字符串，列出所有的取法。
 * @param strArrs 字符串二维数组
 */
export function listCompose(strArrs: string[][]): string[] {
  const [headArr, ...rest] = strArrs

  if (rest.length === 0) {
    return headArr
  }
  const subComposedStrArr = listCompose(rest)

  const results: string[] = []

  return headArr.reduce((acc, str) => {
    return acc.concat(subComposedStrArr.map((v) => str + v))
  }, results)
}
