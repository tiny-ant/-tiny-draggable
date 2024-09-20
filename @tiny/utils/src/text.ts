/**
 * @file - 文本处理类
 * 1. 格式化与排版
 * 2. 字符计算与转换
 * 3.
 * ...
 * @author tinyant <YuXiao2@sf-express.com>
 */

const sharedCanvas = document.createElement('canvas')
const sharedCtx = sharedCanvas.getContext('2d')

// 测量文本尺寸
export function measureText(text: string, cssFont = 'normal Microsoft YaHei 14px') {
  if (sharedCtx) {
    sharedCtx.font = cssFont
  }
  return sharedCtx?.measureText(text)
}

export function filterXss(value: string) {
  value = String(value)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&#34;')
  return value
}

export function strToHex(str: string) {
  return String(str)
    .split('')
    .map((ch) => ch.charCodeAt(0).toString(16))
    .join(',')
}

export function hexToStr(hex: string) {
  if (hex == null || hex === '') {
    return hex
  }

  return hex
    .split(',')
    .map((code) => String.fromCharCode(parseInt(code, 16)))
    .join('')
}

export default {}
