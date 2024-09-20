import { HTMLAttributes } from 'react'
import './Resizer.less'

type Props = HTMLAttributes<HTMLSpanElement>

export default function Resizer(props: Props) {
  return (
    <div className="resize-handle">
      <span className="resize-point resize-t" data-direction="t" {...props} />
      <span className="resize-point resize-r" data-direction="r" {...props} />
      <span className="resize-point resize-b" data-direction="b" {...props} />
      <span className="resize-point resize-l" data-direction="l" {...props} />
      <span className="resize-point resize-tr" data-direction="tr" {...props} />
      <span className="resize-point resize-br" data-direction="br" {...props} />
      <span className="resize-point resize-bl" data-direction="bl" {...props} />
      <span className="resize-point resize-tl" data-direction="tl" {...props} />
    </div>
  )
}
