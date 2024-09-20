import React, { useCallback, useRef, useState } from 'react'
import DragMove from '@tiny/dragmove'

import './index.less'

type Props = {
  className?: string
  width?: number
  height?: number
  children: React.ReactElement
}

export default function (props: React.PropsWithChildren<Props>) {
  const { className = '', width, height } = props
  const children = React.Children.only(props.children)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = useState({
    width,
    height,
  })

  const onMouseDown = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const container = containerRef.current

    if (!container) {
      return
    }
    event.stopPropagation() // prevent dragging or any other actions

    const { clientX: x, clientY: y } = event

    DragMove(null, {
      once: true,
      onStart({ data }) {
        let { width, height } = style

        if (!width || !height) {
          const style = getComputedStyle(container)
          width = parseFloat(style.width)
          height = parseFloat(style.height)
        }
        console.log(width, height)
        data.width = width
        data.height = height
      },
      onMove: ({ data, vector }) => {
        setStyle({ width: data.width + vector.x, height: data.height + vector.y })
      },
    }).start({ x, y })
  }, [])

  return (
    <div
      className={`resizable ${className}`}
      ref={containerRef}
      style={{ position: 'relative', ...style }}
    >
      {children}
      <div className="resize-handle" onMouseDown={onMouseDown}>
        <span></span>
      </div>
    </div>
  )
}
