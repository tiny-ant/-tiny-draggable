export interface Vector2D {
  x: number
  y: number
}

/**
 * 获取二维向量的角度方向（旋转角度）
 * @param v
 * @return 角度数值，范围为-180 ~ +180
 *
 * @example
 * getVectorAngle({ x: Math.sqrt(3), y: 1 }) // 30
 */
export function getVectorAngle(v: Vector2D) {
  Math.round((Math.atan2(v.y, v.x) * 180) / Math.PI)
}

/**
 * 获取二维向量的模（即向量的长度）
 * @param v
 */
export function getVectorSize(v: Vector2D) {
  return Math.round(Math.sqrt(v.x * v.x + v.y * v.y))
}
