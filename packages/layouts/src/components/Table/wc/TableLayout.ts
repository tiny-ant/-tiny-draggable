import DragMove from '@tiny/dragmove'
import type { HTMLAttributes, RefAttributes } from 'react'
import type { HTMLScrollContainerElement } from '~/components/scroller'

interface TableLayoutProps {
  width: number
  height: number
  'scroller-offset'?: number | `${number}` | `${number},${number}`
}

export interface HTMLTableLayoutElement extends TableLayout {}

export interface TableLayoutJSX
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
    RefAttributes<HTMLTableLayoutElement>,
    TableLayoutProps {
  class?: string
  children?: React.ReactNode
}

declare global {
  // interface Window {
  //   TableLayout: HTMLTableLayoutElement
  // }
  namespace JSX {
    interface IntrinsicElements {
      'table-layout': TableLayoutJSX
    }
  }
}

const templateContent = `
<style>
  :host {
    display: block;
    position: relative;
    height: 100%;
    /** 允许给表格添加边框 **/
    box-sizing: border-box;
    border: 1px solid var(--border-color, #E9E9E9);
    color: var(--text-color, #fff);
    overflow: hidden;
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

  /** 滚动条样式 **/

  :host > .scroll-wrapper .scroll-content::-webkit-scrollbar {
    appearance: none;
    display: none;
  }

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

  :host .scroll-maker {
    position: absolute;
  }

  :host .table-layout {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas: "corner head" "left body";
  }

  :host .table-layout__head {
    position: relative;
    grid-area: head;
    overflow: hidden;
    z-index: 1;
  }

  :host .table-layout__left {
    position: relative;
    grid-area: left;
    overflow: hidden;
    z-index: 1;
  }

  :host .table-layout__corner {
    position: relative;
    grid-area: corner;
    overflow: hidden;
    z-index: 1;
  }

  :host .scroll-shadow {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background: transparent;
    pointer-events: none;
    z-index: 1;
  }
  :host .scroll-shadow.scrolled {
    box-shadow: 6px 0 12px rgba(64, 64, 64, 0.15);
  }

  :host .table-layout__body {
    position: relative;
    grid-area: body;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
</style>
<div class="scroll-wrapper">
  <div class="scroll-content" part="container">
    <div class="scroll-maker"></div>
    <div class="table-layout">
      <div class="table-layout__corner">
        <slot name="corner"></slot>
      </div>
      <div class="table-layout__head head-scroll">
        <div style="height: 100%">
          <slot name="head"></slot>
        </div>
      </div>
      <div class="table-layout__left">
        <div>
          <slot name="left"></slot>
        </div>
      </div>
      <div class="table-layout__body">
        <div>
          <slot></slot>
        </div>
      </div>
      <div class="scroll-shadow"></div>
      <slot name="extra"></slot>
    </div>
  </div>
</div>
`

const template = document.createElement('template')

template.innerHTML = templateContent

function clamp(value: number, lower: number, upper: number) {
  return Math.max(lower, Math.min(upper, value))
}

class TableLayout extends HTMLElement {
  /** 这里的属性默认值赋值均在构造器函数调用之后 */

  readonly #container: HTMLElement

  #requestFrame: number | undefined

  #width = 0

  #height = 0

  #scrollerOffset = [0, 0]

  // TODO: 私有成员
  xScrollBar?: HTMLElement

  yScrollBar?: HTMLElement

  /** 容器的最大scrollLeft值 */
  #maxScrollLeft = 0

  /** 容器的最大scrollTop值 */
  #maxScrollTop = 0

  /** 滚动条最小长度 */
  #minSize = 32

  /** 滚动条与内边界间隙 */
  #trackGap = 0

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })

    shadowRoot.appendChild(document.importNode(template.content, true))

    const container = shadowRoot.querySelector<HTMLScrollContainerElement>('.scroll-content')

    if (!container) {
      throw SyntaxError(
        'container not found, this maybe some error in the HTML template of <table-layout>'
      )
    }
    this.#container = container
  }

  static get observedAttributes() {
    // TODO: show-scrollbar= allways | scrolling | hover
    return ['width', 'height', 'fit-width', 'scroller-offset', 'auto-hide', 'no-track', 'track-gap']
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    console.log(`[${name}] ${oldVal} => ${newVal}`)

    switch (name) {
      case 'fit-width':
        if (newVal !== null) {
          this.style.cssText = 'width: 100%'
        } else {
          this.style.cssText = 'max-width: 100%'
        }
        return
      case 'track-gap':
        this.#trackGap = clamp(Number(newVal), 0, 5)
        return
      case 'width':
        this.#width = Math.round(Number(newVal))
        break
      case 'height':
        this.#height = Math.round(Number(newVal))
        break
      case 'scroller-offset':
        if (newVal !== null) {
          const offsets = newVal.split(',')
          this.#scrollerOffset = [
            Math.round(Number(offsets[0])) || 0,
            Math.round(Number(offsets[1])) || 0,
          ]
        }
        break
      default:
    }

    // 跳过初始化
    if (oldVal !== null) {
      this.update()
    }
  }

  connectedCallback() {
    const container = this.#container

    setTimeout(() => {
      // MDN doc https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/slotchange_event
      Array.from(container.querySelectorAll('slot')).map((slot) => {
        slot.addEventListener('slotchange', () => {
          console.log('slot changed')

          this.update()
        })
      })
    })

    // let isInitial = true

    // 初始化时就会自动触发一次，首次应该跳过处理
    const ro = new ResizeObserver((entries) => {
      // if (isInitial) {
      //   isInitial = false
      //   return
      // }
      this.update()
    })
    // 滚动容器尺寸变化时更新滚动条
    ro.observe(container.parentElement!)
    // 滚动内容尺寸变化时更新滚动条
    ro.observe(container)

    /** 监听scroll事件同步滚动表格行和列 */
    const headElement = container.querySelector<HTMLDivElement>('.table-layout__head')!
    const leftElement = container.querySelector<HTMLDivElement>('.table-layout__left')!
    const bodyElement = container.querySelector<HTMLDivElement>('.table-layout__body')!
    const shadowElement = container.querySelector<HTMLDivElement>('.scroll-shadow')!
    let leftScrolled = false

    container.addEventListener('scroll', () => {
      const left = container.scrollLeft
      const top = container.scrollTop

      headElement.scrollLeft = left
      leftElement.scrollTop = top
      bodyElement.scrollLeft = left
      bodyElement.scrollTop = top

      if (leftScrolled) {
        if (left === 0) {
          leftScrolled = false
          shadowElement.classList.remove('scrolled')
        }
      } else if (left > 25) {
        shadowElement.classList.add('scrolled')
        leftScrolled = true
      }
      this.#updateScrollbar()
    })

    /** 更新容器滚动位置，同时更新滚动条显示位置 */
    const updateScroll = (pos: ScrollToOptions, maxValue: number) => {
      const scrollPosition: ScrollToOptions = { ...pos }

      if (pos.left !== undefined) {
        scrollPosition.left = (pos.left / maxValue) * this.#maxScrollLeft
      }
      if (pos.top !== undefined) {
        scrollPosition.top = (pos.top / maxValue) * this.#maxScrollTop
      }

      this.#container.scrollTo(scrollPosition)
      this.#updateScrollbar()
    }

    const instance = this

    /** 事件绑定: 滚动槽点击 + 滚动条拖拽 */
    this.#container.parentElement?.addEventListener(
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

  disconnectedCallback() {
    console.log('disconnected <table-layout>')
  }

  #updateScrollbar() {
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

  update() {
    const { shadowRoot } = this

    if (shadowRoot === null) {
      return
    }
    console.log('%c更新 <table-layout>', 'color: blue')

    const scrollerOffset = this.#scrollerOffset
    const offsetLeft = `${scrollerOffset[0]}px`
    const offsetTop = `${scrollerOffset[1]}px`
    const bodyWidth = `${this.#width - scrollerOffset[0]}px`
    const bodyHeight = `${this.#height - scrollerOffset[1]}px`

    const scrollMaker = shadowRoot.querySelector<HTMLDivElement>('.scroll-maker')!
    const wrapperElement = shadowRoot.querySelector<HTMLDivElement>('.table-layout')!
    const headElement = shadowRoot.querySelector<HTMLDivElement>('.table-layout__head > div')!
    const leftElement = shadowRoot.querySelector<HTMLDivElement>('.table-layout__left > div')!
    const bodyElement = shadowRoot.querySelector<HTMLDivElement>('.table-layout__body > div')!
    const shadowElement = shadowRoot.querySelector<HTMLDivElement>('.scroll-shadow')!

    scrollMaker.style.width = `${this.#width}px`
    scrollMaker.style.height = `${this.#height}px`
    wrapperElement.style.gridTemplateColumns = `${offsetLeft} auto`
    wrapperElement.style.gridTemplateRows = `${offsetTop} auto`
    headElement.style.width = bodyWidth
    leftElement.style.height = bodyHeight
    bodyElement.style.width = bodyWidth
    bodyElement.style.height = bodyHeight
    shadowElement.style.width = offsetLeft

    /** 更新滚动条位置和样式 */

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

      scrollbar.style.left = `${scrollerOffset[0]}px`
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

      scrollbar.style.top = `${scrollerOffset[1]}px`
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
    this.#updateScrollbar()
  }

  get scrollTop() {
    return this.#container.scrollTop
  }

  set scrollTop(value: number) {
    this.#container.scrollTop = value
    this.#updateScrollbar()
  }

  get scrollLeft() {
    return this.#container.scrollLeft
  }

  set scrollLeft(value: number) {
    this.#container.scrollLeft = value
    this.#updateScrollbar()
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
if (!customElements.get('table-layout')) {
  customElements.define('table-layout', TableLayout)
}

export default TableLayout
