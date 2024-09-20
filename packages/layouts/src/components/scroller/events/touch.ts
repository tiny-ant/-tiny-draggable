export type PointerRecord = {
  x: number
  y: number
  t: number
}

export type PointerActionCallbacks = {
  onMove(delta: PointerRecord): void
  onEnd(delta: PointerRecord): void
}

function getValue(ev: MouseEvent | Touch) {
  // TODO t = e.timestamp ?
  return { x: ev.clientX, y: ev.clientY, t: Date.now() }
}

function diffValue(a: PointerRecord, b: PointerRecord): PointerRecord {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    t: a.t - b.t,
  }
}

export default function bindTouchEvents(
  elem: HTMLElement,
  { onMove, onEnd }: PointerActionCallbacks
) {
  let scrolling = false
  let start: PointerRecord = { x: 0, y: 0, t: 0 }
  let touchId: number | null = null

  // TODO: 如果向下滑动再向上快速滑动后放开，这里监测到的滑动相对距离不对，最终计算出的速度可能太慢
  function trackPointerData(touch: Touch) {
    const last = getValue(touch)
    return diffValue(last, start)
  }

  function resetValue() {
    touchId = null
    start = { x: 0, y: 0, t: 0 }
  }

  function onTouchMove(ev: TouchEvent) {
    if (!scrolling && sharedScrollState.scrolling) {
      return // 子容器正在滚动
    }
    // touch of the other finger
    if (ev.targetTouches[0].identifier !== touchId) {
      return
    }

    const delta = trackPointerData(ev.changedTouches[0])

    if (isScrollable(elem, delta)) {
      scrolling = true
      sharedScrollState.scrolling = true
      onMove(delta)
    } else {
      sharedScrollState.scrolling = false
    }
  }

  function onTouchEnd(ev: TouchEvent) {
    const touch = ev.changedTouches[0]

    // targetTouches is empty in touchEnd, therefore take a changedTouches
    if (touch.identifier !== touchId) {
      return
    }

    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
    const delta = trackPointerData(touch)

    if (scrolling) {
      onEnd(delta)
    }
    resetValue()
  }

  elem.addEventListener(
    'touchstart',
    (ev) => {
      const touch = ev.changedTouches[0]

      console.log(ev)

      if (ev.touches.length !== 1) {
        return
      }
      ev.preventDefault()

      resetValue()

      start = getValue(touch)

      touchId = touch.identifier

      document.addEventListener('touchmove', onTouchMove, { passive: true })
      document.addEventListener('touchend', onTouchEnd, { passive: true })
    },
    false
  )
}
