export default function Mask(props: { hidden: boolean; children: JSX.Element }) {
  const { hidden = true, children = <div className="box-child" /> } = props

  useImperativeHandle(ref, () => {
    return {
      ref: maskRef.current,
      show() {
        if (!maskRef.current) {
          return
        }
        if (maskRef.current.hasAttribute('hidden')) {
          maskRef.current.removeAttribute('hidden')
        }
        console.log('%c mask showed', 'background: green;color: white')
      },
      hide() {
        if (!maskRef.current) {
          return
        }

        maskRef.current.setAttribute('hidden', '')
        maskRef.current.setAttribute('style', '')
        console.log('%c mask hidden', 'background: blue;color: white')
      },
      update(style: React.CSSProperties) {
        // 由于指示层的更新是非常频繁的，这里直接修改原生DOM样式，避免触发不必要的react render过程
        requestAnimationFrame(() => {
          if (maskRef.current) {
            Object.assign(maskRef.current.style, style)
          }
        })
      },
    }
  })

  return (
    <div className="box-mask" hidden={hidden}>
      {children}
    </div>
  )
}
