import { RouteComponentProps } from 'react-router-dom'
import Resizable from '~/components/Resizable'
import './index.less'

type Props = RouteComponentProps<{ id: string }>

export default function Page(props: Props) {
  const {
    match: {
      params: { id },
    },
  } = props

  console.log('page props: ', props)

  return (
    <div>
      <h3>page id is : {id}</h3>
      <div className="box" style={{ width: '800px', height: '400px', border: '2px solid gray' }}>
        <Resizable>
          <div className="inner-wrap" style={{ width: '100%', height: '100%' }}>
            <div className="square">
              <div className="square-content"></div>
            </div>
          </div>
        </Resizable>
      </div>
    </div>
  )
}
