import React, { useState, useCallback, useRef, useEffect } from 'react'
import useLatest from './useLatest'
import usePersistFn from './usePersistFn'
import { getLayoutRectInBoard, guid, clamp } from '../util'
import {
  BoardInstance,
  BoardProps,
  Layout,
  LayoutId,
  LayoutRect,
  Plugin,
  PluginHooks,
} from '../types'

const zeroRect = Object.freeze({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
})

function noop() {}

function truthy() {
  return true
}
function falthy() {
  return false
}

const defaultRectSetter = (rect: LayoutRect) => rect

// layoutRect => style存储格式 转换
const defaultStyleSetter = (rect: LayoutRect): React.CSSProperties => {
  const { top, left, width, height } = rect

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
  }
}

// TODO: 增加clientToLocal等坐标转换支持
function getBounds(element: HTMLElement): Omit<LayoutRect, 'id'> {
  // 这个不包含页面滚动
  const { top, left } = element.getBoundingClientRect()
  // 获取内边界宽高，不包含边框和滚动条，不受transform影响
  const [width, height] = [element.scrollWidth, element.scrollHeight]
  return { top, left, width, height }
}

function isStacked<T>(item: Layout<T>): boolean {
  return Number(item.style.zIndex) > 0
}

export default function useBoard<T>(
  options: BoardProps<T>,
  ...plugins: Plugin<T>[]
): BoardInstance<T> {
  const {
    container,
    layer = 'content',
    data: layoutData,
    onDrop = truthy,
    onLayoutActivated = noop,
    onLayoutUpdated = noop,
    throttleTiming = 100,
    readonly = false,
    multiple = false,
    smoothDrag = true,
    ...restOptions
  } = options || {}

  const layerId = useRef(layer).current
  const containerRef = useLatest<HTMLElement | null>(container)
  // 一个遮罩层div块的ref引用，指示当前交互块的目标位置 TODO: 多选模式下拖拽可能有多个指示块，如何处理？
  const indicator = useRef<React.FC>(null)

  const bounds = useRef<Omit<LayoutRect, 'id'>>({ ...zeroRect })

  const [tmpLayout, setTmpLayout] = useState<Layout<T>[]>([])
  const layoutMap = useRef<Record<string, Layout<T>>>({}) // TODO: 使用Map对象
  const isLeadingCall = useRef(false)
  const layoutActivated = useRef(false)

  const layoutRects = useRef<LayoutRect[]>([])

  // TODO: 如果本身容器在页面中发生了移动而未检测到并及时更新，这时bounds的信息是过期的，会导致问题，可否以bounds作为参数坐标呢？（top,left为0）
  // 不过这解决不了鼠标位置命中的判断失误问题，因为鼠标事件中的坐标信息是相对页面的
  // TODO: test 容器父元素存在滚动条的情况下，滚动变化后是否计算准确
  const updateBounds = () => {
    bounds.current = getBounds(containerRef.current as HTMLElement)
  }

  // 获取所有未选中图表的矩形尺寸（以仪表盘左上角为坐标原点）
  const updateRects = (excludeId: LayoutId): void => {
    if (!containerRef.current) {
      return
    }

    let floatElements = Array.from(
      containerRef.current.querySelectorAll(`[data-layer="${layerId}"][data-layout-id]`)
    )

    // 过滤掉悬浮的块以及传入参数排除的块
    floatElements = floatElements.filter((element) => {
      const layoutId = (element as HTMLElement).dataset.layoutId as string
      const layoutItem = layoutMap.current[layoutId]

      return layoutId !== excludeId && layoutItem && Number(layoutItem.style.zIndex || 0) <= 0
    })

    layoutRects.current = floatElements
      .map((element) => getLayoutRectInBoard(element as HTMLElement))
      .sort((r1, r2) => (r1.top + r1.height >= r2.top + r2.height ? 1 : -1))
  }

  const tmpData = useRef<Layout<T> | null>(null)
  const tmpRect = useRef<LayoutRect | null>(null)
  const indicatorRect = useRef<LayoutRect | null>(null)

  const defaultRect = {
    top: 0,
    left: 0,
    width: bounds.current.width / 4,
    height: bounds.current.width / 6,
  }

  // 如果指定了layout参数，将直接使用参数更新，否则将使用layoutMap中的数据更新
  const updateLayout = (layout?: Layout<T>[]) => {
    if (!layout) {
      layout = tmpLayout.map((item) => layoutMap.current[item.id]).filter(Boolean)
    }
    // console.log([...tmpLayout], { ...layoutMap.current })
    setTmpLayout(layout)
    onLayoutUpdated(layout)
  }

  /**
   * 刷新指示块（用以最终确定目标块的尺寸和位置）
   */
  const updateIndicator: PluginHooks<T>['updateIndicator'] = (rect) => {
    // TODO: 抽离 limitRange Layout算法其它地方也一样 useBoundsLimit
    if (rect.left !== undefined && rect.width !== undefined) {
      rect.left = clamp(rect.left, 0, bounds.current.width - rect.width)
    }

    const gridRect = hooks.current.rectSetter(rect)
    const style = hooks.current.styleSetter(gridRect)

    indicator.current.update(style)

    indicatorRect.current = Object.assign({}, indicatorRect.current, gridRect)
    return indicatorRect.current

    // TODO: 拖动过程计算位置时，如果拖动到边界位置，控制滚动，并且滚动变化量与拖动元素位置变化量同步！
    // throttleScroll(top);
  }

  const pluginHooks: PluginHooks<T> = {
    container,
    async onDrop(event, data) {
      // const style = hooks.current.styleSetter(indicatorRect.current || {})
      return onDrop(event, data) // , { ...style })
    },
    getDropData: () => tmpData.current,
    /* the default unlimited drag & resize */
    layoutHandler(rect) {
      if (rect !== null) {
        updateIndicator(rect)
      }
    },
    rectSetter: defaultRectSetter,
    styleSetter: defaultStyleSetter,
    updateIndicator,
    ...restOptions,
  }

  const hooks = useLatest(pluginHooks)

  const exportProps: Partial<BoardInstance<T>> = {
    defaultRect,
    layoutData: tmpLayout,
    getDropData: () => tmpData.current,
    getItemProps(item: Layout<T>) {
      return {
        'data-layer': layerId,
        'data-layout-id': item.id,
        style: item.style,
      }
    },
  }

  function addInstanceProp<P extends keyof BoardInstance<T>>(name: P, fn: BoardInstance<T>[P]) {
    exportProps[name] = fn
  }

  addInstanceProp('getStyleObject', (rect) => {
    const gridRect = hooks.current.rectSetter(rect)
    return hooks.current.styleSetter(gridRect)
  })

  // 外部拖拽开始时调用
  addInstanceProp('setDropData', (item, rect = defaultRect) => {
    if (item.id && layoutMap.current[item.id] !== undefined) {
      throw Error(`Duplicated keys: item ${item.id} already exists.`)
    }
    if (typeof item !== 'object') {
      throw TypeError('item must be a object')
    }

    tmpData.current = item
    tmpRect.current = { ...defaultRect, ...rect, id: null } // ensure id is null
    console.log('set drop data', item)
  })

  const getLayoutRectById = useCallback(
    (id: LayoutId) => {
      if (tmpData.current && (id === null || tmpData.current.id == id)) {
        return tmpRect.current
      }
      const element = containerRef.current?.querySelector(`[data-layout-id="${id || ''}"]`)

      if (element) {
        return getLayoutRectInBoard(element as HTMLElement)
      }
      return null
    },
    [containerRef, tmpRect]
  )

  function activateLayout(id: null): null
  function activateLayout(id: string): LayoutRect

  function activateLayout(id: LayoutId = null) {
    updateBounds()

    const itemRect = getLayoutRectById(id)

    if (itemRect) {
      updateIndicator(itemRect)
      indicator.current.show()
    }
    // TODO: 如果要支持多选，这一步是否要抽离出来在外部单独调用？
    instanceRef.current.setSelection(id)
    updateRects(id)
    onLayoutActivated(id)
    layoutActivated.current = true
    isLeadingCall.current = true

    return itemRect
  }

  const resetState = () => {
    tmpData.current = null
    tmpRect.current = null
    indicatorRect.current = null
    isLeadingCall.current = false
    // ensure that invoking reLayout will not have any side effects
    // if the layout is not activated in advance.
    layoutActivated.current = false
    layoutRects.current = []
  }

  /**
   * 激活一次拖拽交互（拖入、拖动或调整尺寸）
   * 并返回目标块的layoutRect
   */
  addInstanceProp('activateLayout', activateLayout)

  // 结束一次拖拽交互
  addInstanceProp('commitLayout', (rect = null) => {
    const saveRect = rect == null ? indicatorRect.current : rect

    if (saveRect && rect != null && rect.id == null) {
      saveRect.id = tmpData.current && tmpData.current.id
    }
    console.log('commit: ', saveRect)
    instanceRef.current.reLayout(saveRect, true)
    indicator.current.hide()
    updateLayout()
    resetState()
  })

  addInstanceProp('cancelLayout', (reset = true) => {
    instanceRef.current.reLayout(null, true)
    indicator.current.hide()

    if (reset) {
      resetState()
    }
  })

  addInstanceProp('addLayoutItem', (item, rect = defaultRect) => {
    const itemId = item.id || guid('block-')

    if (isStacked(item)) {
      const itemRect = { id: null, ...defaultRect, ...rect }
      const layoutItem = {
        ...item,
        id: itemId,
        style: { ...item.style, ...instanceRef.current.getStyleObject(itemRect) },
      }

      layoutMap.current[layoutItem.id] = layoutItem
      updateLayout([...tmpLayout, layoutItem])
      return layoutItem
    }
    // item.id = itemId
    instanceRef.current.setDropData(item, rect)
    instanceRef.current.activateLayout()
    instanceRef.current.commitLayout()
    return layoutMap.current[itemId]
  })

  addInstanceProp('removeLayoutItem', (id: LayoutId) => {
    if (id === null || layoutMap.current[id] === undefined) {
      return
    }
    const layoutItem = layoutMap.current[id]

    console.log('removing: ', layoutItem)

    delete layoutMap.current[id]

    if (isStacked(layoutItem)) {
      updateLayout()
      return
    }
    instanceRef.current.activateLayout()
    instanceRef.current.commitLayout()
  })

  addInstanceProp('updateLayoutItem', (itemId, rect, extraProps = {}) => {
    if (!layoutActivated.current) {
      return null
    }
    let isAddItem = false
    let layoutItem: Layout<T> | null = null

    if (itemId !== null && layoutMap.current[itemId]) {
      layoutItem = layoutMap.current[itemId]
    } else if (tmpData.current && tmpData.current.id == itemId) {
      if (tmpData.current.id == null) {
        tmpData.current.id = guid('block-')
      }
      layoutItem = tmpData.current
      isAddItem = true
      console.log('%cadd new item', 'background: red')
    }
    if (!layoutItem) {
      return null
    }

    const id = layoutItem.id
    const style = hooks.current.styleSetter(rect)

    layoutMap.current[id] = {
      ...layoutItem,
      ...extraProps, // modifying id or style with extraProps is not allowed
      id,
      style: { ...layoutItem.style, ...style },
    }

    const newTmpLayout = tmpLayout.map((item) => layoutMap.current[item.id])

    if (isAddItem) {
      tmpLayout.push(layoutMap.current[id]) // TODO: an trick, refactor needed
      newTmpLayout.push(layoutMap.current[id])
    }
    setTmpLayout(newTmpLayout)

    return layoutMap.current[id]
  })

  function layoutAndUpdate(rect: LayoutRect | null) {
    if (!layoutActivated.current) {
      return
    }
    const rects = layoutRects.current
    hooks.current.layoutHandler(rect, rects)

    // 批量更新 TODO: performance optimize, return only changed rects
    // 通过 layoutMap = Object.assign({}, oldLayoutMap) layoutMap[id] !== oldLayoutMap[id] 获取变化列表
    rects.forEach((rect) => {
      const itemId = rect.id as string
      // const gridRect = hooks.current.rectSetter(rect)
      const style = hooks.current.styleSetter(rect)
      const layoutItem = layoutMap.current[itemId]

      layoutMap.current[itemId] = {
        ...layoutItem,
        style: { ...layoutItem.style, ...style },
      }
    })
    // TODO: 如果有删除layoutMap中的项，但tmpLayout是通过state操作来更新的，更新时机不同步，这是个问题
    const newTmpLayout = tmpLayout
      .map((item) => layoutMap.current[item.id])
      .filter((item) => item != null)
    setTmpLayout(newTmpLayout)
  }

  const taskTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRect = useRef<LayoutRect | null>(null)

  // TODO: 没必要使用usePersistFn？
  const runTimer = usePersistFn(() => {
    taskTimer.current = null
    layoutAndUpdate(latestRect.current)
  })

  const throttledUpdate = usePersistFn((rect: LayoutRect | null) => {
    latestRect.current = rect

    if (taskTimer.current === null) {
      taskTimer.current = setTimeout(runTimer, throttleTiming)
    }
  })

  const layoutFunc = throttleTiming > 0 ? throttledUpdate : layoutAndUpdate

  addInstanceProp('reLayout', (rect = null, immediately = false) => {
    // console.log('re-Layout', { ...rect }, immediately)

    if (immediately || isLeadingCall.current) {
      // 立即布局后，必须取消尚未执行的定时任务以防止可能出现的状态倒退以及闪烁现象
      if (taskTimer.current !== null) {
        clearTimeout(taskTimer.current)
        taskTimer.current = null
      }
      isLeadingCall.current = false
      layoutAndUpdate(rect)
    } else {
      layoutFunc(rect)
    }

    if (rect !== null) {
      // if (throttleTiming > 0 && !immediately) {
      //   const { left, width } = rect
      //   console.log('update indicator: ', left, width)
      //   // TODO: 这段代码是解决什么场景问题？貌似可以删除？
      //   updateIndicator({ left, width })
      // }
      if (immediately || !smoothDrag) {
        // 将目标块更新到布局的位置
        if (indicatorRect.current != null) {
          instanceRef.current.updateLayoutItem(rect.id, indicatorRect.current)
        }
      } else if (rect.id !== null) {
        // 将目标块更新到鼠标拖拽的位置（临时位置）
        instanceRef.current.updateLayoutItem(rect.id, rect)
      }
    }
  })

  // const stackLayoutItem = (id: string, type: 'TOP' | 'BOTTOM') => {
  //   const layoutItem = layoutMap.current[id];
  //   const stacked = isStacked(layoutItem)

  //   // 所有设置悬浮的取出来排好序
  //   const stackedLayoutItems = layoutData.filter(item => isStacked(item));

  //   stackedLayoutItems.sort((a: Layout, b: Layout) =>
  //     Number(a.style.zIndex) > Number(b.style.zIndex) ? 1 : -1
  //   );

  //   if (type === 'TOP') {
  //     stackedLayoutItems.push(layoutItem); // 置顶
  //   } else {
  //     stackedLayoutItems.unshift(layoutItem); // 置底
  //   }
  //   // 默认的zIndex为0, 选中的为1，悬浮的zIndex从2开始
  //   stackedLayoutItems.forEach((item, index) => {
  //     layoutMap.current[item.id] = {
  //       ...item,
  //       style: Object.assign(item.style, { zIndex: index + 2 }),
  //     };
  //   });

  //   if (stacked) {
  //     updateLayout()
  //     return
  //   }

  //   instanceRef.current.activateLayout(null);
  //   instanceRef.current.commitLayout();
  // };

  // 关闭悬浮
  // const unStackLayoutItem = (id: string) => {
  //   const layoutItem = layoutMap.current[id];

  //   delete layoutItem.style.zIndex;
  //   instanceRef.current.activateLayout(id);
  //   instanceRef.current.commitLayout();
  // };

  addInstanceProp('getContainer', () => containerRef.current)
  addInstanceProp('clearSelection', noop)
  addInstanceProp('setSelection', noop)
  addInstanceProp('toogleSelected', noop)
  addInstanceProp('isSelected', falthy)
  addInstanceProp('getBoardProps', () => null)
  addInstanceProp('getItemProps', () => null)
  // 最基础的仪表板不提供任何拖拽和resize功能
  addInstanceProp('getDragProps', () => null)
  addInstanceProp('getResizeProps', () => null)
  addInstanceProp('getBounds', (purge) => {
    if (purge) {
      updateBounds()
    }
    return bounds.current
  })
  addInstanceProp('isEnabled', (key) => ({ multiple, readonly, smoothDrag })[key])
  addInstanceProp('isElementInBoard', (element) => containerRef.current?.contains(element) || false)

  const instanceRef = useLatest(exportProps as BoardInstance<T>)

  addInstanceProp('extend', (plugin) => {
    plugin(instanceRef, hooks.current)
  })

  // 父组件数据变化同步给子组件（如果需要重排，需要在父组件中手动调用api）
  useEffect(() => {
    console.log('%clayoutData changed', 'background: yellow;color:blue')
    layoutMap.current = Object.create(null)
    layoutData.forEach((item) => (layoutMap.current[item.id] = item))
    setTmpLayout([...layoutData])
    // TODO: 这里调用数据流向不单一，需重构？
    hooks.current.onLayoutUpdated([...layoutData])
  }, [hooks, layoutData])

  plugins.forEach((plugin) => {
    plugin(instanceRef, hooks.current)
  })

  return instanceRef.current
}
