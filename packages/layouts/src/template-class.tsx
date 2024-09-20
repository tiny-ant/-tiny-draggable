import React from 'react'

interface IProps {
  color: string
  size?: string
}
interface IState {
  count: number
}

class App extends React.Component<IProps, IState> {
  public readonly state: Readonly<IState> = {
    count: 1,
  }
  public componentDidMount() {
    // todo
  }
  public render() {
    return <div>Hello world</div>
  }
}

export default App
