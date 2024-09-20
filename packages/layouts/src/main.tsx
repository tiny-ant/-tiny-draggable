import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
// import { BrowserRouter } from 'react-router-dom'
// import configureStore from './configureStore'
import Events from '@tiny/events'
import './iconfont'
import { store } from './store'
import App from './App'

// TODO: eslint no-duplicate-imports 如何解决类型与组件同时import问题？

window.EventBus = new Events()
window.React = React
// console.log('App = ', App)

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <Provider store={store}>
        {/* <BrowserRouter future={{ v7_startTransition: true }}> */}
        <App />
        {/* </BrowserRouter> */}
      </Provider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
)
