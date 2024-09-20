import { useRef } from 'react'
import { BoardInstance, PluginHooks, LayoutRect } from '../types'

export default function createDrop<T>(instance: BoardInstance<T>, hooks: PluginHooks) {
  const { onDrop, getDropData } = hooks

  const dragHandle = useRef<ReturnType<typeof getDragHandler> | null>(null)

  const getDragHandler = (size: Partial<LayoutRect>) => {
    // TODO: clientToLocal or pageToLocal ？
    const { top, left } = instance.getBounds()
    const { width = 0, height = 0 } = size
    let lastPos = { x: -Infinity, y: -Infinity }

    return (ev: MouseEvent): LayoutRect | null => {
      const { clientX, clientY } = ev

      if (lastPos.x === clientX && lastPos.y === clientY) {
        return null // mouse did not moved since the previous invoke
      }
      lastPos = { x: clientX, y: clientY }

      const x = clientX - left
      const y = clientY - top

      return {
        id: '',
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
      }
    }
  }

  return {
    onDragEnter(ev: React.MouseEvent<HTMLElement, DragEvent>) {
      ev.preventDefault()

      if (getDropData() == null) {
        console.log('no drop data')
        return
      }

      if (ev.nativeEvent.dataTransfer) {
        ev.nativeEvent.dataTransfer.effectAllowed = 'all'
        ev.nativeEvent.dataTransfer.dropEffect = 'copy'
      }

      const size = instance.activate()

      if (size !== null) {
        dragHandle.current = getDragHandler(size)
        const dropRect = dragHandle.current(ev.nativeEvent)
        // 有时拖入立即放开，没有机会触发dragover事件，因此必须立即调用一次

        if (dropRect) {
          instance.reLayout([dropRect])
        }
      }
    },

    // NOTE! 此事件会持续触发，无论鼠标是否移动
    onDragOver(ev: React.MouseEvent<HTMLElement, DragEvent>) {
      if (dragHandle.current === null) {
        return // unexpected dragging target, let's say, a text.
      }

      ev.preventDefault()
      ev.stopPropagation() // do not propagate dragover event to parent ( better performance in a nested layout )

      const dropRect = dragHandle.current(ev.nativeEvent)
      instance.reLayout([dropRect])
    },

    // NOTE! 跨过子元素边界也会触发dragleave事件
    onDragLeave(ev: React.MouseEvent<HTMLElement, DragEvent>) {
      const { nativeEvent } = ev

      // if (getDropData() == null) {
      //   return; // 如果没有拖拽数据，cancel动作也是不允许的
      // }
      if (
        instance.isElementInBoard(
          nativeEvent.relatedTarget as HTMLElement | null
        ) === false
      ) {
        instance.cancel()
      }
    },

    async onDrop(ev: React.MouseEvent<HTMLElement, DragEvent>) {
      ev.preventDefault()

      if (dragHandle.current === null) {
        return // unexpected dragging target, let's say, a text.
      }

      const data = getDropData()

      if (data == null) {
        return
      }

      console.log('[drop]', data)

      const dropRect = dragHandle.current(ev.nativeEvent)

      // 由外部自定义如何处理：
      // true 添加并提交更改
      // false 取消操作，并恢复之前的布局(不提交更改)
      const accepted = await onDrop(ev.nativeEvent, data)

      if (accepted) {
        instance.commit([dropRect])
      } else {
        instance.cancel()
      }

      dragHandle.current = null
    },
  }
}
