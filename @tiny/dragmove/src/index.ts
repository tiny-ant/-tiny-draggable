type Point = { x: number; y: number }

type StartCallback = (args: {
  /**
   * Shared data among callbacks, the initial value can be set in DragOptions, defaults to an empty object.
   */
  data: Record<string, unknown>
  /**
   * The current mouse event.
   */
  event?: MouseEvent
}) => void

type DragCallback = (args: {
  /**
   * a vector from where mousedown happend to the current mouse point.
   */
  vector: Point
  /**
   * Shared data among callbacks, the initial value can be set in DragOptions, defaults to an empty object.
   */
  data: Record<string, unknown>
  /**
   * indicates the first mouse movement after a `mousedown` event. \
   * If the value is true, it means that no mouse movement events have occurred yet.
   */
  initial: boolean
  /**
   * The current mouse event.
   */
  event: MouseEvent
}) => boolean | void

type EndCallback = DragCallback

type DragOptions = {
  once?: boolean
  capture?: boolean
  data?: Record<string, unknown>
  onStart?: StartCallback
  onMove?: DragCallback
  onEnd?: EndCallback
}

interface DragMoveInstance {
  /**
   * start a dragging manually ( namely, skipping the `mousedown` event ).
   * @param Point The point that indicates where the `mousedown` happend. ( usually the current mouse position )
   */
  start(point: Point): void
  /**
   * remove drag bindings.
   */
  off(): void
}

const zeroPoint: Point = Object.freeze({ x: 0, y: 0 })

function getVector(event: MouseEvent, point: Point): Point {
  return {
    x: event.clientX - point.x,
    y: event.clientY - point.y,
  }
}

/**
 * @param el The target element to bind events on.
 * @param options
 * @description An standard interface util for realizing you custom drag.
 */
export default function DragMove(el: HTMLElement | null, options: DragOptions): DragMoveInstance {
  let dragging: boolean | null = false
  // indicates the first mouse movement after a `mousedown` event.
  let initial = true
  let lastDiff = zeroPoint
  let base = zeroPoint

  const { data = {}, once, capture = false, onMove = () => void 0, onEnd, onStart } = options

  if (typeof onMove != 'function') {
    throw Error('invalid arguments: `options.onMove` should be passed as a function.')
  }

  const dragInstance = {
    off() {
      dragging = null // everything is over ( you can not even manually start the drag )
      document.onselectstart = null
      if (el) {
        el.removeEventListener('mousedown', mouseDownHandler, capture)
      }
      document.removeEventListener('mouseup', mouseUpHandler, capture)
      // should be removed ( if called after mouse down )
      document.removeEventListener('mousemove', mouseMoveHandler, capture)
    },
    start(point: Point) {
      if (dragging === null) {
        return
      }
      if (isNaN(point.x) || isNaN(point.y)) {
        throw Error(
          'parameter error: both `point.x` and `point.y` are expected to be of numeric value.'
        )
      }

      dragging = true
      initial = true
      lastDiff = zeroPoint
      base = point

      if (typeof onStart === 'function') {
        onStart({ data })
      }

      document.addEventListener('mousemove', mouseMoveHandler, capture)
    },
  }

  function mouseMoveHandler(event: MouseEvent) {
    const vector: Point = getVector(event, base)

    event.preventDefault()

    if (initial) {
      if (vector.x === 0 && vector.y === 0) {
        return // mouse not moved
      }
      initial = false
    } else if (lastDiff.x === vector.x && lastDiff.y === vector.y) {
      return
    }

    lastDiff = vector
    onMove({ vector, data, event, initial })
  }

  function mouseDownHandler(event: MouseEvent) {
    if (dragging) {
      return // this may be the case that a manual dragging is in progress.
    }
    if (event.button !== 0) {
      return // only left button is allowed
    }

    dragging = true
    initial = true
    lastDiff = zeroPoint
    base = getVector(event, zeroPoint)

    if (typeof onStart === 'function') {
      onStart({ data, event })
    }

    document.addEventListener('mousemove', mouseMoveHandler, capture)

    // false must be returned to prevent text from being selected
    // also, onselectstart cannot be replaced by `addEventListener('selectstart', fn)`
    document.onselectstart = function fn() {
      return !dragging
    }
  }

  function mouseUpHandler(event: MouseEvent) {
    if (!dragging) {
      return
    }

    if (typeof onEnd === 'function') {
      const vector: Point = getVector(event, base)
      // returning false will keep the drag after `mouseup` happened.
      dragging = onEnd({ vector, data, event, initial }) === false
    } else {
      dragging = false
    }

    if (!dragging) {
      if (once) {
        dragInstance.off()
      } else {
        document.removeEventListener('mousemove', mouseMoveHandler, capture)
      }
    }
  }

  if (el) {
    el.addEventListener('mousedown', mouseDownHandler, capture)
  }
  document.addEventListener('mouseup', mouseUpHandler, capture)

  return dragInstance
}
