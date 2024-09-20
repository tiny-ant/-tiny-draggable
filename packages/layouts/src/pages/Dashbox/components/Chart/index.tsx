import { useState } from 'react'
import { Icon } from 'ink'
import { Widget, randomColor } from '../../util'

import './index.less'

interface Props {
  widget: Widget
  onRemove(id: string): void
}

export default function ChartItem(props: Props) {
  const { widget, onRemove } = props

  const [bgColor] = useState(randomColor({ a: 0.5 }))

  // const handleChartCommand = useCallback((command, ...args) => {
  //   switch (command) {
  //     default:
  //   }
  // }, []);

  const { widgetId: id, widgetName, widgetType } = widget

  return (
    <div className={`chart-box-wrap ${widgetType}`} style={{ backgroundColor: bgColor }}>
      <div className="chart-box-header">
        <div className="widget-operation">
          <div className="widget-action">
            <Icon name="close" className="fr" onClick={() => onRemove(id)} />
          </div>
        </div>
        {id}: {widgetName}
      </div>
      <div className="chart-box">
        <div className="chart-box-inner">图表内容</div>
      </div>
    </div>
  )
}
