import { Navigate, RouteObject } from 'react-router-dom'

import Layout from './layouts/defaultLayout'
import Home from './pages/Home'
import Page from './pages/Page'
import TableDemo from './pages/Table'
import Demo1 from './pages/LayoutDemo/demo1'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'dashbox',
        lazy: () => import('./pages/Dashbox'),
      },
      // {
      //   path: 'dashbox/examples/basic',
      //   lazy: () => import('./pages/Dashbox/basic'),
      // },
      // {
      //   path: 'dashbox/examples/layers',
      //   lazy: () => import('./pages/Dashbox/layers'),
      // },
      {
        path: 'page/:id',
        element: <Page />,
      },
      {
        path: 'table/:id',
        element: <TableDemo />,
      },
      {
        path: 'layout/demo1',
        element: <Demo1 />,
      },
      // {
      //   path: '/layout/:layoutId',
      //   render: (...args) => {
      //     console.log(args)
      //     return import('./pages/demo1');
      //   }
      //   // render(...args): React.ReactNode { console.log(args); return <div>Layout演示</div> },
      // },
      // {
      //   path: '/404',
      //   render() {
      //     return <div>这是404页面</div>
      //   },
      // },
      {
        // 重定向至首页
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
]

export default routes
