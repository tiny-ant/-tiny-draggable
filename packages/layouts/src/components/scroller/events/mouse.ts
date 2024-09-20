import DragMove from '@tiny/dragmove'
import ScrollContainer from '..'
import { clamp } from '../utils'

/**
 * 滚动条事件处理
 * 1. 滚动条拖拽滚动
 * 2. 滚动槽点击定位
 */
export default function bindMouseClick(
  instance: ScrollContainer,
  container: HTMLElement,
  updateScroll: (position: ScrollToOptions, maxValue: number) => void
) {
  container.parentElement?.addEventListener(
    'mousedown',
    (ev) => {
      const { xScrollBar, yScrollBar } = instance
      const { target, clientX: x, clientY: y } = ev

      if (target === null) {
        return
      }

      if (target === xScrollBar) {
        const autoHide = instance.hasAttribute('auto-hide')
        const trackWidth = xScrollBar.parentElement!.clientWidth
        const scrollbarWidth = xScrollBar.clientWidth
        const maxLeft = trackWidth - scrollbarWidth
        const initialLeft = parseFloat(xScrollBar.style.left || '0')

        // 鼠标按在滚动条上时，如果滚动条设置了自动隐藏，
        // 需要临时移除组件的auto-hide属性以防止拖动过程中鼠标离开容器范围触发滚动条自动隐藏
        // 等鼠标松开后再复原该属性
        if (autoHide) {
          instance.removeAttribute('auto-hide')
        }

        DragMove(xScrollBar, {
          once: true,
          onMove({ vector }) {
            const realLeft = clamp(initialLeft + vector.x, 0, maxLeft)
            updateScroll({ left: realLeft, behavior: 'instant' }, maxLeft)
          },
          onEnd() {
            if (autoHide) {
              instance.setAttribute('auto-hide', 'true')
            }
          },
        }).start({ x, y })
      } else if (target === yScrollBar) {
        const autoHide = instance.hasAttribute('auto-hide')
        const trackHeight = yScrollBar.parentElement!.clientHeight - 2
        const scrollbarHeight = yScrollBar.clientHeight
        const maxTop = trackHeight - scrollbarHeight
        const initialTop = parseFloat(yScrollBar.style.top || '0')

        // 鼠标按在滚动条上时，如果滚动条设置了自动隐藏，
        // 需要临时移除组件的auto-hide属性以防止拖动过程中鼠标离开容器范围触发滚动条自动隐藏
        // 等鼠标松开后再复原该属性
        if (autoHide) {
          instance.removeAttribute('auto-hide')
        }

        DragMove(yScrollBar, {
          once: true,
          onMove({ vector }) {
            const realTop = clamp(initialTop + vector.y, 0, maxTop)
            updateScroll({ top: realTop, behavior: 'instant' }, maxTop)
          },
          onEnd() {
            if (autoHide) {
              instance.setAttribute('auto-hide', 'true')
            }
          },
        }).start({ x, y })
      } else if (target === xScrollBar?.parentElement) {
        const trackWidth = xScrollBar.parentElement.clientWidth - 2
        const scrollbarWidth = xScrollBar.clientWidth
        const maxLeft = trackWidth - scrollbarWidth
        const scrollPercent = ev.offsetX / trackWidth
        const realLeft = scrollPercent * maxLeft

        updateScroll({ left: realLeft, behavior: 'smooth' }, maxLeft)
      } else if (target === yScrollBar?.parentElement) {
        const trackHeight = yScrollBar.parentElement.clientHeight
        const scrollbarHeight = yScrollBar.clientHeight
        const maxTop = trackHeight - scrollbarHeight - 2
        const scrollPercent = ev.offsetY / trackHeight
        const realTop = scrollPercent * maxTop

        updateScroll({ top: realTop, behavior: 'smooth' }, maxTop)
      }
    },
    { passive: true }
  )
}
