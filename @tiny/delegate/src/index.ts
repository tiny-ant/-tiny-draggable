const hostKey = Symbol('events')

type HTMLEvents = HTMLElementEventMap[keyof HTMLElementEventMap]

type Handler<T extends HTMLElement = HTMLElement, K extends HTMLEvents = Event> = {
  handler: (this: T, ev: K, element: HTMLElement) => unknown
  selector: string
}
type HostElement<T extends HTMLElement = HTMLElement, K extends HTMLEvents = Event> = T & {
  [hostKey]?: Record<string, Handler<T, K>[]>
}

function before<K extends string>(subject: Record<K, () => unknown>, verb: K, fn: () => unknown) {
  const source = subject[verb]

  subject[verb] = function hooked(...args) {
    fn.apply(subject, args)
    return source.apply(subject, args)
  }
}

function delegateHandler<T extends HTMLElement = HTMLElement, E extends Event = Event>(
  this: HostElement<T>,
  ev: E
) {
  const handlers = this[hostKey] && this[hostKey][ev.type]
  let isPropagationStopped = false
  let isImmediatePropagationStopped = false

  if (!Array.isArray(handlers)) {
    return
  }

  const trackPropagation = () => {
    isPropagationStopped = true
  }

  const trackImmediate = () => {
    isImmediatePropagationStopped = true
  }

  let element: HTMLElement | null = ev.target as HTMLElement

  while (element && element !== this) {
    if (isPropagationStopped || isImmediatePropagationStopped) {
      break
    }
    for (let i = 0, l = handlers.length; i < l; i++) {
      const { handler } = handlers[i]
      const { selector } = handlers[i]

      if (isImmediatePropagationStopped) {
        break // NOTE! 每一次循环都有可能触发事件回调更改冒泡相关变量
      }

      // Note! both styling and event propagation comply with the shadow DOM encapsulation mechanism.
      // there's something important about the `bubbles` and `composed` property of `Event`:
      // 1. dispatching a bubbling event (with `composed: false`) from within a slot't content won't be bleeded into the shadow tree.
      // 2. dispatching a bubbling event (with `composed: false`) from within the shadow tree, the event will stops propagation at the shadow root.
      // 3. a composed event always propagates outside the shadow boundary regardless of whether it is bubbling or not.
      // that is, when thinking about DOM event propagation, bubbles indicates if the event propagates through the parent hierarchy
      // while composed indicates if the event should propagate through the shadow DOM hierarchy.
      // A bubbling and composed event propagates through all the nodes from the dispatched one up to the document root.
      if (element.matches(selector) && this.contains(element)) {
        // 每次都要判断contains，因为每个事件处理函数产生的副作用是未知的
        before(ev, 'stopPropagation', trackPropagation)
        before(ev, 'stopImmediatePropagation', trackImmediate)
        handler.call(this, ev, element)
      }
    }
    element = element.parentElement
  }
}

export function delegate<T extends HTMLElement = HTMLElement, K extends HTMLEvents = Event>(
  el: HostElement<T, K>,
  eventName: keyof HTMLElementEventMap,
  selector: string,
  fn: Handler<T, K>['handler']
) {
  if (typeof fn !== 'function') {
    throw Error('InvalidTypeError: third parameter must be an function')
  }

  const handlerMap = el[hostKey] || (el[hostKey] = {})

  const handlers = handlerMap[eventName] || (handlerMap[eventName] = [])

  if (handlers.length === 0) {
    el.addEventListener(eventName, delegateHandler, false)
  }
  handlers.push({ handler: fn, selector })
}

export function undelegate<T extends HTMLElement = HTMLElement, K extends HTMLEvents = Event>(
  el: HostElement<T, K>,
  eventName: keyof HTMLElementEventMap,
  selector: string,
  fn?: Handler<T, K>['handler']
) {
  const events = el[hostKey] || {}

  if (Array.isArray(events[eventName])) {
    events[eventName] = events[eventName].filter(
      (v) => v.selector !== selector || (fn !== undefined && v.handler !== fn)
    )
    if (events[eventName].length === 0) {
      el.removeEventListener(eventName, delegateHandler, false)
      delete events[eventName]
    }
  }
}

export default {
  delegate,
  undelegate,
}
