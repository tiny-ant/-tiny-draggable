import React, { useState } from 'react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

import './index.less'

interface PanelProps {
  title?: string
  className?: string
  side?: 'left' | 'right'
  defaultExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
}

const iconsMap = {
  left: [MenuUnfoldOutlined, MenuFoldOutlined],
  right: [MenuFoldOutlined, MenuUnfoldOutlined],
}

export default function SidePanel(props: React.PropsWithChildren<PanelProps>) {
  const {
    title = '配置项',
    className = '',
    side = 'right',
    defaultExpanded = true,
    onExpandChange,
    children,
  } = props

  const [expanded, setExpanded] = useState(defaultExpanded)

  const toogleExpanded = () => {
    setExpanded(!expanded)

    if (onExpandChange) {
      onExpandChange(!expanded)
    }
  }

  return (
    <section className={`side-panel ${className} side-${side} ${expanded ? 'show' : 'hidden'}`}>
      <div className="side-panel__title">
        {expanded && <span>{title}</span>}
        <Icon component={iconsMap[side][Number(expanded)]} onClick={toogleExpanded} />
      </div>
      {expanded && <div className="side-panel__content">{children}</div>}
    </section>
  )
}
