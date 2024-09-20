import { useCallback, useEffect, useState } from 'react'
import BoardDemo1 from './demo1'
import { hashByKey } from '@tiny/utils'
import { Layout } from '~/components/tinyBoard/types'
import { Widget, Data } from './util'

import './index.less'

export function Component() {
  const [cacheKey, setCacheKey] = useState('')
  const [caches, setCaches] = useState([])

  const [widgetList, setWidgetList] = useState<Widget[]>([
    { widgetId: 'A', widgetName: '指标卡', widgetType: 'kpi' },
    { widgetId: 'B', widgetName: '文本', widgetType: 'text' },
    { widgetId: 'C', widgetName: '图片', widgetType: 'image' },
    { widgetId: 'D', widgetName: '超链接', widgetType: 'hyperlink' },
    { widgetId: 'E', widgetName: '透视表', widgetType: 'table' },
    { widgetId: 'F', widgetName: '透视表', widgetType: 'table' },
    { widgetId: 'G', widgetName: '透视表', widgetType: 'table' },
    { widgetId: 'H', widgetName: '饼图', widgetType: 'pie' },
    { widgetId: 'I', widgetName: '矩形树图', widgetType: 'treeMap' },
  ])

  const onDragStart = useCallback((ev: React.DragEvent, widget: Widget) => {
    ev.dataTransfer.effectAllowed = 'all'
    ev.dataTransfer.dropEffect = 'move'
    ev.dataTransfer.setData('fixFirefoxDrag', 'true')
    // const image = new Image()
    // img.src = 'img/chart-shadow.png'
    // ev.dataTransfer.setDragImage(img, 100, 60)

    EventBus.emit('WILL_DROP', { data: widget })
  }, [])

  const [drawChartList, setDrawChartList] = useState<string[]>([])

  const onLayoutUpdated = useCallback(
    (data: Layout<Data>[]) => {
      console.log('updated', data)
      setDrawChartList(data.map((item) => item.id))
    },
    [setDrawChartList]
  )

  const saveLocal = () => {
    const cacheKeys = JSON.parse(localStorage.getItem('__caches__') || '[]')
    if (!cacheKeys.includes(cacheKey)) {
      localStorage.setItem('__caches__', JSON.stringify([...cacheKeys, cacheKey]))
    }
    localStorage.setItem(cacheKey, '')
  }

  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem('droppedList') || '[]')

    if (cache) {
      setDrawChartList(cache)
    }
  }, [])

  console.log('drawChartList = ', drawChartList)
  const isDrawn = (widget: Widget): boolean => drawChartList.includes(widget.widgetId)

  const widgetMap = hashByKey(widgetList, 'widgetId')

  return (
    <div className="dashbox abs-fill flex-row">
      <div className="left-side flex-col">
        <div>图层一</div>
        <div>图层二</div>
        <div>图层三</div>
        <ul className="widget-list">
          {widgetList.map((widget) => {
            return (
              <li
                key={widget.widgetId}
                className={`item ${isDrawn(widget) ? 'disabled' : ''}`}
                onDragStart={(ev) => onDragStart(ev, widget)}
                draggable
              >
                {widget.widgetName}
              </li>
            )
          })}
        </ul>
        <hr />
        <div>
          <input type="text" value={cacheKey} onChange={(ev) => setCacheKey(ev.target.value)} />
          <button onClick={saveLocal}>保存</button>

          <ul>
            <li></li>
          </ul>
        </div>
      </div>
      <div className="content-pane flex-auto ova">
        <div style={{ width: '960px' }}>
          <div className="demo">
            <BoardDemo1 widgetMap={widgetMap} />
          </div>
          <div className="demo">
            <BoardDemo1 widgetMap={widgetMap} />
          </div>
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'Dashbox'
