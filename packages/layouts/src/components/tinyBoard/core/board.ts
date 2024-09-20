import defaultRectSetter from './rectSetter/default'
import { isRectEqual } from './util'
import EventBus from '@tiny/events'
import Dashboard from './core'
import type {
  BoardInstance,
  BoardProps,
  InstanceEvents,
  Layout,
  LayoutId,
  LayoutRect,
  Plugin,
  PluginHooks,
  Rect,
} from './types'

const zeroRect: Rect = Object.freeze({
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

export default function createInstance<T>(
  options: BoardProps<T> & { dashboard: Dashboard<T> },
  plugins: Plugin<T>[]
): BoardInstance<T> {
  const {
    dashboard,
    data: layoutData,
    onLayoutActivated = noop,
    onLayoutUpdated = noop,
    throttleTiming = 100,
    readonly = false,
    multiple = false,
    smoothDrag = true,
  } = options || {}

  const emitter = new EventBus<InstanceEvents>()

  const updateShadowRect = (id: string, rect: Rect) => {
    emitter.emit('shadow::update', id, rect)
  }

  const pluginHooks: PluginHooks = {
    /* the default unlimited drag & resize */
    layoutHandler(_, allRects) {
      return allRects
    },
    rectSetter: defaultRectSetter,
    updateShadowRect,
  }

  const state = {
    isLeadingCall: true,
  }

  const updateLayout = () => {
    onLayoutUpdated(dashboard.items)
  }

  const resetState = () => {
    state.isLeadingCall = true
    // recorder?.reset()
    emitter.emit('shadow::hide')
  }

  function layoutAndUpdate(changingRects: LayoutRect[], alignToShadow = false) {
    const rects = dashboard.getLayoutRects()
    const allRects = pluginHooks.layoutHandler(changingRects, rects, pluginHooks.rectSetter)

    // TODO: 以下代码仅对磁贴布局生效，自由布局无需执行，仍待重构
    if (!alignToShadow && smoothDrag) {
      const draggingRects = new Set(changingRects.map((v) => v.id))

      allRects.forEach((layoutRect) => {
        const { id: layoutId, ...rect } = layoutRect

        if (draggingRects.has(layoutId)) {
          updateShadowRect(layoutId, rect)
          return
        }
        const originItem = dashboard.getById(layoutId)!

        // if (originItem === null) {
        //   return // not expected
        // }

        if (isRectEqual(rect, originItem.rect)) {
          return
        }

        dashboard.addOrUpdate({
          ...originItem,
          rect,
        })
      })
    } else {
      // alignToShadow || !smoothDrag
      allRects.forEach((layoutRect) => {
        const { id: layoutId, ...rect } = layoutRect
        const originItem = dashboard.getById(layoutId)

        if (originItem === null) {
          return // not expected
        }

        if (isRectEqual(rect, originItem.rect)) {
          return
        }

        dashboard.addOrUpdate({
          ...originItem,
          rect,
        })
      })
    }
  }

  let taskTimer: ReturnType<typeof setTimeout> | null = null
  let lastestRects: LayoutRect[] = []

  function clearTimer() {
    if (taskTimer !== null) {
      clearTimeout(taskTimer)
      taskTimer = null
    }
  }

  function throttledUpdate(rects: LayoutRect[]) {
    lastestRects = rects

    if (state.isLeadingCall) {
      state.isLeadingCall = false
      layoutAndUpdate(rects)
    } else if (taskTimer === null) {
      taskTimer = setTimeout(() => {
        taskTimer = null
        layoutAndUpdate(lastestRects)
      }, throttleTiming)
    }
  }

  const layoutFunc = throttleTiming > 0 ? throttledUpdate : layoutAndUpdate

  const instance: BoardInstance<T> = {
    layoutData: [...dashboard.items],
    /**
     * 激活一次拖拽交互（拖入、拖动或调整尺寸）
     * TODO: 是否可以砍掉这个API,只保留reLayout 和 commit
     */
    activate() {
      // recorder.update()
      onLayoutActivated()
    },

    // TODO: test case 拖拽后松开，重置
    cancel() {
      instance.reLayout([], true)
      resetState()
    },

    // 结束一次拖拽交互
    commit(rects = []) {
      console.log('commit: ', rects)
      instance.reLayout(rects, true)
      updateLayout()
      resetState()
    },

    /**
     * 每一次拖拽事件触发时调用此函数以更新布局
     * @param rects 拖拽块的最新rect数据
     * @param immediately
     */
    reLayout(rects = [], immediately = false) {
      // this is the tail-call under throttled circumstance.
      if (immediately) {
        // 先取消定时任务，防止状态倒退以及位置抖动
        clearTimer()
        layoutAndUpdate(rects, true)
        return
      }
      layoutFunc(rects)

      if (!smoothDrag) {
        return // 不存在“临时位置”概念
      }
      // apply changes for each dragging item
      rects.forEach((rect) => {
        const layoutItem = dashboard.getById(rect.id)

        if (layoutItem === null) {
          return // not expected
        }

        dashboard.addOrUpdate({
          ...layoutItem,
          rect,
        })
      })
    },

    setSelection(ids) {
      if (Array.isArray(ids) && ids.length === 0) {
        dashboard.clearSelection()
      } else {
        dashboard.setSelection(ids)
      }
    },

    clearSelection: noop,
    toogleSelected: noop,
    isSelected: falthy,
    getBoardProps: () => null,
    // 最基础的仪表板不提供任何拖拽和resize功能
    getDragProps: () => null,
    getItemProps(item: Layout<T>) {
      return {
        'data-layer': item.layer || 'default',
        'data-layout-id': item.id,
      }
    },
    getResizeProps: () => null,
    getWidth() {
      return dashboard.getDashboardWidth()
    },

    isEnabled(key) {
      return { multiple, readonly, smoothDrag }[key]
    },

    // to be confirmed
    addLayoutItem(item) {
      dashboard.addOrUpdate(item)
      instance.activate()
      instance.commit()
    },

    // TODO: 重载，支持批量删除
    removeLayoutItem(id: LayoutId) {
      dashboard.delete(id)
      instance.activate()
      instance.commit()
    },
  }

  plugins.forEach((plugin) => {
    plugin(instance, pluginHooks, emitter)
  })

  return instance
}
