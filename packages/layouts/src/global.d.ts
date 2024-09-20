// type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE'

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

type IAnyObject<T = any> = Record<string, T>

type IAnyFunc<T = void> = (...args: Array<any>) => T

interface IResponse<T> {
  status: number // 0 表示成功
  data: T extends null ? null : T
  errMsg: string
}

declare const __POWERED_BY_WUJIE__: boolean

declare interface Window {
  __POWERED_BY_WUJIE__: boolean

  EventBus: EventBus
}
