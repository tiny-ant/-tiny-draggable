import React from 'react'

interface Props {
  name: string
}

const Component: React.FC<Props> = (props) => {
  const { name } = props

  return <div>{name}</div>
}

export default Component
