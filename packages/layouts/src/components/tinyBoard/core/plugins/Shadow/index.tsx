import React, { useEffect, useState } from 'react'
import { getRectStyle } from '../../utils/index'
import TopModel from '../../model'
import type { LayoutRect, Plugin, PluginInsBase } from '../../types'

import './index.less'

function ShadowRect(props: { id: string; rect: LayoutRect; dashboard: TopModel }) {
  const { id, rect, dashboard } = props
  const [rectInfo, setRectInfo] = useState(rect)

  useEffect(() => {
    const groupId = `shadow-view#${id}`

    dashboard.addEvent(
      'shadowRectChange',
      (chartId, rect) => {
        if (chartId === id) {
          setRectInfo(rect)
        }
      },
      groupId
    )

    return () => {
      dashboard.removeEvent('shadowRectChange', null, groupId)
    }
  }, [])

  return (
    <div
      data-shadow-id={id}
      style={{
        position: 'absolute',
        ...getRectStyle(rectInfo),
      }}
    >
      <div className="box-child" />
    </div>
  )
}

/**
 * 排版指示块图层
 * 什么是指标块：一个虚拟的布局元素块，对应当前交互元素的正确目标位置
 */
const ShadowPlugin: Plugin = function fn(dashboard, viewCtrl) {
  dashboard.registerPluginHook(
    'updateResizer',
    (isDragging) => {
      if (isDragging === undefined) {
        return
      }

      isDragging ? viewCtrl.active() : viewCtrl.inactive()
    },
    'shadow-view'
  )

  return {
    name: 'shadow',
    initVisible: false,
    ViewComponent: (props) => {
      const { dashboard } = props
      const charts = dashboard.getSelectedCharts().filter((chart) => chart.layoutType === 'grid')

      return (
        <>
          {charts.map((chart) => (
            <ShadowRect key={chart.id} id={chart.id} rect={chart.rect} dashboard={dashboard} />
          ))}
        </>
      )
    },
  } as PluginInsBase
}

export default ShadowPlugin
