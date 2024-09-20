import { useLayoutEffect, useMemo, useState } from 'react'
import { InstanceRef, LayoutId, LayoutRect } from '../types'

/**
 * 仪表板元素块支持选中
 * @example
 * useBoard(
 *   {
 *     multiple: true,
 *   },
 *   useSelection
 * )
 */
export default function useSelection<T>(instanceRef: InstanceRef<T>) {
  const container = instanceRef.current.getContainer()
  const readonly = instanceRef.current.isEnabled('readonly')
  const multiple = instanceRef.current.isEnabled('multiple')

  const [selectedIds, setSelectedIds] = useState<LayoutId[]>([])

  const selectedBBox = useMemo((): Omit<LayoutRect, 'id'> | null => {
    if (container === null) {
      return null
    }
    const getItemRect = (id: LayoutId) => {
      const itemEl = container.querySelector(`[data-layout-id="${id}"]`)

      if (itemEl === null) {
        return null
      }
      const { top, left, width, height } = itemEl.getBoundingClientRect()

      return { top, left, width, height }
    }

    if (selectedIds.length === 1) {
      return getItemRect(selectedIds[0])
    }

    const rects: Omit<LayoutRect, 'id'>[] = []

    selectedIds.forEach((id) => {
      const rect = getItemRect(id)

      if (rect !== null) {
        rects.push(rect)
      }
    })

    const top = Math.min(...rects.map((v) => v.top))
    const left = Math.min(...rects.map((v) => v.left))
    const width = Math.max(...rects.map((v) => v.left + v.width)) - left
    const height = Math.max(...rects.map((v) => v.top + v.height)) - top

    return { top, left, width, height }
  }, [container, selectedIds])

  // 绑定鼠标事件支持点击选中
  useLayoutEffect(() => {
    if (readonly || !container) {
      return
    }

    function focusHandler(ev: MouseEvent) {
      // const { target } = ev
      const target = document.elementFromPoint(ev.clientX, ev.clientY)

      if (!target || !container) {
        return
      }

      const hitElem = target.closest('[data-layout-id]')

      if (hitElem === null) {
        dashboard.clearSelection()
        return
      }

      dashboard.selectSingle((hitElem as HTMLElement).dataset.layoutId)
    }

    container.addEventListener('click', focusHandler, true)

    return () => container.removeEventListener('click', focusHandler, true)
  }, [dashboard, readonly, container])

  if (readonly) {
    return
  }

  instanceRef.current.getSelectedBBox = () => {
    return { ...selectedBBox }
  }
}
