/**
 * 匀速动画控制
 * @param {*} obj 操作的目标对象，可以是DOM元素，或者普通的JSON对象
 * @param {*} prop 要控制的目标对象属性
 * @param {*} duration 动画持续时间（单位：毫秒）
 * @param {*} callback 动画结束回调
 * @example
 * animateProp(divElement, { scrollTop: 100, scrollLeft: 100 }, 3000) // 滚动动画
 * animateProp(audioElement, { volume: 1 }, 3000) // 开始播放，音量动画渐变到1
 */
export function animateProp<T extends P, P extends Record<string, number>>(
  obj: T,
  prop: P,
  duration: number,
  callback = () => ({})
) {
  const start = Date.now()
  const diff = Object.create(null)
  const init = Object.create(null)
  let keys: (keyof P)[] = Object.keys(prop)

  keys = keys.filter((key) => {
    init[key] = obj[key]
    diff[key] = prop[key] - obj[key]
    return diff[key] !== 0
  })

  if (keys.length === 0) {
    callback()
    return
  }

  function step() {
    let rate = 1
    const now = Date.now()

    if (now - start < duration) {
      rate = Math.min((now - start) / duration, 1)
    }

    keys.forEach((key) => {
      // console.log(key + ' = ' + init[key] + ' + ' + rate + ' * ' + diff[key] + '( ' + start + ', ' + now + ' )')
      obj[key] = init[key] + rate * diff[key]
      // console.log(el[key])
    })

    if (rate < 1) {
      setTimeout(step, 20)
    } else {
      callback()
    }
  }

  step()
}
