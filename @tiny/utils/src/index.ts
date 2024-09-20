export * from './math'

export const guid = (() => {
  // eslint-disable-next-line no-bitwise
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)

  return (prefix = ''): string =>
    `${prefix}${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
})()

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }

  return new Promise((resolve, reject) => {
    const elem = document.createElement('textarea')
    elem.style.cssText = 'height: 0; width: 0; opacity: 0;'
    elem.value = text
    document.body.appendChild(elem)
    elem.select()
    const succeeded = document.execCommand('Copy')
    document.body.removeChild(elem)
    succeeded ? resolve() : reject()
  })
}

/**
 * 触发浏览器下载，将blob数据保存到名为name的文件中
 * @param blob
 * @param name
 */
export function saveAs(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

// TODO: 如何检测对象内部循环引用？
// fixme: 复制Symbol、方法（函数），参考lodash
// @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof
// export function deepClone(obj: any) {
//   if (Array.isArray(obj)) {
//     return obj.map((item) => deepClone(item))
//   }
//   if (typeof obj === 'object' && obj !== null) {
//     const newObj: Record<string, unknown> = {}

//     Object.keys(obj).forEach((key) => {
//       newObj[key] = deepClone(obj[key])
//     })
//     return newObj as typeof obj
//   }
//   return obj
// }
