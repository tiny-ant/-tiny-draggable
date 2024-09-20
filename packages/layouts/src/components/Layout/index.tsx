import classnames from 'classnames'
import './index.css'

export default function Layout(
  props: React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
  }>
) {
  const { className, style, children } = props
  const hasSider =
    Array.isArray(children) && children.some((child: any) => child && child.type === Layout.Sider)

  return (
    <div
      className={classnames('lnk-layout flexed flex-auto', className, {
        'flex-row': hasSider,
      })}
      style={style}
    >
      {children}
    </div>
  )
}

Layout.Header = function Header(
  props: React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
  }>
) {
  const { className, style, children } = props
  return (
    <header className={classnames('lnk-layout-header flex-col', className)} style={style}>
      {children}
    </header>
  )
}

Layout.Sider = function Header(
  props: React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
    width?: string | number
  }>
) {
  const { className, style, width: propWidth, children } = props
  const { width: styleWidth = '200px', ...restStyle } = style || {}
  let width

  if (Number.isFinite(propWidth)) {
    // numeric value, default to a `px` unit
    width = `${propWidth}px`
  } else if (propWidth !== undefined) {
    // with unit
    width = propWidth
  } else {
    width = styleWidth
  }

  return (
    <aside
      className={classnames('lnk-layout-sider flex-col', className)}
      style={{ ...restStyle, width }}
    >
      {children}
    </aside>
  )
}

Layout.Content = function Header(
  props: React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
  }>
) {
  const { className, style, children } = props

  return (
    <main className={classnames('lnk-layout-content rel flex-auto', className)} style={style}>
      {children}
    </main>
  )
}

Layout.Footer = function Header(
  props: React.PropsWithChildren<{
    className?: string
    style?: React.CSSProperties
  }>
) {
  const { className, style, children } = props
  return (
    <footer className={classnames('lnk-layout-footer flex-col', className)} style={style}>
      {children}
    </footer>
  )
}
