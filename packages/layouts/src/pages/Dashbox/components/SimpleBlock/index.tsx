
export default function(props: { name: string }) {
  const { name } = props

  return (
    <div className="simple-grid-item">
      <span className="text">{name}</span>
      <span className="resizable-handle"></span>
    </div>
  )
}
