import { guid, Layout } from '~/components/tinyBoard'

export type Widget = {
  widgetId: string
  widgetName: string
  widgetType: string
  style?: React.CSSProperties
  [props: string]: any
}

export type Data = {
  id?: string
  type: 'chart' | 'filterGroup' | 'image' | 'text' | 'hyperlink' | 'link' | 'tab' | 'container'
  url?: string
  name?: string
  [props: string]: unknown
}

export default function makeChartDataByWidget(widget: Widget): Pick<Layout<Data>, 'id' | 'data'> {
  let data: Data

  // TODO: 这里没有区分细分类型处理，待重构
  if (widget.widgetType === 'hyperlink') {
    // 超链接
    const { widgetType, ...hyperlinkData } = widget

    data = { type: widgetType, hyperlinkData }
  } else if (widget.widgetType === 'link' || widget.widgetType === 'image') {
    // 只有图片和外链类型有URL
    data = {
      name: widget.name,
      type: widget.widgetType,
      url: widget.url,
    }
  } else if (widget.widgetType === 'tab' || widget.widgetType === 'container') {
    data = {
      type: widget.widgetType,
      name: widget.name,
    }
  } else if (widget.widgetType === 'filterGroup') {
    data = {
      type: widget.widgetType,
    }
  } else {
    data = {
      type: 'chart',
    }
  }

  const id = data.type === 'chart' ? widget.widgetId : guid()

  return { id, data }
}

export function randrange(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min
}

export function randomColor(rgb: { r?: number; g?: number; b?: number; a?: number } = {}) {
  const { a = 1 } = rgb
  const r = rgb.r || randrange(0, 255)
  const g = rgb.g || randrange(0, 255)
  const b = rgb.b || randrange(0, 255)

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
