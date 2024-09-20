import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createResize } from './resize'
import { getRectStyle, updateRectStyle } from '../../utils'
import type { Dashboard, Plugin, PluginInsBase } from '../../../types'

import './index.less'

/**
 * 尺寸调整框
 */
const ResizerPlugin: Plugin = function plugin(dashboard, viewCtrl) {
  return {
    name: 'Resizer',
    initVisible: true,
    ViewComponent: (props) => {
      const { dashboard } = props
      const charts = dashboard.getSelectedCharts()
      const rectInfo = dashboard.getSelectedChartsCombineRect(charts)

      const [resizing, setResizing] = useState(false)
      const dom = useRef<HTMLDivElement>(null)
      const update = useUpdate()

      const onResizing: Dashboard['getPluginHooks']['onResizing'] = useMemoizedFn((...args) => {
        if (!resizing) {
          setResizing(true)
        }
        dashboard.getPluginHooks.onResizing(...args)
      })
      const onResizeEnd: Dashboard['getPluginHooks']['onResizeEnd'] = useMemoizedFn((...args) => {
        if (resizing) {
          setResizing(false)
        }
        dashboard.getPluginHooks.onResizeEnd(...args)
      })

      // NOTE! 选中图表变化后必须重新计算
      const domEvents = useMemo(
        () =>
          createResize(dashboard, {
            onResizeStart: (...args) => {
              dashboard.getPluginHooks.onResizeStart(...args)
            },
            onResizing,
            onResizeEnd,
          }),
        [dashboard, onResizeEnd, onResizing]
      )

      useEffect(() => {
        function updateStyle() {
          if (!dom.current?.style) {
            return
          }
          const rectInfo = dashboard.getSelectedChartsCombineRect()
          updateRectStyle(dom.current, rectInfo)
        }

        // 显示并更新调整框
        dashboard.addEvent('chartAllChange', updateStyle, 'plugin-resizer')

        return () => {
          dashboard.removeEvent('chartAllChange', null, 'plugin-resizer')
        }
      }, [dashboard])

      useEffect(() => {
        dashboard.addEvent('selectChange', update, 'update-resizer')

        const updateResizer = () => {
          update()
        }

        dashboard.registerPluginHook('updateResizer', updateResizer, 'update-resizer')

        return () => {
          dashboard.removeEvent('selectChange', update, 'update-resizer')
          // TODO: 这里移除不生效，注册的hooks在移除事件时并没有注销
          dashboard.removeEvent('updateResizer', null, 'update-resizer')
        }
      }, [dashboard, update])

      if (rectInfo.width <= 0 && rectInfo.height <= 0) {
        return null
      }

      if (charts.length === 1 && charts[0].features.resizable === false) {
        return null
      }

      return (
        <div ref={dom} className="resizer-rect" style={getRectStyle(rectInfo)}>
          {resizing && (
            <span className="size-info">
              {Math.round(rectInfo.width)} x {Math.round(rectInfo.height)}
            </span>
          )}
          <span className="rz-point rz-t" data-direction="t" {...domEvents} />
          <span className="rz-point rz-r" data-direction="r" {...domEvents} />
          <span className="rz-point rz-b" data-direction="b" {...domEvents} />
          <span className="rz-point rz-l" data-direction="l" {...domEvents} />
          <span className="rz-point rz-tr" data-direction="tr" {...domEvents} />
          <span className="rz-point rz-br" data-direction="br" {...domEvents} />
          <span className="rz-point rz-bl" data-direction="bl" {...domEvents} />
          <span className="rz-point rz-tl" data-direction="tl" {...domEvents} />
        </div>
      )
    },
  } as PluginInsBase
}

export default ResizerPlugin
