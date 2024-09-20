import { useRef, useState, useEffect } from 'react'
import { BoardInstance, Layout, LayoutId, SizeLimit } from '~/components/tinyBoard/types'
import usePersistFn from '~/components/tinyBoard/hooks/usePersistFn'
import TinyBoard, { BoardExport } from './components/TinyBoard'
import Chart from './components/Chart'
import makeChartDataByWidget, { Widget, Data } from './util'

import './index.less'

interface Props {
  widgetMap: Record<string, Widget>
}

const BoardDemo1 = ({ widgetMap }: Props) => {
  const [data, setData] = useState<Layout<Data>[]>([])
  const [editable, setEditable] = useState(true)

  const getWidgetTypeById = (id: LayoutId) => {
    const item = data.find((item) => item.id === id)

    console.log('item = ', item)
    return (item && item.data.type) || ''
  }

  const setSizeLimitById = (id: LayoutId): SizeLimit => {
    const widgetType = getWidgetTypeById(id)
    switch (widgetType) {
      case 'text':
        return [150, 50]
      case 'image':
        return [24, 24]
      case 'filterGroup':
        return [100, 24]
      case 'hyperlink':
        return [150, 50, 640, 160]
      default:
    }

    // TODO: 最小尺寸要根据栅格数计算。如果没有配置栅格支持怎么办？如何通用（栅格为可选配置）
    return [160, 90]
  }

  const board = useRef<BoardExport<Data> | null>(null)

  const boardOptions = {
    setSizeLimitById,
    layerId: 'content',
    async onDrop(event: MouseEvent, layout: Layout<Data>): Promise<boolean> {
      const { data } = layout

      if (!editable) {
        return false
      }
      if (['tab', 'container'].includes(data.type)) {
        return false
      }
      if (data.type === 'link') {
        return new Promise((resolve) => {
          EventBus.emit('ON_DROP_IN_LINK_PAGE', {
            onSubmit: (url: string) => {
              Object.assign(data, { url })
              resolve(true)
            },
            onCancel: () => resolve(false),
          })
        })
      }
      return true
    },
    onDragStart(ev: MouseEvent) {
      const target = ev.target as HTMLElement

      if (!editable) {
        return false
      }
      const container = target.closest('.tiny-rect')

      if (!container) {
        return false // fix: 联动弹窗报错
      }

      return true
    },
    onResizeStart() {
      return editable
    },
    // onResize(ev: MouseEvent, item: Layout<Data>) {
    //   console.log('resizing', ev, item)
    // },
    onLayoutUpdated(data: Layout<Data>[]) {
      console.log('uppppppppp', data)
      setData(data)
    },
  }

  // 在dragEnter事件触发之前须设置好拖拽数据
  useEffect(() => {
    const getDefaultSizeForType = (widgetType: string): [number, number] => {
      const width = board.current?.container?.getBoundingClientRect().width || 300

      switch (widgetType) {
        case 'text':
          return [360, 350]
        case 'image':
          return [240, 320]
        case 'filterGroup':
          return [800, 64]
        case 'kpi':
          return [240, 90]
        case 'hyperlink':
          return [300, 42]
        case 'filterbar': {
          return [width, 85]
        }
        default:
      }
      return [480, 320]
    }

    function prepareDrop(args: { data: Widget }) {
      if (args.data) {
        const widget = args.data
        const [width, height] = getDefaultSizeForType(widget.widgetType)
        const chartData = makeChartDataByWidget(widget)
        console.log(`[prepare] size for ${widget.widgetType}:`, width, height, board.current)
        board.current?.prepareDrop(chartData, { width, height })
      }
    }
    EventBus.on('WILL_DROP', prepareDrop)

    return () => EventBus.off('WILL_DROP', prepareDrop)
  }, [])

  const saveLocal = usePersistFn(() => {
    localStorage.setItem('cacheWidgets', JSON.stringify(data))
    localStorage.setItem('droppedList', JSON.stringify(data.map((item) => item.id)))
  })

  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem('cacheWidgets') || '[]')

    if (cache) {
      setData(cache)
    }
    window.addEventListener('beforeunload', saveLocal)
    return () => {
      window.removeEventListener('beforeunload', saveLocal)
    }
  }, [])

  // 处理图表删除
  useEffect(() => {
    function removeChartItem(chartId: string) {
      board.current?.removeItem(chartId)
    }
    EventBus.on('REMOVE_CONTAINER_CHART', removeChartItem)

    return () => EventBus.off('REMOVE_CONTAINER_CHART', removeChartItem)
  }, [])

  // 监听图片上传调整尺寸
  useEffect(() => {
    function showImageChart(chartId: string, url: string) {
      const img = new Image()
      img.src = url

      img.onload = () => {
        if (!board.current || !board.current.container) {
          return
        }
        const width = board.current.container.getBoundingClientRect().width
        const { naturalWidth, naturalHeight } = img
        const resizedWidth = Math.min(width, naturalWidth)
        const scaleRatio = resizedWidth / naturalWidth
        const resizedHeight = scaleRatio * naturalHeight

        // console.log(resizedWidth, ' x ', resizedHeight);
        board.current.updateItem(chartId, { width: resizedWidth, height: resizedHeight }, { url })
      }
    }
    EventBus.on('CONTAINER_IMAGE_UPLOADED', showImageChart)

    return () => EventBus.off('CONTAINER_IMAGE_UPLOADED', showImageChart)
  }, [])

  // 老的tab图表样式兼容
  // useEffect(() => {
  // const { width, height } = instance.getBounds(true)
  // const fullRect = { id: null, top: 0, left: 0, width, height, right: width, bottom: height }

  // 这里data数组，但对老数据来说其实只有一个元素
  // if (editable) {
  //   data.forEach(chart => {
  //     if (!chart.style || chart.style.paddingTop === undefined) {
  //       instance.activateLayout(chart.id); // 必须指定id
  //       instance.updateLayoutItem(chart.id, fullRect);
  //       instance.commitLayout(); // 这里不能指定id
  //     }
  //   });
  // }
  // }, [instance, editable])

  // const onRemove = useCallback(
  //   (id: LayoutId) => {
  //     instance.removeLayoutItem(id);
  //   },
  //   [instance]
  // );

  return (
    <TinyBoard
      ref={board}
      data={data}
      {...boardOptions}
      renderItem={(item: Layout<Data>, instance: BoardInstance<Data>) => (
        <Chart
          widget={widgetMap[item.id] || { widgetId: item.id }}
          onRemove={instance.removeLayoutItem}
        />
      )}
    />
  )
}

export default BoardDemo1
