import bindMouseClick from './events/mouse'
import { clamp } from './utils'
import type { HTMLAttributes, RefAttributes } from 'react'
import type { ScrollContainerEventMap, ScrollContainerProps, ScrollEvent } from './interfaces'

/** 类型补充 */
interface ScrollContainer {
  // 重定义`scroll`事件
  addEventListener<K extends keyof ScrollContainerEventMap>(
    type: K,
    listener: (this: ScrollContainer, ev: ScrollContainerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof ScrollContainerEventMap>(
    type: K,
    listener: (this: ScrollContainer, ev: ScrollContainerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void
}

// NOTE! ScrollContainer接口在类的实现中就已继承了HTMLElement接口
export interface HTMLScrollContainerElement extends ScrollContainer {}

/** JSX标签类型定义 */
export interface ScrollContainerJSX
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    RefAttributes<HTMLScrollContainerElement>,
    ScrollContainerProps {
  class?: string
  children?: React.ReactNode
}

export { ScrollEvent }

declare global {
  // interface Window {
  //   ScrollContainer: HTMLScrollContainerElement
  // }
  // not needed anymore ?
  // interface HTMLElementTagNameMap {
  //   'scroll-container': ScrollContainer
  // }
  namespace JSX {
    // intrinsic “内在的”、 “固有的”
    interface IntrinsicElements {
      // JSX标签类型支持
      'scroll-container': ScrollContainerJSX
    }
  }
}

const templateContent = `
<style>
  :host {
    display: block;
    --scrollbar-width: 6px;
  }
  :host > .scroll-wrapper {
    position: relative;
    height: 100%;
    background-color: transparent;
    overflow: hidden;
  }
  /* 组件作为单一容器结构，“内壁”必须紧贴外容器 */
  :host > .scroll-wrapper .scroll-content {
    position: absolute;
    /**
     * Generates a block container box, and establishes a new BFC for its contents.
     * This provides a better solution to the most use cases of the "clearfix" hack.
     */
    display: flow-root;
    left: 0;
    right: 0;
    height: 100%;
    overflow: scroll;
  }
  :host > .scroll-wrapper .scroll-content::-webkit-scrollbar {
    appearance: none;
    display: none;
  }

  /** 滚动条样式 **/

  :host > .scroll-wrapper > .scrollbar {
    position: absolute;
    border-radius: 100px;
    // outline: 0.5px solid #e0e0e0;
    background-color: var(--scrollbar-track-color, rgba(232, 232, 232, 0.25));
    cursor: default;
    visibility: visible;
    transition: opacity 0.25s 0.75s ease-out;
    overflow: hidden;
    /* 必须保证滚动条在.scroll-wrapper容器之上 */
    z-index: 1;
  }
  :host([auto-hide]) > .scroll-wrapper > .scrollbar {
    opacity: 0;
  }
  :host([no-track]) > .scroll-wrapper > .scrollbar {
    visibility: hidden;
  }

  :host > .scroll-wrapper:hover > .scrollbar {
    opacity: 1;
    /* 注意 0s 必须带单位 */
    transition: opacity 0.15s 0s ease-in;
  }
  :host > .scroll-wrapper > .scrollbar:hover {
    background-color: var(--scrollbar-track-color-active, rgba(224, 224, 224, 0.35));
  }

  :host > .scroll-wrapper > .scrollbar.scroll-x {
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(var(--scrollbar-width, 8px) + 2px);
  }
  :host > .scroll-wrapper > .scrollbar.scroll-y {
    top: 0;
    right: 0;
    bottom: 0;
    width: calc(var(--scrollbar-width, 8px) + 2px);
  }
  :host > .scroll-wrapper > .scrollbar > .scrollbar-thumb {
    position: absolute;
    margin: 1px;
    border-radius: 100px;
    /* 默认颜色在白色主题和黑色主题下要有明显的区分度 */
    background-color: var(--scrollbar-thumb-color, #565656);
    opacity: 0.75;
    visibility: visible;
  }
  :host > .scroll-wrapper > .scrollbar > .scrollbar-thumb:hover {
    opacity: 1;
  }
  :host > .scroll-wrapper > .scrollbar.scroll-x > .scrollbar-thumb {
    top: 0;
    bottom: 0;
    height: var(--scrollbar-width, 6px);
    width: 90px;
  }
  :host > .scroll-wrapper > .scrollbar.scroll-y > .scrollbar-thumb {
    left: 0;
    right: 0;
    width: var(--scrollbar-width, 6px);
    height: 90px;
  }
  :host > .scroll-wrapper > span.scrollbar.scroll-x:not(:only-of-type) {
    right: calc(var(--scrollbar-width, 6px) + 1px);
  }
  :host > .scroll-wrapper > span.scrollbar.scroll-y:not(:only-of-type) {
    bottom: calc(var(--scrollbar-width, 6px) + 1px);
  }
</style>
<div class="scroll-wrapper">
  <div class="scroll-content" part="container">
    <slot></slot>
  </div>
</div>
`

const template = document.createElement('template')

template.innerHTML = templateContent

class ScrollContainer extends HTMLElement {
  /** 这里的属性默认值赋值均在构造器函数调用之后 */

  #requestFrame: number | undefined

  /** 容器的最大scrollLeft值 */
  #maxScrollLeft = 0

  /** 容器的最大scrollTop值 */
  #maxScrollTop = 0

  readonly #container: HTMLElement

  // TODO: 私有成员
  xScrollBar?: HTMLElement

  yScrollBar?: HTMLElement

  /** 滚动条最小长度 */
  #minSize = 32

  /** 滚动条与内边界间隙 */
  #trackGap = 0

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })

    shadowRoot.appendChild(document.importNode(template.content, true))

    shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => this.update())

    const container = shadowRoot.querySelector<HTMLDivElement>('.scroll-wrapper > .scroll-content')

    if (!container) {
      throw SyntaxError(
        'container not found, this maybe some error in the HTML template of `ScrollContainer`'
      )
    }
    this.#container = container
  }

  static get observedAttributes() {
    return ['auto-hide', 'min-size', 'no-track', 'track-gap', 'offset-x', 'offset-y']
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    // console.log(`[${name}] ${oldVal} => ${newVal}`)
    switch (name) {
      case 'min-size':
        this.#minSize = Math.max(16, Math.round(Number(newVal) || 0))
        break
      case 'track-gap':
        this.#trackGap = clamp(Number(newVal), 0, 5)
        break
      case 'offset-x':
      case 'offset-y':
        break
      default:
    }

    // 跳过初始化
    if (oldVal !== null) {
      this.update()
    }
  }

  connectedCallback() {
    let isInitial = true

    // 初始化时就会自动触发一次，首次应该跳过处理
    const ro = new ResizeObserver((entries) => {
      if (isInitial) {
        isInitial = false
        return
      }
      this.update()
    })

    // 容器尺寸变化时更新滚动条
    ro.observe(this)
    // 滚动内容尺寸变化时更新滚动条
    ro.observe(this.#container)

    const scrollWrapper = this.#container

    scrollWrapper.addEventListener('scroll', () => {
      const left = scrollWrapper.scrollLeft
      const top = scrollWrapper.scrollTop

      const evt = new CustomEvent<ScrollEvent>('scroll', {
        bubbles: false,
        detail: { left, top },
      })
      this.dispatchEvent(evt)
      this.#updateScroll()
    })

    // 绑定滚动槽点击和滚动条拖拽事件
    bindMouseClick(this, this.#container, (pos: ScrollToOptions, maxValue: number) => {
      const scrollPosition: ScrollToOptions = { ...pos }

      if (pos.left !== undefined) {
        scrollPosition.left = (pos.left / maxValue) * this.#maxScrollLeft
      }
      if (pos.top !== undefined) {
        scrollPosition.top = (pos.top / maxValue) * this.#maxScrollTop
      }

      this.scrollTo(scrollPosition)
    })
  }

  disconnectedCallback() {
    console.log('disconnected <scroll-container>')
  }

  /** 更新滚动条状态 */
  update() {
    const {
      clientHeight,
      clientWidth,
      scrollHeight,
      scrollWidth,
      parentElement: wrapper,
    } = this.#container

    if (wrapper === null) {
      return
    }
    console.log('%c更新滚动条', 'background:red;color:white')

    this.#maxScrollLeft = scrollWidth - clientWidth
    this.#maxScrollTop = scrollHeight - clientHeight

    if (this.#maxScrollLeft > 0) {
      let scrollbar: HTMLSpanElement
      let xScrollBar: HTMLSpanElement

      if (!this.xScrollBar) {
        scrollbar = document.createElement('span')
        xScrollBar = document.createElement('span')
        scrollbar.setAttribute('class', 'scrollbar scroll-x')
        xScrollBar.setAttribute('class', 'scrollbar-thumb')

        scrollbar.appendChild(xScrollBar)
        wrapper.appendChild(scrollbar)
        this.xScrollBar = xScrollBar
      } else {
        xScrollBar = this.xScrollBar
        scrollbar = xScrollBar.parentElement!
      }

      const offsetStr = this.getAttribute('offset-x')

      if (offsetStr !== null) {
        const offsets = offsetStr.split(',')

        if (offsets[0]) {
          scrollbar.style.left = `${offsets[0]}px`
        }
        if (offsets[1]) {
          scrollbar.style.right = `${offsets[1]}px`
        }
      }

      scrollbar.style.bottom = `${this.#trackGap}px`
      this.xScrollBar.style.minWidth = `${this.#minSize}px`
    } else if (this.xScrollBar) {
      if (this.xScrollBar.parentNode) {
        wrapper.removeChild(this.xScrollBar.parentNode)
      }
      this.xScrollBar = undefined
    }

    if (this.#maxScrollTop > 0) {
      let scrollbar: HTMLSpanElement
      let yScrollBar: HTMLSpanElement

      if (!this.yScrollBar) {
        scrollbar = document.createElement('span')
        yScrollBar = document.createElement('span')
        scrollbar.setAttribute('class', 'scrollbar scroll-y')
        yScrollBar.setAttribute('class', 'scrollbar-thumb')

        scrollbar.appendChild(yScrollBar)
        wrapper.appendChild(scrollbar)
        this.yScrollBar = yScrollBar
      } else {
        yScrollBar = this.yScrollBar
        scrollbar = yScrollBar.parentElement!
      }
      const offsetStr = this.getAttribute('offset-y')

      if (offsetStr !== null) {
        const offsets = offsetStr.split(',')

        if (offsets[0]) {
          scrollbar.style.top = `${offsets[0]}px`
        }
        if (offsets[1]) {
          scrollbar.style.bottom = `${offsets[1]}px`
        }
      }
      scrollbar.style.right = `${this.#trackGap}px`
      this.yScrollBar.style.minHeight = `${this.#minSize}px`
    } else if (this.yScrollBar) {
      if (this.yScrollBar.parentNode) {
        wrapper.removeChild(this.yScrollBar.parentNode)
      }
      this.yScrollBar = undefined
    }

    if (this.xScrollBar) {
      const trackWidth = this.xScrollBar.parentElement!.clientWidth
      this.xScrollBar.style.width = `${(trackWidth * clientWidth) / scrollWidth}px`
    }
    if (this.yScrollBar) {
      let trackHeight = this.yScrollBar.parentElement!.clientHeight
      this.yScrollBar.style.height = `${(trackHeight * clientHeight) / scrollHeight}px`
    }
  }

  #updateScroll() {
    if (this.#requestFrame) {
      cancelAnimationFrame(this.#requestFrame)
    }
    this.#requestFrame = requestAnimationFrame(() => {
      this.#requestFrame = undefined

      const { xScrollBar, yScrollBar } = this
      const { scrollLeft: sx, scrollTop: sy } = this.#container

      if (sx !== undefined && xScrollBar !== undefined) {
        const trackWidth = xScrollBar.parentElement!.clientWidth
        const scrollbarWidth = xScrollBar.clientWidth
        const maxLeft = trackWidth - scrollbarWidth

        xScrollBar.style.left = `${(sx / this.#maxScrollLeft) * maxLeft}px`
      }
      if (sy !== undefined && yScrollBar !== undefined) {
        const trackHeight = yScrollBar.parentElement!.clientHeight
        const scrollbarHeight = yScrollBar.clientHeight
        const maxTop = trackHeight - scrollbarHeight

        yScrollBar.style.top = `${(sy / this.#maxScrollTop) * maxTop}px`
      }
    })
  }

  scrollTo(options?: ScrollToOptions): void
  scrollTo(x: number, y: number): void
  scrollTo(arg1?: number | ScrollToOptions, arg2?: number): void {
    if (typeof arg1 === 'number' && typeof arg2 === 'number') {
      this.#container.scrollTo(arg1, arg2)
      this.#updateScroll()
      return
    }

    this.#container.scrollTo(arg1 as ScrollToOptions)
    this.#updateScroll()
  }

  scrollBy(options?: ScrollToOptions): void
  scrollBy(x: number, y: number): void
  scrollBy(arg1?: number | ScrollToOptions, arg2?: number): void {
    if (typeof arg1 === 'number' && typeof arg2 === 'number') {
      this.#container.scrollBy(arg1, arg2)
      this.#updateScroll()
      return
    }
    this.#container.scrollBy(arg1 as ScrollToOptions)
    this.#updateScroll()
  }

  get scrollTop() {
    return this.#container.scrollTop
  }

  set scrollTop(value: number) {
    this.#container.scrollTop = value
    this.#updateScroll()
  }

  get scrollLeft() {
    return this.#container.scrollLeft
  }

  set scrollLeft(value: number) {
    this.#container.scrollLeft = value
    this.#updateScroll()
  }

  // 必须改写，margin折叠之类的会导致计算错误
  get scrollHeight() {
    return this.#container.scrollHeight
  }

  // 必须改写，margin折叠之类的会导致计算错误
  get scrollWidth() {
    return this.#container.scrollWidth
  }
}

// support hmr
if (!customElements.get('scroll-container')) {
  customElements.define('scroll-container', ScrollContainer)
}

export default ScrollContainer
