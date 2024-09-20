/**
 * 自定义组件属性
 */
export interface ScrollContainerProps {
  /** 是否隐藏滚动槽（隐藏后不可交互，无法通过点击滚动到指定位置） */
  'no-track'?: boolean
  /** 是否自动隐藏（鼠标离开滚动槽后自动隐藏滚动条） */
  'auto-hide'?: boolean
  /** 滚动条最小长度（不小于16） */
  'min-size'?: number
  /** 滚动条与容器内边界之间的空隙大小，范围0~5 */
  'track-gap'?: number
  /** 横向滚动槽的超始结束位置偏移（与容器左边界、右边界距离）用逗号分隔，默认为`0,0` */
  'offset-x'?: number | `${number}` | `${number},${number}`
  /** 纵向滚动槽的超始结束位置偏移（与容器上边界、下边界距离）用逗号分隔，默认为`0,0` */
  'offset-y'?: number | `${number}` | `${number},${number}`
}

export interface ScrollEvent {
  top: number
  left: number
}

export interface ScrollContainerEventMap extends HTMLElementEventMap {
  scroll: CustomEvent<ScrollEvent>
}
