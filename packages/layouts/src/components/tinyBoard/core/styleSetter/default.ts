import { Rect } from '../types'

/**
 * layoutRect => style存储格式 转换器
 * NOTE: 该转换器始终应用于正在被拖拽或resizing的元素
 */
export default (rect: Rect): React.CSSProperties => {
  return {
    position: 'absolute',
    ...rect,
  }
}
