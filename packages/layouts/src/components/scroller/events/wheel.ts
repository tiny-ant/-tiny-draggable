import { isXScrollable, isYScrollable } from '../utils'
import type { PointerRecord } from '../interfaces'
import ScrollContainer from '..'
// import type ScrollContainer from '..'

// Normalizing wheel delta

const DELTA_SCALE = {
  STANDARD: 1,
  OTHERS: -3,
}

/**
 * ev.deltaMode: 滚动值的单位
 * DOM_DELTA_PIXEL 0x00 像素
 * DOM_DELTA_LINE	 0x01 行
 * DOM_DELTA_PAGE  0x02 页
 */
const DELTA_MODE = [1.0, 28.0, 500.0]

const getDeltaMode = (mode: number) => DELTA_MODE[mode] || DELTA_MODE[0]

function normalizeDelta(evt: WheelEvent) {
  if ('deltaX' in evt) {
    const mode = getDeltaMode(evt.deltaMode)

    return {
      x: (evt.deltaX / DELTA_SCALE.STANDARD) * mode,
      y: (evt.deltaY / DELTA_SCALE.STANDARD) * mode,
    }
  }

  if ('wheelDeltaX' in evt) {
    return {
      x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
      y: evt.wheelDeltaY / DELTA_SCALE.OTHERS,
    }
  }
  return { x: 0, y: 0 }
}

export default function bindWheelEvent(
  elem: ScrollContainer,
  onMove: (delta: PointerRecord) => void
) {
  // 滚动主方向
  let priorAxis: 'x' | 'y' | undefined
  // （滚动主方向上）是否可以继续滚动
  let scrollable = true
  // 是否正在滚动
  let scrolling = false

  let endTimer: number | undefined

  const { uid } = elem

  /**
   * 连续两次事件触发超过指定的时间间隔则重置滚动状态
   * NOTE! 需要特别注意的两个细节：
   *  1. 滚动事件会持续触发一段时间，滚动到底不意味着不会继续触发事件
   *  2. 事件触发持续时间结束后，不一定滚动到底
   */
  function resetAutoResetTimer() {
    clearTimeout(endTimer)
    endTimer = setTimeout(() => {
      priorAxis = undefined
      scrollable = true
      scrolling = false

      console.log(
        `%c重置 ${ScrollContainer.scrollingId}`,
        'background:red;color:white;font-weight:bold'
      )

      // 如果在一次滑动的连续事件结束之前又滑动了，可能已经在滚动其它容器，所以要加以判断
      if (ScrollContainer.scrollingId === uid) {
        ScrollContainer.scrollingId = null
        // console.log(uid, '结束滚动！！！ 当前滚动：', ScrollContainer.scrollingId)
      }
    }, 200)
  }

  /**
   * 纵向横向双向滚动场景下，如何优化连带父级滚动问题？
   * 交互规则定义：始终优先响应主方向上的滚动需求（滑动方向斜率判断是纵向为主还是横向为主）
   * 即如果是滚动主方向上已经到底，则触发父级（双向）滚动，反之如果次方向上已经滚动到底但是主方向上仍可滚动，则滚动当前容器的主方向
   */
  function wheelHandler(ev: WheelEvent) {
    if (ScrollContainer.scrollingId && ScrollContainer.scrollingId !== uid) {
      console.log('skip', uid)
      return // 其它（父容器）正在滚动
    }

    // 一次滑动动作会连续触发，通过定时器检测结束并重置状态（注意结束时不一定滚动到底）
    resetAutoResetTimer()

    if (!scrolling && !scrollable) {
      return // 一开始就不能滚动更多
    }
    const delta = normalizeDelta(ev)

    if (!scrolling) {
      // 首次触发滚动事件，先阻止父级滚动（因为还不知道当前容器是否滚动到边缘，需要先执行一次）
      priorAxis = Math.abs(delta.x) > Math.abs(delta.y) ? 'x' : 'y'
      console.log('主方向： ', priorAxis, ev)
    }

    if (scrollable) {
      scrollable =
        (priorAxis === 'x' && isXScrollable(elem, delta.x)) ||
        (priorAxis === 'y' && isYScrollable(elem, delta.y))
    }

    if (scrollable) {
      scrolling = true
      ScrollContainer.scrollingId = uid
    }

    // see https://stackoverflow.com/questions/58061066/wheel-event-preventdefault-does-not-cancel-wheel-event
    // 当前容器已经在滚动，阻止父级滚动发生
    if (ScrollContainer.scrollingId === uid) {
      ev.preventDefault() // 阻止父级原生滚动
      ev.stopPropagation() // 阻止父级自定义滚动
    }

    if (!scrollable) {
      // console.log(uid, priorAxis, '到底！！！')
      return
    }

    // 主方向上未滚动到边缘，可以滚动
    // console.log(uid, 'received', delta, ScrollContainer.scrollingId)
    onMove(delta)
  }

  elem.addEventListener('wheel', wheelHandler, { passive: false })
}
