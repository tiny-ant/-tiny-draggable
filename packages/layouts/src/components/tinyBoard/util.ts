import { LayoutRect, Point, Vector } from './types'

export default null

export const guid = (() => {
  // eslint-disable-next-line no-bitwise
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)

  return (prefix = ''): string =>
    `${prefix}${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
})()

export const isBetween = (n: number, min: number, max: number): boolean => n >= min && n <= max

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max)

export const ArbitraySize = {
  minWidth: -Infinity,
  minHeight: -Infinity,
  maxWidth: Infinity,
  maxHeight: Infinity,
}

/**
 * 坐标系转换工具（暂未实现）
 */
// clientToLocal(x: number, y: number): Point

/**
 * 判断两个矩形在X轴方向上的投影是否重叠
 * @params {number} errorRange 允许的误差范围(默认0.5像素，即重叠0.5px以内被认为是不重叠的)
 */
export const ifXRangeCoincide = (r1: LayoutRect, r2: LayoutRect, errorRange = 0.5): boolean =>
  r1.left + errorRange < r2.left + r2.width && r1.left + r1.width > r2.left + errorRange

/**
 * 判断两个矩形在Y轴方向上的投影是否重叠
 * @params {number} errorRange 允许的误差范围(默认0.5像素，即重叠0.5px以内被认为是不重叠的)
 */
export const ifYRangeCoincide = (r1: LayoutRect, r2: LayoutRect, errorRange = 0.5): boolean =>
  r1.top + errorRange < r2.top + r2.height && r1.top + r1.height > r2.top + errorRange

/**
 * 判断两个矩形区域是否是分离的(注意等号，两个矩形紧贴在一起也是分离的)
 * @params {object} r1, r2 矩形对象
 * @params {number} errorRange 允许的误差范围(默认0.5像素)，当重叠小于误差指定的值时也认为是分离的
 */
export const isRectIsolated = (r1: LayoutRect, r2: LayoutRect, errorRange = 0.5): boolean =>
  r1.left + r1.width <= r2.left + errorRange ||
  r2.left + r2.width <= r1.left + errorRange ||
  r1.top + r1.height <= r2.top + errorRange ||
  r2.top + r2.height <= r1.top + errorRange

export const isPointInRect = (point: Point, rect: LayoutRect | DOMRect): boolean => {
  if (point.x < rect.left || point.x > rect.left + rect.width) {
    return false
  }
  if (point.y < rect.top || point.y > rect.top + rect.height) {
    return false
  }
  return true
}

export const rectCenter = (r: LayoutRect | DOMRect): Point => {
  const { top, left, width, height } = r

  return { x: left + width / 2, y: top + height / 2 }
}

// 获取矩形碰撞集合
export const getCollidedRects = (
  rect: LayoutRect,
  rects: LayoutRect[],
  errorRange?: number
): LayoutRect[] => {
  return rects.filter((r) => !isRectIsolated(r, rect, errorRange))
}

/**
 * move a rect to point {x, y}, the position is indicated by the top-left corner.
 */
export const moveRectToPoint = (rect: LayoutRect, { x, y }: Point): LayoutRect => {
  const { id, width, height } = rect

  return {
    id,
    top: y,
    left: x,
    width,
    height,
  }
}

/**
 * move a rect as specified by vector {x, y}.
 */
export const moveRect = (rect: LayoutRect, { x, y }: Vector): LayoutRect => {
  const { id, top, left, width, height } = rect

  return {
    id,
    top: top + y,
    left: left + x,
    width,
    height,
  }
}

// 将矩形rect转换为参照容器bounds左上角的坐标
export const getLayoutRectInBoard = (
  element: HTMLElement /* , bounds: LayoutRect */
): LayoutRect => {
  // const rect = element.getBoundingClientRect()
  // const { width, height } = element
  // const left = rect.left - bounds.left
  // const top = rect.top - bounds.top
  // note that a container element in a board is not expected to have a scrollbar
  const { clientWidth: width, clientHeight: height } = element
  const left = element.offsetLeft
  const top = element.offsetTop
  const layoutId = element.dataset.layoutId || ''

  return {
    id: layoutId,
    left,
    top,
    width,
    height,
  }
}

// TODO: 简化代码？试想一下能不能换个参数形式
// 获取不超出容器rect范围，中心坐标点(x, y)处尺寸为 width x height 的矩形
// export const getLimitedRectInBounds = (
//   { x, y }: Point,
//   { width, height }: Size,
//   bounds: LayoutRect
// ): LayoutRect => {
//   let top
//   let left

//   width = Math.min(width, bounds.width)
//   height = Math.min(height, bounds.height)

//   if (bounds.width > width) {
//     left = clamp(x - width / 2, bounds.left, bounds.left + bounds.width - width)
//   } else {
//     ({ left } = bounds)
//   }

//   if (bounds.height > height) {
//     top = clamp(y - height / 2, bounds.top, bounds.top + bounds.height - height)
//   } else {
//     ({ top } = bounds)
//   }

//   return { id: null, top, left, width, height }
// }

// export const limitRectInBounds = (point: Point, size: Size) => {
//   // TODO: bounds重命名，或者转换成基坐标？
//   const { width, height } = bounds.current;
//   const containerBounds = { id: null, top: 0, left: 0, width, height };

//   return getLimitedRectInBounds(point, size, containerBounds);
// };

// 获取top属性值大于boundary的矩形，并排序
export const getOrderedBelowRects = (boundary: number, rects: LayoutRect[], errorRange = 0.5) => {
  return (
    rects
      // 第一步：过滤，仅在rect下方的矩形才可能被影响
      .filter(({ top, height }) => {
        return top + height >= boundary - errorRange
      })
      // 第二步：排序，必须按从上到下的次序依次挪动受影响的矩形（就像力的传导模型一样）
      .sort((r1, r2) => {
        // TODO: 是按bottom 还是 top 排序？
        return r1.top + r1.height >= r2.top + r2.height ? 1 : -1
      })
  )
}
