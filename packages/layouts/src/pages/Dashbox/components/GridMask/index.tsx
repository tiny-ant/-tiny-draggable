import { useMemo } from 'react'

interface Props {
  /** 网格列数 */
  columns: number
  deg?: number
  bgColor?: string
  dashColor?: string
}

const GridMask = (props: Props) => {
  const {
    columns,
    deg = 45,
    bgColor = 'rgba(255, 255, 255, 1)',
    dashColor = 'rgba(64, 72, 255, 0.65)',
  } = props

  if (columns <= 1) {
    throw Error('invalid props values: `columns` must be a integer greater than 1')
  }

  const style: React.CSSProperties = useMemo(() => {
    const backgroundColor = dashColor

    // repeating-linear-gradient(130deg,#79b,#79b 15px,#58a 0,#58a 30px)
    const backgroundImage = `linear-gradient(90deg, ${bgColor} 50%, transparent 50%), repeating-linear-gradient(${deg}deg, rgba(255,255,255,.35), rgba(255,255,255,.35) 15px, transparent 0, transparent 30px)`

    console.log(backgroundColor)
    const backgroundSize = `${100 / columns}% 100%, auto auto`

    return {
      backgroundColor,
      backgroundImage,
      backgroundSize,
    }
  }, [columns, deg, bgColor, dashColor])

  return <div className="abs-fill" style={style} />
}

export default GridMask
