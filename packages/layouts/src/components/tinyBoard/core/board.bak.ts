import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import useLatest from '../hooks/useLatest'
import usePersistFn from '../hooks/usePersistFn'
import {
  BoardInstance,
  BoardProps,
  Layout,
  LayoutId,
  LayoutRect,
  Plugin,
  PluginHooks,
  Rect,
} from './types'
import defaultRectSetter from './rectSetter/default'
import defaultStyleSetter from './styleSetter/default'
import Dashboard from './core'
import LayoutRecorder from './layoutRecorder'

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

const useUpdate = () => {
  const [, setState] = useState({})

  return useCallback(() => setState({}), [])
}

// TODO: 增加clientToLocal等坐标转换支持
function getBounds(element: HTMLElement): Rect {
  // 这个不包含页面滚动
  const { top, left } = element.getBoundingClientRect()
  // 获取内边界宽高，不包含边框和滚动条，不受transform影响
  const [width, height] = [element.scrollWidth, element.scrollHeight]
  return { top, left, width, height }
}

export default function useBoard<T>(
  options: BoardProps<T>,
  ...plugins: Plugin<T>[]
): BoardInstance<T> {
  const {
    container,
    data: layoutData,
    onLayoutActivated = noop,
    onLayoutUpdated = noop,
    throttleTiming = 100,
    readonly = false,
    multiple = false,
    smoothDrag = true,
    ...restOptions
  } = options || {}

  const containerRef = useLatest<HTMLElement | null>(container)
  // 一个遮罩层div块的ref引用，指示当前交互块的目标位置 TODO: 多选模式下拖拽可能有多个指示块，如何处理？
  const indicator = useRef<React.FC>(null)

  const bounds = useRef<Rect>({ ...zeroRect })

  const dashboard = useMemo(() => new Dashboard(layoutData), [])
  const recorder = useMemo(
    () => (container === null ? null : new LayoutRecorder(container)),
    [container]
  )
  const [tmpLayout, setTmpLayout] = useState<Layout<T>[]>([])
  const layoutMap = useRef<Map<string, Layout<T>>>(new Map())
  const isLeadingCall = useRef(false)
  const layoutActivated = useRef(false)
  const update = useUpdate()

  // TODO: 如果本身容器在页面中发生了移动而未检测到并及时更新，这时bounds的信息是过期的，会导致问题，可否以bounds作为参数坐标呢？（top,left为0）
  // 不过这解决不了鼠标位置命中的判断失误问题，因为鼠标事件中的坐标信息是相对页面的
  // TODO: test 容器父元素存在滚动条的情况下，滚动变化后是否计算准确
  const updateBounds = () => {
    bounds.current = getBounds(containerRef.current as HTMLElement)
  }

  const defaultRect = {
    top: 0,
    left: 0,
    width: bounds.current.width / 4,
    height: bounds.current.width / 6,
  }

  const updateLayout = () => {
    onLayoutUpdated(dashboard.items)
  }

  const pluginHooks: PluginHooks<T> = {
    container,
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
    layoutData: [...dashboard.items],
    getItemProps(item: Layout<T>) {
      return {
        'data-layer': item.layer || 'default',
        'data-layout-id': item.id,
        style: item.style, // TODO: useInnerStyle ? layoutMap.current.get(item.id) : item.style
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

  addInstanceProp('setSelection', (id) => {
    if (id === undefined) {
      dashboard.clearSelection()
    } else {
      dashboard.setSelection(id)
    }
  })

  const resetState = () => {
    isLeadingCall.current = false
    // ensure that invoking reLayout will not have any side effects
    // if the layout is not activated in advance.
    layoutActivated.current = false
    recorder?.reset()
    indicator.current.hide()
  }

  /**
   * 激活一次拖拽交互（拖入、拖动或调整尺寸）
   */
  addInstanceProp('activate', () => {
    if (!containerRef.current) {
      return
    }
    updateBounds()
    recorder?.update()
    const resizerRect = recorder?.getSelectedBBox()

    if (resizerRect) {
      updateIndicator(resizerRect)
      indicator.current.show()
    }
    onLayoutActivated()
    layoutActivated.current = true
    isLeadingCall.current = true
  })

  // 结束一次拖拽交互
  addInstanceProp('commit', (rect = null) => {
    const saveRect = rect == null ? indicatorRect.current : rect

    if (saveRect && rect != null && rect.id == null) {
      saveRect.id = tmpData.current && tmpData.current.id
    }
    console.log('commit: ', saveRect)
    instanceRef.current.reLayout(saveRect, true)
    updateLayout()
    resetState()
  })

  // TODO: test case 拖拽后松开，重置
  addInstanceProp('cancel', () => {
    instanceRef.current.reLayout(null, true)
    resetState()
  })

  // to be confirmed
  addInstanceProp('addLayoutItem', (item, rect = defaultRect) => {
    // const layoutItem = {
    //   ...item,
    //   id: itemId,
    //   style: {
    //     ...item.style,
    //     ...instanceRef.current.getStyleObject({ ...defaultRect, ...rect })
    //   },
    // }
    dashboard.addOrUpdate(item)
    instanceRef.current.activate()
    instanceRef.current.commit()
  })

  // TODO: 重载，支持批量删除
  addInstanceProp('removeLayoutItem', (id: LayoutId) => {
    dashboard.delete(id)
    instanceRef.current.activate()
    instanceRef.current.commit()
  })

  addInstanceProp('updateLayoutItem', (rect, extraProps = {}) => {
    if (!layoutActivated.current) {
      return null
    }
    const layoutItem: Layout<T> | null = dashboard.getById(rect.id)

    if (!layoutItem) {
      console.log('%cupdate item not found', 'background: red')
      return null
    }

    const id = layoutItem.id
    const style = hooks.current.styleSetter(rect)
    const newLayoutItem = {
      ...layoutItem,
      ...extraProps,
      // TODO: 是否有必要重构该方法
      // modifying id or style with extraProps is not allowed
      id,
      style: { ...layoutItem.style, ...style },
    }

    dashboard.addOrUpdate(newLayoutItem)

    // update()

    return newLayoutItem
  })

  function layoutAndUpdate(changingRects: LayoutRect[] | null) {
    if (!layoutActivated.current) {
      return // 可否省去？
    }
    const rects = layoutRects.current
    hooks.current.layoutHandler(changingRects, rects)

    // 批量更新 TODO: performance optimize, return only changed rects
    rects.forEach((rect) => {
      const itemId = rect.id || ''
      // const gridRect = hooks.current.rectSetter(rect)
      const style = hooks.current.styleSetter(rect)
      const layoutItem = dashboard.getById(itemId)

      if (layoutItem === null) {
        return // not expected
      }

      dashboard.addOrUpdate({
        ...layoutItem,
        style: { ...layoutItem.style, ...style },
      })
      update()
    })
    // TODO: 如果有删除layoutMap中的项，但tmpLayout是通过state操作来更新的，更新时机不同步，这是个问题
    const newTmpLayout = tmpLayout
      .map((item) => dashboard.getById(item.id))
      .filter((item) => item != null)
    setTmpLayout(newTmpLayout)
  }

  const taskTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRects = useRef<LayoutRect[] | null>(null)

  // TODO: 没必要使用usePersistFn？
  const runTimer = usePersistFn(() => {
    taskTimer.current = null
    layoutAndUpdate(latestRects.current)
  })
  const clearTimer = () => {
    if (taskTimer.current !== null) {
      clearTimeout(taskTimer.current)
      taskTimer.current = null
    }
  }

  const throttledUpdate = usePersistFn((rects: LayoutRect[] | null) => {
    latestRects.current = rects

    if (isLeadingCall.current) {
      isLeadingCall.current = false
      layoutAndUpdate(rects)
    } else if (taskTimer.current === null) {
      taskTimer.current = setTimeout(runTimer, throttleTiming)
    }
  })

  const layoutFunc = throttleTiming > 0 ? throttledUpdate : layoutAndUpdate

  addInstanceProp('reLayout', (rects = null, immediately = false) => {
    // console.log('reLayout', { ...rect }, immediately)

    // this is the tail-call under throttled circumstance.
    if (immediately) {
      // 先取消定时任务，防止状态倒退以及位置抖动
      clearTimer()
      layoutAndUpdate(rects)
    } else {
      layoutFunc(rects)
    }

    if (rects !== null) {
      // TODO: smoothDrag 的真实含义就是使用indicator，去掉这个选项
      if (immediately || !smoothDrag) {
        // 将目标块更新到布局的位置
        rects.forEach(updateIndicator)
      } else {
        // 将目标块更新到鼠标拖拽的位置（临时位置）
        rects.forEach((rect) => instanceRef.current.updateLayoutItem(rect))
      }
    }
  })

  addInstanceProp('getContainer', () => containerRef.current)
  addInstanceProp('clearSelection', noop)
  addInstanceProp('setSelection', noop)
  addInstanceProp('toogleSelected', noop)
  addInstanceProp('isSelected', falthy)
  addInstanceProp('getBoardProps', () => null)
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
    plugin(instanceRef.current, hooks.current)
  })

  // 父组件数据变化同步给子组件（如果需要重排，需要在父组件中手动调用api）
  useEffect(() => {
    console.log('%clayoutData changed', 'background: yellow;color:blue')
    layoutMap.current = new Map(layoutData.map((v) => [v.id, v]))
    setTmpLayout([...layoutData])
    // TODO: 这里调用数据流向不单一，需重构？
    hooks.current.onLayoutUpdated([...layoutData])
  }, [hooks, layoutData])

  plugins.forEach((plugin) => {
    plugin(instanceRef.current, hooks.current)
  })

  return instanceRef.current
}
