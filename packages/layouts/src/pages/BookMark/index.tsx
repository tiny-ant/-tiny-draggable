import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Layout from '~/components/Layout'

const { Content, Sider } = Layout

interface Props {
  name: string
}

const BookMarkApp: React.FC<Props> = (props: any) => {
  const { name } = props

  return (
    <Layout>
      <Sider>侧栏</Sider>
      <Content>{name}</Content>
    </Layout>
  )
}

const actions = {
  saveBookmark(value: any) {
    return (dispatch: Dispatch) => {
      dispatch({
        type : 'SAVE_BOOKMARK',
        data : value
      })
    }
  }
}

function mapStateToProps (state: any) {
  return { bookmarks: state.bookmark }
}

function mapDispatchToProps (dispatch: Dispatch) {
  return bindActionCreators(actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(BookMarkApp)
