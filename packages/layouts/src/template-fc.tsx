
interface Props {
  name: string;
};

const Component = (props: Props) => {
  const { name } = props

  return (
    <div>{name}</div>
  )
}

export default Component
