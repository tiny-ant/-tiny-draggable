import { useCallback, useEffect, useRef, useState } from 'react'
import { delegate, undelegate } from '@tiny/delegate'
import DragMove from '@tiny/dragmove'

interface Props {
  columnLines: number[]
  onResize(colIndex: number, width: number): void
  slot?: string
}

function inRange(n: number, a: number, b: number) {
  return n >= a && n <= b
}

export default function ColumnResizer(props: Props) {
  const { columnLines, onResize, slot } = props

  const rootNode = useRef<HTMLDivElement | null>(null)
  const [left, setLeft] = useState<number>(NaN)
  const resizeCallback = useRef(onResize)
  const lines = useRef(columnLines)

  resizeCallback.current = onResize
  lines.current = columnLines

  const resizeColumn = useCallback((ev: MouseEvent) => {
    const element = rootNode.current?.parentElement

    if (!element) {
      return
    }

    const boundLeft = element.getBoundingClientRect().left
    const scrollEl = element.closest('scroll-container,table-layout')

    if (!scrollEl) {
      return
    }
    const target = ev.target as HTMLElement
    const isFixedCell = target.classList.contains('x-header')
    const scrollLeft = isFixedCell ? 0 : scrollEl.scrollLeft
    const hitX = ev.clientX - boundLeft + scrollLeft + 1
    const lineIndex = lines.current.findIndex((x) => inRange(hitX - x, -2, +2))

    // 判断是否点击在左右边线附近
    if (lineIndex === -1) {
      return
    }
    ev.preventDefault()

    const colIndex = lineIndex - 1
    const colEnd = lines.current[lineIndex]
    const colWidth = colEnd - lines.current[lineIndex - 1]
    const cache = { lastPos: colEnd - scrollLeft - 1 }
    setLeft(cache.lastPos)
    scrollEl.classList.add('resizing')

    DragMove(element, {
      once: true,
      data: cache,
      onMove({ vector, data }) {
        requestAnimationFrame(() => {
          const scrollLeft = isFixedCell ? 0 : scrollEl.scrollLeft
          const linePos = lines.current[lineIndex] - scrollLeft - 1

          if (data.lastPos !== linePos) {
            rootNode.current!.style.left = `${linePos}px`
            data.lastPos = linePos
          }
        })
        resizeCallback.current(colIndex, colWidth + vector.x)
      },
      onEnd() {
        setLeft(NaN)
        scrollEl.classList.remove('resizing')
      },
    }).start({ x: ev.clientX, y: ev.clientY })
  }, [])

  useEffect(() => {
    const element = rootNode.current?.parentElement

    if (!element) {
      return
    }

    delegate(element, 'mousedown', '.t-cell.y-header', resizeColumn)

    return () => {
      undelegate(element, 'mousedown', '.t-cell.y-header', resizeColumn)
    }
  }, [resizeColumn])

  if (isNaN(left)) {
    return <div ref={rootNode} slot={slot} />
  }

  return <div ref={rootNode} slot={slot} className="column-resizer" style={{ left }} />
}
