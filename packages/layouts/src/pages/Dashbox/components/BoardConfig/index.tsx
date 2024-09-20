import { useState } from 'react'

interface Props {
  name: string
}

const Component = (props: Props) => {
  const { name } = props

  const [smoothDrag, setSmoothDrag] = useState(false)
  const [limitBounds, setLimitBounds] = useState(false)

  const changeSmoothDrag = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = ev.target
    setSmoothDrag(checked)
  }

  const changeLimitBounds = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = ev.target
    setLimitBounds(checked)
  }

  return (
    <div>
      <label>
        <input type="checkbox" checked={smoothDrag} onChange={changeSmoothDrag} />
        <span>平滑拖动</span>
      </label>
      <label>
        <input type="checkbox" checked={limitBounds} onChange={changeLimitBounds} />
        <span>不允许超出边界</span>
      </label>
    </div>
  )
}

export default Component
