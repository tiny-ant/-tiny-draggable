
type Point = { x: number; y: number }

/**
 * 获取子元素相对于父元素的坐标
 * @param {Element}} elem 子元素
 * @param {Element} parentElem 父元素
 * @returns {object} 返回坐标(x, y)
 */
export function getPosition(elem: HTMLElement, parentElem: HTMLElement): Point {
  const pRect = parentElem.getBoundingClientRect()
  const cRect = elem.getBoundingClientRect()

  return {
    x: cRect.left - pRect.left,
    y: cRect.top - pRect.top,
  }
}
