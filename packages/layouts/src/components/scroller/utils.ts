export function uid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return `${S4()}-${S4()}`
}

export function clamp(value: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, value))
}

export function isScrollable(elem: HTMLElement, delta: { x: number; y: number }) {
  return (
    (delta.x < 0 && elem.scrollLeft > 0) ||
    (delta.y < 0 && elem.scrollTop > 0) ||
    (delta.x > 0 && elem.scrollLeft + elem.clientWidth < elem.scrollWidth) ||
    (delta.y > 0 && elem.scrollTop + elem.clientHeight < elem.scrollHeight)
  )
}

export function isXScrollable(elem: HTMLElement, delta: number) {
  return (
    (delta <= 0 && elem.scrollLeft > 0) ||
    (delta >= 0 && elem.scrollLeft + elem.clientWidth < elem.scrollWidth)
  )
}

export function isYScrollable(elem: HTMLElement, delta: number) {
  return (
    ((delta < 0 || Object.is(delta, -0)) && elem.scrollTop > 0) ||
    ((delta > 0 || Object.is(delta, +0)) && elem.scrollTop + elem.clientHeight < elem.scrollHeight)
  )
}

// function on<E extends keyof DocumentEventMap>(eventName: E, listener: (this: Document, evt: DocumentEventMap[E]) => void) {
//   document.addEventListener(eventName, listener, { passive: true })
// }

// function off<E extends keyof DocumentEventMap>(eventName: E, listener: (this: Document, evt: DocumentEventMap[E]) => void) {
//   document.removeEventListener(eventName, listener)
// }

export default {}
