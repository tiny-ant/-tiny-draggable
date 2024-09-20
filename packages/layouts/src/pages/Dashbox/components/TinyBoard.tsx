import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  useBoard,
  useCompactLayout,
  useDrag,
  useDrop,
  useGridAlign,
  useResize,
  usePercentStyle,
  useAutoExpand,
  BoardInstance,
  Layout,
  LayoutId,
  LayoutRect,
  Point,
  Size,
  SizeLimit,
  useSelection,
} from '~/components/tinyBoard'
import Mask from '~/components/tinyBoard/Mask'
import Resizer from './Resizer'

import './TinyBoard.less'
import GridMask from './GridMask'

interface Props<T> {
  data: Layout<T>[]
  id?: string
  parentId?: string
  readonly?: boolean
  renderItem(item: Layout<T>, instance: BoardInstance<T>): React.ReactElement
  onDrop(
    event: MouseEvent,
    data: Layout<T>
    // style?: React.CSSProperties
  ): Promise<boolean>

  onDragStart?(event: MouseEvent, item: Layout<T>): boolean | void
  onDrag?(event: MouseEvent, item: Layout<T>, distance: Point): void
  onDragEnd?(event: MouseEvent, item: Layout<T>, distance: Point): void

  onResizeStart?(event: MouseEvent, item: Layout<T>): boolean | void
  onResize?(event: MouseEvent, item: Layout<T>, distance: Point): void
  onResizeEnd?(event: MouseEvent, item: Layout<T>, distance: Point): void

  setSizeLimitById?(id: LayoutId): SizeLimit
  onLayoutUpdated(data: Layout<T>[]): void
  throttleTiming?: number
  [propName: string]: unknown
}

function truthy() {
  return true
}
function resolveTruthy() {
  return Promise.resolve(true)
}

export type BoardExport<T> = {
  container: HTMLDivElement | null
  prepareDrop(item: Pick<Layout<T>, 'id' | 'data'>, size: Size): void
  removeItem(id: string): void
  updateItem(
    id: string,
    rect: Partial<LayoutRect>,
    extraProps?: Record<string, unknown> | undefined
  ): void
}

function TinyBoard<T>(props: Props<T>, ref: React.Ref<BoardExport<T>>) {
  const {
    id,
    parentId,
    data,
    readonly,
    renderItem,
    onDrop = resolveTruthy,
    onDragStart = truthy,
    onDrag = truthy,
    onDragEnd = truthy,
    onResizeStart = truthy,
    onResize = truthy,
    onResizeEnd = truthy,
    setSizeLimitById,
    onLayoutUpdated,
    throttleTiming = 250,
    ...restProps
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  // const coverRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<React.FC>(null)

  const [draggingChart, setDraggingChart] = useState<LayoutId>(null)

  const cachedChildren = useRef<React.ReactElement[] | null>(null)

  // const showCover = () => {
  //   coverRef.current?.removeAttribute('hidden')
  // }
  // const hideCover = () => {
  //   coverRef.current?.setAttribute('hidden', '')
  // }

  const instance = useBoard(
    {
      container: containerRef.current,
      data,
      readonly,
      indicator: maskRef,
      throttleTiming,
      // smoothDrag: false,
      ...restProps,
      onDrop,
      onLayoutActivated(id) {
        setDraggingChart(id)
        // showCover()

        // optimization: 拖动的时候停止一切图表更新（除非主动触发事件给监听器）
        if (cachedChildren.current == null) {
          cachedChildren.current = instance.layoutData.map((item) => renderItem(item, instance))
        }
        containerRef.current?.classList.add('dragging')

        if (parentId) {
          containerRef.current?.classList.add('drop-active')
          EventBus.emit('CHILD_LAYOUT_ACTIVATE', parentId)
        }
      },
      onLayoutUpdated(data) {
        console.log('updated: ', data)
        setDraggingChart(null)
        cachedChildren.current = null // 拖拽结束，清除缓存
        // hideCover()
        onLayoutUpdated(data)
      },
      onLayoutDeactivated() {
        containerRef.current?.classList.remove('dragging')

        if (parentId) {
          containerRef.current?.classList.remove('drop-active')
        }
      },
    },
    useSelection,
    useGridAlign,
    usePercentStyle,
    useCompactLayout,
    useDrop,
    useDrag({
      onDragStart(ev, item) {
        if (ev.button !== 0) {
          return false
        }

        return onDragStart(ev, item)
      },
      onDrag,
      onDragEnd,
    }),
    useAutoExpand
  )

  instance.extend(
    useResize({
      onResizeStart(ev, item) {
        return onResizeStart(ev, item)
      },
      onResize,
      onResizeEnd,
      setSizeLimitById,
    })
  )

  // console.log('layoutData =', instance.layoutData)

  useImperativeHandle(
    ref,
    () => {
      return {
        container: containerRef.current,
        prepareDrop(item: Layout<T>, size: Size) {
          instance.setDropData(item, size)
          // showCover()
        },
        removeItem(id: string) {
          const layoutItem = instance.layoutData.find((v) => v.id === id)
          if (layoutItem) {
            instance.removeLayoutItem(id)
          }
        },
        updateItem(id: string, rect: LayoutRect, extraProps?: Record<string, unknown>) {
          const layoutItem = instance.layoutData.find((v) => v.id === id)

          if (layoutItem) {
            // NOTE! 必须先更新layoutItem，再开始重排 （x 这里state更新是异步的，仍然有问题）
            instance.updateLayoutItem(id, rect, extraProps)
            instance.activateLayout() // TODO: 是否可传id?
            instance.commitLayout()
          }
        },
      }
    },
    [instance]
  )

  useEffect(() => {
    function handleLayoutTargetChange(parentId: string) {
      if (parentId !== id) {
        return
      }
      const chartData = instance.getDropData()

      const canDropIntoChildren = !['tab', 'container', 'filterGroup'].includes(chartData.type)

      if (!canDropIntoChildren) {
        return
      }

      instance.cancelLayout() // TODO: 如果是从外层直接转移到子容器，是否可行？
    }

    EventBus.on('CHILD_LAYOUT_ACTIVATE', handleLayoutTargetChange)

    return () => {
      EventBus.off('CHILD_LAYOUT_ACTIVATE', handleLayoutTargetChange)
    }
  })

  const items =
    cachedChildren.current || instance.layoutData.map((item) => renderItem(item, instance))

  return (
    <div className="tiny-board" ref={containerRef} {...instance.getBoardProps()}>
      <GridMask
        columns={12}
        deg={135}
        bgColor="rgba(250, 250, 255)"
        dashColor="rgba(227, 237, 249, 0.75)"
      />
      <div className="abs-fill">
        {instance.layoutData.map((item, index) => {
          const active = instance.isSelected(item.id)
          const dragging = draggingChart === item.id

          return (
            <div
              key={item.id}
              className={`tiny-rect${active ? ' selected' : ''}${dragging ? ' dragging' : ''}`}
              {...instance.getDragProps(item)}
              {...instance.getItemProps(item)}
            >
              {active && <Resizer target={item} getResizeProps={instance.getResizeProps} />}
              {items[index]}
            </div>
          )
        })}
        {instance.layoutData.length === 0 && (
          <figure className="tiny-empty">
            <img src="img/placeholder.svg" alt="" />
            <figcaption className="tiny-empty-description">请从左侧拖入图表</figcaption>
          </figure>
        )}
        <Mask ref={maskRef} />
        {/* cover层可以防止一些拖拽结束后触发点击事件判断异常的问题 */}
        {/* <div className="board-cover abs-fill" ref={coverRef} hidden /> */}
      </div>
    </div>
  )
}

export default React.forwardRef(TinyBoard)
