

interface Props {
  name: string;
};

// TODO: 参考墨刀设计

const Component = (props: Props) => {
  const { name } = props

  return (
    <div className="screen-viewport">
    </div>
  )
}

export default Component
