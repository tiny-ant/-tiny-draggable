import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import useKeyboardModifier from './core/lib/useKeyboardModifier'
import createSelect from './core/lib/select'
import createDragProps from './core/lib/drag'
import createDrop from './core/lib/drop'
import createBoard from './core/board'
import Dashboard from './core/core'
import LayoutRecorder from './core/layoutRecorder'
import createInstance from './core/board'

import Mask from '~/components/tinyBoard/Mask'
import Resizer from './Resizer'
import GridMask from './GridMask'
import type { Plugin, BoardInstance, Layout, LayoutId, Point, SizeLimit } from './core/types'

import './index.less'

interface Props<T> {
  data: Layout<T>[]
  width: number
  readonly?: boolean
  /** 是否平滑拖动（有阴影块指示） */
  smoothDrag?: boolean
  throttleTiming?: number
  renderItem(item: Layout<T>, instance: BoardInstance<T>): React.ReactElement
  onLayoutUpdated(data: Layout<T>[]): void
}

function noop() {}
function truthy() {
  return true
}
function resolveTruthy() {
  return Promise.resolve(true)
}

function InkBoard<T>(props: Props<T>, ref: React.Ref<{ getInstance(): BoardInstance<T> }>) {
  const {
    data,
    width,
    readonly,
    smoothDrag = true,
    renderItem,
    onLayoutUpdated,
    throttleTiming = 250,
  } = props

  // 记录按下的多选组合键
  const keyCodeRef = useKeyboardModifier()
  const containerRef = useRef<HTMLDivElement>(null)

  const cachedChildren = useRef<React.ReactElement[] | null>(null)

  const dashboard = useMemo(() => new Dashboard(data), [])
  // const recorder = new LayoutRecorder(container)

  dashboard.getDashboardWidth = () => width

  // 暴露给外部的API
  const instance = useMemo(() => {
    const editPlugins = [
      ResizerPlugin, // 调整框
      StickyAlignPlugin, // 磁吸
      ShadowPlugin, // 布局辅助块
      ShortcutsPlugin, // 快捷键插件(方向键移动、删除选中项)
    ]

    return createInstance(
      {
        data,
        dashboard,
        readonly,
        throttleTiming,
        onLayoutUpdated() {},
      },
      readonly ? [] : editPlugins
    )
    // TODO: 切换预览状态如何重置插件视图？
  }, [readonly, throttleTiming])

  // console.log('layoutData =', instance.layoutData)

  useImperativeHandle(
    ref,
    () => {
      return {
        getInstance() {
          return instance
        },
      }
    },
    [instance]
  )

  const selectEvents = readonly ? {} : createSelect()
  const dropEvents = readonly ? {} : createDrop()

  const getDragProps = readonly
    ? truthy
    : createDragProps({
        instance,
        noOverflow: true,
      })

  const items =
    cachedChildren.current || instance.layoutData.map((item) => renderItem(item, instance))

  return (
    <div
      className="tiny-board"
      ref={containerRef}
      {...selectEvents}
      {...dropEvents}
      style={{ width }}
    >
      <div className="abs-fill">
        {renderItem
          ? instance.layoutData.map((item, index) => renderItem(item))
          : instance.layoutData.map((item, index) => {
              const active = instance.isSelected(item.id)

              return (
                <div
                  key={item.id}
                  className={`tiny-rect${active ? ' selected' : ''}`}
                  {...getDragProps(item)}
                  {...instance.getItemProps(item)}
                >
                  {items[index]}
                </div>
              )
            })}
      </div>
    </div>
  )
}
