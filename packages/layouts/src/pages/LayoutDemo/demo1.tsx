import Layout from '~/components/Layout'
import './demo1.less'

const { Header, Sider, Content, Footer } = Layout

const Demo1 = () => {
  return (
    <div>
      <div>Layout demo</div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右</div>
        <div className="demo-box">
          <Layout>
            <Sider width="200" />
            <Content>这是内容</Content>
          </Layout>
        </div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">上下</div>
        <div className="demo-box">
          <Layout>
            <Header></Header>
            <Content></Content>
          </Layout>
        </div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">上下+左右</div>
        <div className="demo-box">
          <Layout>
            <Header></Header>
            <Layout>
              <Sider></Sider>
              <Content></Content>
            </Layout>
          </Layout>
        </div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右+上下</div>
        <div className="demo-box">
          <Layout>
            <Sider></Sider>
            <Layout>
              <Header></Header>
              <Content></Content>
            </Layout>
          </Layout>
        </div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右+上中下</div>
        <div className="demo-box">
          <Layout>
            <Sider></Sider>
            <Layout>
              <Header></Header>
              <Content></Content>
              <Footer></Footer>
            </Layout>
          </Layout>
          </div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右布局</div>
        <div className="demo-box"></div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右布局</div>
        <div className="demo-box"></div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右布局</div>
        <div className="demo-box"></div>
      </div>
      <div className="demo-wrapper">
        <div className="demo-wrapper-header">左右布局</div>
        <div className="demo-box"></div>
      </div>
    </div>
  )
}

export default Demo1
