import { Layout, InstanceRef, PluginHooks } from '../types'

export default function useAutoExpand<T>(instanceRef: InstanceRef<T>, hooks: PluginHooks<T>): void {
  const { onLayoutUpdated } = hooks

  hooks.onLayoutUpdated = (data: Layout<T>[]) => {
    onLayoutUpdated(data)
    const bounds = instanceRef.current.getBounds()
    // TODO: 这里依赖于具体的存储格式，需改成通用处理
    const bottomValues = data.map(
      ({ style }) => parseFloat(String(style.marginTop)) + parseFloat(String(style.paddingTop))
    )
    if (bottomValues.length === 0) {
      return // otherwise Math.max() will be -Infinity
    }
    const maxBottom = Math.max(...bottomValues)
    let containerHeight = (bounds.width * maxBottom) / 100

    if (containerHeight > bounds.height && containerHeight - bounds.height < 5) {
      containerHeight = bounds.height
    }

    requestAnimationFrame(() => {
      const container = instanceRef.current.getContainer()

      if (container) {
        container.style.height = `${containerHeight}px`
      }
    })
  }
}
