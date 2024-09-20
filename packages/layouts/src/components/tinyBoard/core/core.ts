import EventBus from '@tiny/events'
import { getBBox } from './util'
import type { InnerLayout, Layout, LayoutId, LayoutRect } from './types'

type DashboardEvents = {
  /**
   * whenever the selection changes this event is triggered.
   * @param ids The set of id of selected elements in board, after change
   */
  selectionChanged: (ids: LayoutId[]) => void
  /**
   * 布局元素更新
   * @param rect
   */
  layoutChange: (rect: LayoutRect) => void
  /**
   * 布局更新
   * @param rects
   */
  layoutUpdated: (rects: LayoutRect[]) => void
  // layoutEnded(): void
}

function toLayoutItems<T>(items: InnerLayout<T>[]): Layout<T>[] {
  return items.map(({ status, ...rest }) => rest)
}

class Dashboard<T> extends EventBus<DashboardEvents> {
  #itemsMap = new Map<LayoutId, InnerLayout<T>>()

  items: InnerLayout<T>[] = []

  constructor(items: Layout<T>[]) {
    super()

    const map = new Map(
      items.map((v) => {
        const status: InnerLayout<T>['status'] = Object.create(null)
        return [v.id, { ...v, status }]
      })
    )

    this.#itemsMap = map

    let cachedList: InnerLayout<T>[] | null = []

    // eslint-disable-next-line no-new
    new Proxy(map, {
      set(_, key, newValue) {
        if (key === 'delete' || key === 'set') {
          cachedList = null
        } else if (key === 'clear') {
          cachedList = []
        }
        return true
      },
    })

    // eslint-disable-next-line no-new
    // new Proxy(map, {
    //   set(_, key) {
    //     if (key === 'set') {
    //     }
    //     return true
    //   }
    // })

    // 缓存列表数据
    Object.defineProperty(this, 'items', {
      get() {
        if (cachedList === null) {
          cachedList = [...map.values()]
        }
        return [...cachedList]
      },
      configurable: false,
    })
  }

  /**
   * 添加或更新一个块
   * TODO: refactor
   */
  addOrUpdate(item: Layout<T>) {
    this.#itemsMap.set(item.id, { status: Object.create(null), ...item })
  }

  /**
   * 删除一个块
   */
  delete(id: LayoutId) {
    const item = this.getById(id)

    if (item === null) {
      return false
    }
    this.#itemsMap.delete(id)

    if (item.status.selected) {
      this.emit('selectionChanged', this.getSelectedIds())
    }
    return true
  }

  /**
   * 批量删除多个块
   */
  deleteBatch(ids: LayoutId[]) {
    let hasChanged = false

    ids.forEach((id) => {
      const item = this.getById(id)

      if (item === null) {
        return
      }
      this.#itemsMap.delete(id)

      if (item.status.selected) {
        hasChanged = true
      }
    })
    if (hasChanged) {
      this.emit('selectionChanged', this.getSelectedIds())
    }
  }

  /**
   * 清除所有块的选中态
   */
  clearSelection() {
    let hasChanged = false

    this.items.forEach((item) => {
      if (item.status.selected) {
        hasChanged = true
        item.status.selected = false
      }
    })

    if (hasChanged) {
      this.emit('selectionChanged', [])
    }
  }

  getById(id: LayoutId) {
    const item = this.#itemsMap.get(id)

    if (item) {
      const { status, ...rest } = item
      return rest
    }
    return null
  }

  getDashboardWidth() {
    return 0
  }

  /**
   * 获取元素块归属虚拟图层名称
   * @param id 元素块ID
   */
  getLayerName(id: LayoutId) {
    return this.#itemsMap.get(id)?.layer || ''
  }

  getSelectedIds() {
    return this.items.reduce((acc: LayoutId[], item) => {
      if (item.status.selected) {
        acc.push(item.id)
      }
      return acc
    }, [])
  }

  getLayoutItems() {
    return toLayoutItems(this.items)
  }

  getLayoutRects(): LayoutRect[] {
    return [...this.items].map(({ id, rect }) => ({ id, ...rect }))
  }

  /**
   * 获取所有选中的块
   * @returns InnerLayout<T>[]
   */
  getSelectedItems() {
    const items = this.items.filter((v) => v.status.selected)
    return toLayoutItems(items)
  }

  getSelectedBBox() {
    const items = this.getSelectedItems()
    const rects = items.map((v) => v.rect)

    return getBBox(rects)
  }

  /**
   * 获取所有未选中的块
   */
  getUnSelectedItems() {
    const items = this.items.filter((v) => !v.status.selected)
    return toLayoutItems(items)
  }

  /**
   * 判断是否选中
   * @returns boolean
   */
  isSelected(id: LayoutId) {
    const item = this.getById(id)

    return (item && item.status.selected) || false
  }

  /**
   * 选中与参数rect区域有交叠的所有块
   */
  // selectByHitTest(rect: LayoutRect) {
  //   const ids: string[] = []
  //   let hasChanged = false

  //   this.items.forEach((chart) => {
  //     if (isRectIsolated(chart.rect, rect)) {
  //       if (chart.status.selected) {
  //         hasChanged = true
  //         chart.status.selected = false
  //       }
  //     } else {
  //       if (!chart.status.selected) {
  //         hasChanged = true
  //         chart.status.selected = true
  //       }
  //       ids.push(chart.id)
  //     }
  //   })
  //   if (hasChanged) {
  //     this.emit('selectionChanged', ids)
  //   }
  // }

  /**
   * 选中指定块，并清除其它块的选中态
   */
  selectSingle(id: LayoutId) {
    const item = this.getById(id)

    if (item === null) {
      return
    }

    let prevSelectedCount = 0

    this.items.forEach((item) => {
      if (item.status.selected) {
        item.status.selected = false
        prevSelectedCount += 1
      }
    })

    const hasChanged = prevSelectedCount !== 1 || !item.status.selected

    item.status.selected = true

    if (hasChanged) {
      this.emit('selectionChanged', [id])
    }
  }

  /**
   * 重新设置选中的块
   */
  setSelection(ids: LayoutId | LayoutId[]) {
    const prevSelected = this.getSelectedIds()
    const idArr = Array.isArray(ids) ? ids : [ids]
    const setIds = new Set(idArr)

    this.items.forEach((item) => {
      item.status.selected = setIds.has(item.id)
    })

    let hasChanged = setIds.size !== prevSelected.length

    if (!hasChanged) {
      prevSelected.forEach((id) => setIds.delete(id))
      hasChanged = setIds.size !== 0
    }
    if (hasChanged) {
      this.emit('selectionChanged', idArr)
    }
  }

  snapshot() {
    // todo
  }

  /**
   * 切换指定块的选中态
   */
  toggleSelect(id: LayoutId) {
    const item = this.getById(id)

    if (item === null) {
      return
    }
    item.status.selected = !item.status.selected

    this.emit('selectionChanged', this.getSelectedIds())
  }

  /**
   * 移除指定块的选中态
   */
  unselectItem(id: LayoutId) {
    const item = this.getById(id)

    if (item === null || !item.status.selected) {
      return
    }
    item.status.selected = false
    this.emit('selectionChanged', this.getSelectedIds())
  }

  commit() {}
}

export default Dashboard
