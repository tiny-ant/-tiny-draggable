import { getLayoutRectInBoard } from './util'
import type { LayoutId, LayoutRect } from './types'
import type Dashboard from './core'

export interface LayoutHandler<T extends null = null> {
  (changedRects: LayoutRect[], otherRects: LayoutRect[], dashboard: Dashboard<T>): void
}

// TODO: 增加clientToLocal等坐标转换支持
function getBounds(element: HTMLElement): Rect {
  // 这个不包含页面滚动
  const { top, left } = element.getBoundingClientRect()
  // 获取内边界宽高，不包含边框和滚动条，不受transform影响
  const [width, height] = [element.scrollWidth, element.scrollHeight]
  return { top, left, width, height }
}

// TODO: 如果本身容器在页面中发生了移动而未检测到并及时更新，这时bounds的信息是过期的，会导致问题，可否以bounds作为参数坐标呢？（top,left为0）
// 不过这解决不了鼠标位置命中的判断失误问题，因为鼠标事件中的坐标信息是相对页面的
// TODO: test 容器父元素存在滚动条的情况下，滚动变化后是否计算准确
const updateBounds = (element: HTMLElement) => {
  bounds = getBounds(element)
}
class LayoutRecorder {
  #container: HTMLElement
  #layoutMap = new Map<LayoutId, LayoutRect>()

  constructor(container: HTMLElement) {
    this.#container = container
  }

  getBounds(purge) {
    if (purge) {
      updateBounds(container)
    }
    return { ...bounds }
  }

  /**
   * 更新model，重新计算界面上各个块的rect信息
   * 获取所有元素块的尺寸位置信息（以仪表盘左上角为坐标原点）
   */
  update() {
    const floatElements = this.#container.querySelectorAll<HTMLElement>('[data-layout-id]')

    Array.from(floatElements).forEach((item) => {
      const { layoutId = '' } = item.dataset
      const rect = getLayoutRectInBoard(item)
      const itemLayout: LayoutRect = { id: layoutId, ...rect }
      this.#layoutMap.set(layoutId, itemLayout)
      // return itemLayout
    })
    // return rects.sort((a, b) => (a.top + a.height >= b.top + b.height ? 1 : -1))
  }

  reset() {
    this.#layoutMap.clear()
  }

  getRectById(id: LayoutId) {
    return this.#layoutMap.get(id) || null
    // const rect = this.#layoutMap.get(id) || null

    // if (rect !== null) {
    //   return rect
    // }
    // const element = this.#container.querySelector(`[data-layout-id="${id}"]`)

    // if (element !== null) {
    //   return getLayoutRectInBoard(element as HTMLElement)
    // }
    // return null
  }

  getLayoutRects() {
    return [...this.#layoutMap.values()].map((v) => ({ ...v }))
  }

  static _registeredLayout = new Map<string, LayoutHandler>()

  static getLayoutHandler(name: string) {
    return LayoutRecorder._registeredLayout.get(name)
  }

  static registerLayout(name: string, fn: LayoutHandler) {
    LayoutRecorder._registeredLayout.set(name, fn)
  }
}

export default LayoutRecorder
