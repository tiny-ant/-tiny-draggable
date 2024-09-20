export default function component(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { children } = props
  return <div>{children}</div>
}
