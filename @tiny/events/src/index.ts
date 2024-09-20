// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (...args: any[]) => void

export default class EventBus<Events extends Record<string, Handler> = Record<string, Handler>> {
  // 利用set的唯一性，当绑定事件名和回调函数均相同时，重复监听只会订阅一次（但是同一个函数引用可多次绑定不同的事件）
  private $events: Map<keyof Events, Set<Handler>> = new Map()
  private $marker: Map<keyof Events, Set<Handler>> = new Map()

  on<EventName extends keyof Events>(eventName: EventName, handler: Events[EventName]) {
    let set = this.$events.get(eventName)

    if (!set) {
      set = new Set()
      this.$events.set(eventName, set)
    }

    set.add(handler)

    // 如果之前已经单次绑定，取消单次绑定标记
    const marker = this.$marker.get(eventName)

    if (marker && marker.has(handler)) {
      marker.delete(handler)
    }
  }

  /**
   * 清除所有事件监听
   */
  off(): void
  /**
   * 清除某个事件名下的所有监听
   * @param eventName 事件名
   */
  off<EventName extends keyof Events>(eventName: EventName): void
  /**
   * 清除指定事件名下绑定的某个监听函数
   * @param name 事件名
   * @param handler 事件处理函数
   */
  off<EventName extends keyof Events>(eventName: EventName, handler: Events[EventName]): void

  off<EventName extends keyof Events>(eventName?: EventName, handler?: Events[EventName]): void {
    const events = this.$events
    const marker = this.$marker

    if (eventName === undefined) {
      events.clear()
      marker.clear()
      return
    }

    if (handler === undefined) {
      events.delete(eventName)
      marker.delete(eventName)
      return
    }

    // name 和 handler 都传了，则清除指定handler
    const handlers = events.get(eventName)
    const markers = marker.get(eventName)

    if (handlers) {
      handlers.delete(handler)

      if (handlers.size === 0) {
        events.delete(eventName)
      }
    }
    if (markers) {
      markers.delete(handler)

      if (markers.size === 0) {
        marker.delete(eventName)
      }
    }
  }

  once<EventName extends keyof Events>(eventName: EventName, handler: Events[EventName]) {
    // 有bug，因为内部每次都是不同的函数实例，导致同一个函数可重复绑定，这与on的行为有所不同
    // const once: typeof handler = (...args) => {
    //   this.off(eventName, once)
    //   handler(...args)
    // }
    // this.on(eventName, once)

    // 还是有bug，因为同一个函数可绑定到不同的事件名，在另一个事件名绑定中可能不是单次绑定
    // handler.once = true
    // this.on(eventName, handler)

    this.on(eventName, handler)

    let set = this.$marker.get(eventName)

    if (!set) {
      set = new Set()
      this.$marker.set(eventName, set)
    }

    set.add(handler)
  }

  emit<EventName extends keyof Events>(
    eventName: EventName,
    ...args: Parameters<Events[EventName]>
  ) {
    const handlers = this.$events.get(eventName)
    const markers = this.$marker.get(eventName) || new Set()

    if (handlers) {
      handlers.forEach((handler) => {
        handler(...args)

        if (markers.has(handler)) {
          markers.delete(handler)
          handlers.delete(handler)
        }
      })
    }
  }
}
