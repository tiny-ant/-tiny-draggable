import { ifXRangeCoincide, getCollidedRects, getOrderedBelowRects } from '../../util'
import { InstanceRef, PluginHooks, LayoutRect } from '../../types'

/**
 * 获取矩形rect在**水平线maxTop上方区域**的最大上浮位置（与集合rects进行垂直碰撞检测）
 * 例如使某个矩形 R 上浮到离它最近的矩形 T 下方（紧靠于T下边沿）:
 * R.top = getFloatUpLinePos(R, rects, R.top)
 */
const getFloatUpLinePos = (rect: LayoutRect, rects: LayoutRect[], maxTop: number) => {
  let maxValue = 0

  rects.forEach((r) => {
    if (ifXRangeCoincide(r, rect, 1)) {
      const floatTop = r.top + r.height
      // +0.5修复误差 (之所以是+0.5而不是-0.5，就是当矩形重叠小于0.5像素时可以避免发生位置交换，仍然视为无碰撞并紧靠在一起的情况，并尝试修复误差)
      if (floatTop > maxValue && floatTop <= maxTop + 0.5) {
        maxValue = floatTop
      }
    }
  })

  return maxValue
}

// const getFloatDownLinePos = (rect: LayoutRect, rects: LayoutRect[], maxBottom: number) => {
//   let minValue = 0

//   rects.forEach(r => {
//     const floatPos = r.top

//     if (floatPos < minValue && floatPos >= maxBottom - 0.5) {
//       if (ifXRangeCoincide(r, rect)) {
//         minValue = floatPos
//       }
//     }
//   })

//   return minValue
// }

// 从上到下依次将发生碰撞的矩形向下移动
// TODO: 优化算法（排序过后的矩形，并不需要检测每一个矩形，当某个矩形未发生碰撞时，如果其top小于当前矩形的bottom，则后面所有矩形都不会与之产生碰撞）
const moveCollidedRects = (rects: LayoutRect[]) => {
  // 复杂度: O(n^2)，可以优化到O(n)
  rects.forEach((rect, index) => {
    // 注意判断碰撞先要排除自己
    const collidedRects = getCollidedRects(rect, rects.slice(index + 1), 1.5)

    if (collidedRects.length > 0) {
      collidedRects.forEach((r) => {
        r.top = rect.top + rect.height
      })
    }
  })
}

// 对belowRects集合中的每个矩形执行上浮操作
// NOTE! 必须从上到下有序地进行上浮，因为无法提前知道下方矩形能否上浮或者上浮多少，并且，不同块上浮的位移有可能不一样！
const compactRects = (belowRects: LayoutRect[] = [], rects: LayoutRect[] = []) => {
  belowRects.forEach((r) => {
    r.top = getFloatUpLinePos(r, rects, r.top)
  })
}

export default function useCompactLayout<T>(_: InstanceRef<T>, hooks: PluginHooks<T>) {
  const { updateIndicator } = hooks

  // TODO: 待优化：测试拖拽体验，整块拖拽和限制顶部标题栏拖拽（同时要注意这两种情况下从外部拖放是否体验一致），触发位置交换的逻辑是否合理
  hooks.layoutHandler = (dragRect: LayoutRect | null, layoutRects: LayoutRect[]) => {
    // layoutRects.sort((r1, r2) => r1.top + r1.height >= r2.top + r2.height ? 1 : -1) // TODO: 优化，内部状态记录是否已排过序

    // 两种场景：1. 取消拖放 2. 整理布局
    if (dragRect === null) {
      moveCollidedRects(layoutRects)
      compactRects(layoutRects, layoutRects)
      return
    }
    const shadowRect = updateIndicator(dragRect)

    // 先floatUp原shadowRect上方的 (应该根据上次的point坐标取出矩形集合?)
    compactRects(layoutRects, [shadowRect, ...layoutRects]) // this is necessary

    // TODO: 如果未发生碰撞，应该直接返回以节省计算资源，如果栅格设置很大，可能导致上下交换的灵敏度变差？ 测试：栅格大小超过矩形块的场景
    const collidedRects = getCollidedRects(dragRect, layoutRects, 1.5)

    let shouldShadowFloatUp = true

    if (collidedRects.length > 0) {
      let maxTop = 0

      collidedRects.forEach((r) => {
        const xRangeCoincideLengthWithShadowRect = Math.min(
          r.left + r.width - shadowRect.left,
          shadowRect.left + shadowRect.width - r.left
        )
        // TODO: 测试：如果栅格设置得比较大，灵敏度太差，如果未使用栅格，灵敏度又过高，应该有一个阈值配置来调整灵敏度
        const isReallyCollided = xRangeCoincideLengthWithShadowRect > 0 // 如果有网格对齐，需要与指示块检测碰撞

        if (isReallyCollided) {
          // NOTE: 假如r的高度很小，比如说20px，一碰撞就会被挤下去，可以再加个重叠比率（>= 30 || dragRect.top - r.top > r.height * 0.75），不过交互体验几乎无影响
          // 指示块下移
          if (dragRect.top - r.top >= 30) {
            r.top = getFloatUpLinePos(r, layoutRects, r.top) // （可能发生）上下交换，此时先上浮r (下方的矩形将在最后批量计算上浮）
            maxTop = Math.max(maxTop, r.top + r.height)
            shouldShadowFloatUp = false
          } else {
            // 指示块上浮
            const floatPos = getFloatUpLinePos(shadowRect, layoutRects, shadowRect.top)

            maxTop = Math.max(maxTop, floatPos)
          }
        } else {
          console.log('%c-------------------', 'background: yellow;')
        }
      })

      shadowRect.top = maxTop
    }

    if (shouldShadowFloatUp) {
      shadowRect.top = getFloatUpLinePos(shadowRect, layoutRects, dragRect.top) // 直线上浮到最近的矩形下方
    }
    updateIndicator(shadowRect)

    const belowRects = getOrderedBelowRects(shadowRect.top, layoutRects, 1.5)
    moveCollidedRects([shadowRect, ...belowRects])
    compactRects(belowRects, [shadowRect, ...layoutRects]) // TODO: 这里参数传得有点冗余
  }
}
